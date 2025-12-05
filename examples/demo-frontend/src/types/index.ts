export interface WalletState {
  connected: boolean;
  publicKey: string;
  balance: string;
  network: "testnet" | "mainnet";
}

export interface Channel {
  id: string;
  client: string;
  server: string;
  escrowBalance: string;
  status: "open" | "pending_close" | "closed";
  openedAt: number;
  ttl: number;
}

export interface Transaction {
  hash: string;
  type: "open_channel" | "payment" | "close_channel";
  amount: string;
  timestamp: number;
  status: "pending" | "success" | "failed";
  latency?: number;
}

export interface SpeedTestResult {
  id: string;
  method: "flash" | "standard";
  latency: number;
  timestamp: number;
  status: "success" | "failed";
}

export interface DemoStep {
  id: number;
  title: string;
  description: string;
  status: "pending" | "running" | "success" | "error";
  result?: any;
  error?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
}
