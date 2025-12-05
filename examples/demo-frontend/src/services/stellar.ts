import {
  SorobanRpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, CONTRACT_IDS } from "@/utils/constants";

// Helper function to convert string address to ScVal
function addressToScVal(address: string): any {
  return nativeToScVal(Address.fromString(address), {
    type: "address",
  });
}

// Helper function to convert number to ScVal
function i128ToScVal(value: string): any {
  return nativeToScVal(BigInt(value), { type: "i128" });
}

function u64ToScVal(value: number): any {
  return nativeToScVal(value, { type: "u64" });
}

export class StellarService {
  private server: any;
  private network: "testnet" | "mainnet";

  constructor(network: "testnet" | "mainnet" = "testnet") {
    this.network = network;
    const config =
      STELLAR_CONFIG[network.toUpperCase() as "TESTNET" | "MAINNET"];
    this.server = new SorobanRpc.Server(config.rpcUrl);
  }

  async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.server.getAccount(publicKey);
      const accountBalances: any = account;
      const nativeBalance = accountBalances.balances?.find(
        (b: any) => b.asset_type === "native"
      );
      return nativeBalance?.balance || "0";
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }

  async submitTransaction(tx: any): Promise<string> {
    try {
      const response = await this.server.sendTransaction(tx);

      // Wait for confirmation
      let attempts = 0;
      while (attempts < 30) {
        const txResponse = await this.server.getTransaction(response.hash);

        if (txResponse.status === "SUCCESS") {
          return response.hash;
        } else if (txResponse.status === "FAILED") {
          throw new Error("Transaction failed");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new Error("Transaction timeout");
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async openChannel(
    keypair: any,
    server: string,
    token: string,
    amount: string,
    ttl: number
  ): Promise<string> {
    const account = await this.server.getAccount(keypair.publicKey());
    const contract = new Contract(CONTRACT_IDS.X402_FLASH);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase:
        STELLAR_CONFIG[this.network.toUpperCase() as "TESTNET" | "MAINNET"]
          .networkPassphrase,
    })
      .addOperation(
        contract.call(
          "open_escrow",
          addressToScVal(keypair.publicKey()),
          addressToScVal(server),
          addressToScVal(token),
          i128ToScVal(amount),
          u64ToScVal(ttl)
        )
      )
      .setTimeout(30)
      .build();

    tx.sign(keypair);

    return this.submitTransaction(tx);
  }

  async closeChannel(keypair: any, server: string): Promise<string> {
    const account = await this.server.getAccount(keypair.publicKey());
    const contract = new Contract(CONTRACT_IDS.X402_FLASH);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase:
        STELLAR_CONFIG[this.network.toUpperCase() as "TESTNET" | "MAINNET"]
          .networkPassphrase,
    })
      .addOperation(
        contract.call(
          "client_close_escrow",
          addressToScVal(keypair.publicKey()),
          addressToScVal(server)
        )
      )
      .setTimeout(30)
      .build();

    tx.sign(keypair);

    return this.submitTransaction(tx);
  }

  async getChannelBalance(publicKey: string, server: string): Promise<string> {
    try {
      const account = await this.server.getAccount(publicKey);
      const contract = new Contract(CONTRACT_IDS.X402_FLASH);

      const tx = new TransactionBuilder(account, {
        fee: "100000",
        networkPassphrase:
          STELLAR_CONFIG[this.network.toUpperCase() as "TESTNET" | "MAINNET"]
            .networkPassphrase,
      })
        .addOperation(
          contract.call(
            "current_escrow",
            addressToScVal(publicKey),
            addressToScVal(server)
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(tx);

      if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
        const result = simulated.result?.retval;
        return result?.toString() || "0";
      }

      return "0";
    } catch (error) {
      console.error("Failed to get channel balance:", error);
      return "0";
    }
  }
}

export const stellarService = new StellarService("testnet");
