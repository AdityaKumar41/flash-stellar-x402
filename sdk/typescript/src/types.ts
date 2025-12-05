export interface PaymentAuth {
  settlementContract: string;
  client: string;
  server: string;
  token: string;
  amount: string;
  nonce: number;
  deadline: number;
}

export interface Channel {
  escrowBalance: string;
  token: string;
  openedAt: number;
  lastActivityAt: number;
  ttlSeconds: number;
  state: 'None' | 'Open' | 'PendingClose' | 'Closed';
  closedBy?: string;
  pendingSettlements: number;
}

export interface X402FlashClientConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  secretKey: string;
}

export interface X402FlashServerConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  secretKey: string;
  paymentAddress: string;
}

export interface X402PaymentRequirements {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: any;
  }>;
  error?: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: 'flash';
  network: string;
  payload: {
    auth: PaymentAuth;
    signature: string;
    publicKey: string;
  };
}
