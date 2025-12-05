import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import * as nacl from "tweetnacl";
import {
  PaymentAuth,
  X402FlashClientConfig,
  X402PaymentPayload,
} from "./types.js";

export class X402FlashClient {
  private server: SorobanRpc.Server;
  private keypair: Keypair;
  private contractId: string;
  private networkPassphrase: string;

  constructor(config: X402FlashClientConfig) {
    this.server = new SorobanRpc.Server(config.rpcUrl);
    this.keypair = Keypair.fromSecret(config.secretKey);
    this.contractId = config.contractId;
    this.networkPassphrase = config.networkPassphrase;
  }

  /**
   * Open payment channel with escrow
   */
  async openEscrow(
    server: string,
    token: string,
    amount: string,
    ttlSeconds: number
  ): Promise<string> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());

      const contract = new Contract(this.contractId);

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "open_escrow",
            nativeToScVal(Address.fromString(this.keypair.publicKey()), {
              type: "address",
            }),
            nativeToScVal(Address.fromString(server), { type: "address" }),
            nativeToScVal(Address.fromString(token), { type: "address" }),
            nativeToScVal(BigInt(amount), { type: "i128" }),
            nativeToScVal(ttlSeconds, { type: "u64" })
          )
        )
        .setTimeout(30)
        .build();

      tx.sign(this.keypair);

      const response = await this.server.sendTransaction(tx);

      // Wait for confirmation
      let txResponse = await this.server.getTransaction(response.hash);
      let attempts = 0;
      const maxAttempts = 30;

      while (
        txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponse = await this.server.getTransaction(response.hash);
        attempts++;
      }

      if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        console.log(`✅ Escrow opened: ${amount} stroops`);
        return response.hash;
      } else if (
        txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
      ) {
        throw new Error("Transaction timeout - not found after 30 seconds");
      } else {
        throw new Error(`Transaction failed with status: ${txResponse.status}`);
      }
    } catch (error) {
      console.error("❌ Failed to open escrow:", error);
      if (error instanceof Error) {
        if (error.message.includes("insufficient_balance")) {
          throw new Error("Insufficient balance for escrow");
        }
        if (error.message.includes("channel_already_exists")) {
          throw new Error("Payment channel already exists with this server");
        }
      }
      throw error;
    }
  }

  /**
   * Create and sign payment authorization
   */
  async createPaymentAuth(
    server: string,
    token: string,
    amount: string,
    deadline: number
  ): Promise<{ auth: PaymentAuth; signature: string; publicKey: string }> {
    try {
      // Get current nonce
      const nonce = await this.getCurrentNonce();

      const auth: PaymentAuth = {
        settlementContract: this.contractId,
        client: this.keypair.publicKey(),
        server,
        token,
        amount,
        nonce,
        deadline,
      };

      // Create message to sign
      const message = this.serializeAuth(auth);
      const messageHash = nacl.hash(Buffer.from(message));

      // Sign with Ed25519
      const signature = nacl.sign.detached(
        messageHash,
        this.keypair.rawSecretKey()
      );

      return {
        auth,
        signature: Buffer.from(signature).toString("hex"),
        publicKey: this.keypair.publicKey(),
      };
    } catch (error) {
      console.error("Error creating payment authorization:", error);
      throw new Error(
        `Failed to create payment auth: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Serialize payment auth for signing
   */
  private serializeAuth(auth: PaymentAuth): string {
    return JSON.stringify({
      settlementContract: auth.settlementContract,
      client: auth.client,
      server: auth.server,
      token: auth.token,
      amount: auth.amount,
      nonce: auth.nonce,
      deadline: auth.deadline,
    });
  }

  /**
   * Get current nonce for client
   */
  private async getCurrentNonce(): Promise<number> {
    const contract = new Contract(this.contractId);
    const account = await this.server.getAccount(this.keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          "get_nonce",
          nativeToScVal(Address.fromString(this.keypair.publicKey()), {
            type: "address",
          })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await this.server.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
      const result = simulated.result?.retval;
      if (result) {
        // Parse u64 result from ScVal
        return Number(result.u64?.() || 0n);
      }
    }

    // Fallback to 0 if query fails
    return 0;
  }

  /**
   * Wrap fetch with x402-flash payment handling
   * Automatically handles 402 responses and retries with payment
   */
  wrapFetch(fetchFn: typeof fetch = fetch): typeof fetch {
    return async (input: Request | URL | string, init?: RequestInit) => {
      try {
        // First attempt without payment
        const firstResponse = await fetchFn(input, init);

        if (firstResponse.status !== 402) {
          return firstResponse;
        }

        // Parse payment requirements
        const paymentReq: any = await firstResponse.json();

        if (
          !paymentReq.accepts ||
          !Array.isArray(paymentReq.accepts) ||
          paymentReq.accepts.length === 0
        ) {
          throw new Error(
            "Invalid payment requirements: no payment schemes accepted"
          );
        }

        const requirement = paymentReq.accepts[0];

        // Validate x402 version
        if (paymentReq.x402Version !== 1) {
          throw new Error(
            `Unsupported x402 version: ${paymentReq.x402Version}`
          );
        }

        // Check if flash scheme is supported
        if (requirement.scheme !== "flash") {
          throw new Error(
            `Flash scheme not supported. Server requires: ${requirement.scheme}`
          );
        }

        // Validate required fields
        if (
          !requirement.payTo ||
          !requirement.asset ||
          !requirement.maxAmountRequired
        ) {
          throw new Error("Incomplete payment requirements from server");
        }

        // Create payment authorization
        const deadline =
          Math.floor(Date.now() / 1000) + (requirement.maxTimeoutSeconds || 60);
        const { auth, signature, publicKey } = await this.createPaymentAuth(
          requirement.payTo,
          requirement.asset,
          requirement.maxAmountRequired,
          deadline
        );

        // Create X-Payment header (x402 standard format)
        const paymentPayload: X402PaymentPayload = {
          x402Version: 1,
          scheme: "flash",
          network: requirement.network,
          payload: {
            auth,
            signature,
            publicKey,
          },
        };

        const paymentHeader = Buffer.from(
          JSON.stringify(paymentPayload)
        ).toString("base64");

        // Retry with payment
        const headers = new Headers(init?.headers);
        headers.set("X-Payment", paymentHeader);

        const paidResponse = await fetchFn(input, { ...init, headers });

        // Check for payment response header
        const paymentResponseHeader =
          paidResponse.headers.get("X-Payment-Response");
        if (paymentResponseHeader) {
          try {
            const paymentResponse = JSON.parse(
              Buffer.from(paymentResponseHeader, "base64").toString("utf-8")
            );
            if (paymentResponse.success) {
              console.log(`✅ Payment accepted: ${auth.amount} stroops`);
            }
          } catch (e) {
            console.warn("Could not parse payment response header");
          }
        }

        return paidResponse;
      } catch (error) {
        console.error("❌ Payment fetch error:", error);
        throw error;
      }
    };
  }

  /**
   * Close channel and withdraw escrow
   */
  async closeEscrow(server: string): Promise<string> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());

      const contract = new Contract(this.contractId);

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "client_close_escrow",
            nativeToScVal(Address.fromString(this.keypair.publicKey()), {
              type: "address",
            }),
            nativeToScVal(Address.fromString(server), { type: "address" })
          )
        )
        .setTimeout(30)
        .build();

      tx.sign(this.keypair);

      const response = await this.server.sendTransaction(tx);
      console.log(`✅ Escrow closed, funds returned`);
      return response.hash;
    } catch (error) {
      console.error("❌ Failed to close escrow:", error);
      if (
        error instanceof Error &&
        error.message.includes("channel_not_found")
      ) {
        throw new Error("No active channel found with this server");
      }
      throw error;
    }
  }

  /**
   * Get current escrow balance
   */
  async getEscrowBalance(server: string): Promise<string> {
    try {
      const contract = new Contract(this.contractId);

      const account = await this.server.getAccount(this.keypair.publicKey());

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "current_escrow",
            nativeToScVal(Address.fromString(this.keypair.publicKey()), {
              type: "address",
            }),
            nativeToScVal(Address.fromString(server), { type: "address" })
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(tx);

      if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
        const result = simulated.result?.retval;
        // Parse i128 result
        return result?.toString() || "0";
      }

      return "0";
    } catch (error) {
      console.error("Error fetching escrow balance:", error);
      return "0";
    }
  }
}
