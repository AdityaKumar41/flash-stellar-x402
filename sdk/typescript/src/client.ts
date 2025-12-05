import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
  xdr,
} from '@stellar/stellar-sdk';
import * as nacl from 'tweetnacl';
import { PaymentAuth, X402FlashClientConfig, X402PaymentPayload } from './types';

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
    const account = await this.server.getAccount(this.keypair.publicKey());
    
    const contract = new Contract(this.contractId);
    
    const tx = new TransactionBuilder(account, {
      fee: '10000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'open_escrow',
          nativeToScVal(Address.fromString(this.keypair.publicKey()), { type: 'address' }),
          nativeToScVal(Address.fromString(server), { type: 'address' }),
          nativeToScVal(Address.fromString(token), { type: 'address' }),
          nativeToScVal(BigInt(amount), { type: 'i128' }),
          nativeToScVal(ttlSeconds, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

    tx.sign(this.keypair);

    const response = await this.server.sendTransaction(tx);
    
    // Wait for confirmation
    let txResponse = await this.server.getTransaction(response.hash);
    while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      txResponse = await this.server.getTransaction(response.hash);
    }

    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return response.hash;
    } else {
      throw new Error(`Transaction failed: ${txResponse.status}`);
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
      signature: Buffer.from(signature).toString('hex'),
      publicKey: this.keypair.publicKey(),
    };
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
    // Call contract to get nonce
    // For now, implement client-side tracking
    // TODO: Query contract storage
    return Date.now();
  }

  /**
   * Wrap fetch with x402-flash payment handling
   */
  wrapFetch(fetchFn: typeof fetch = fetch): typeof fetch {
    return async (input: Request | URL | string, init?: RequestInit) => {
      // First attempt without payment
      const firstResponse = await fetchFn(input, init);

      if (firstResponse.status !== 402) {
        return firstResponse;
      }

      // Parse payment requirements
      const paymentReq: any = await firstResponse.json();
      const requirement = paymentReq.accepts?.[0];

      if (!requirement) {
        throw new Error('No payment requirements provided');
      }

      // Check if flash scheme is supported
      if (requirement.scheme !== 'flash') {
        throw new Error('Flash scheme not supported by server');
      }

      // Create payment authorization
      const deadline = Math.floor(Date.now() / 1000) + 60; // 1 minute
      const { auth, signature, publicKey } = await this.createPaymentAuth(
        requirement.payTo,
        requirement.asset,
        requirement.maxAmountRequired,
        deadline
      );

      // Create X-Payment header
      const paymentPayload: X402PaymentPayload = {
        x402Version: 1,
        scheme: 'flash',
        network: requirement.network,
        payload: {
          auth,
          signature,
          publicKey,
        },
      };

      const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

      // Retry with payment
      const headers = new Headers(init?.headers);
      headers.set('X-Payment', paymentHeader);

      return fetchFn(input, { ...init, headers });
    };
  }

  /**
   * Close channel and withdraw escrow
   */
  async closeEscrow(server: string): Promise<string> {
    const account = await this.server.getAccount(this.keypair.publicKey());
    
    const contract = new Contract(this.contractId);
    
    const tx = new TransactionBuilder(account, {
      fee: '10000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'client_close_escrow',
          nativeToScVal(Address.fromString(this.keypair.publicKey()), { type: 'address' }),
          nativeToScVal(Address.fromString(server), { type: 'address' })
        )
      )
      .setTimeout(30)
      .build();

    tx.sign(this.keypair);

    const response = await this.server.sendTransaction(tx);
    return response.hash;
  }

  /**
   * Get current escrow balance
   */
  async getEscrowBalance(server: string): Promise<string> {
    const contract = new Contract(this.contractId);
    
    const account = await this.server.getAccount(this.keypair.publicKey());
    
    const tx = new TransactionBuilder(account, {
      fee: '10000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'current_escrow',
          nativeToScVal(Address.fromString(this.keypair.publicKey()), { type: 'address' }),
          nativeToScVal(Address.fromString(server), { type: 'address' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await this.server.simulateTransaction(tx);
    
    if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
      const result = simulated.result?.retval;
      // Parse i128 result
      return result?.toString() || '0';
    }

    return '0';
  }


}
