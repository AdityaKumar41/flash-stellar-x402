import { APIResponse, SpeedTestResult, Transaction } from "@/types";
import { Keypair } from "@stellar/stellar-sdk";
import * as nacl from "tweetnacl";

class APIService {
  private baseURL: string;
  private demoKeypair: Keypair | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  }

  // Initialize demo keypair for testing
  initDemoKeypair(keypair: Keypair) {
    this.demoKeypair = keypair;
  }

  private async createPaymentHeaders(
    server: string,
    amount: string,
    network: string = "stellar-testnet"
  ): Promise<Record<string, string>> {
    if (!this.demoKeypair) {
      throw new Error("Demo keypair not initialized");
    }

    const contractId = import.meta.env.VITE_CONTRACT_ID;
    const token = "native";
    const nonce = Date.now();
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

    // Create payment auth
    const auth = {
      settlementContract: contractId,
      client: this.demoKeypair.publicKey(),
      server,
      token,
      amount,
      nonce,
      deadline,
    };

    // Create message to sign
    const message = JSON.stringify(auth);
    const messageHash = nacl.hash(Buffer.from(message));

    // Sign with Ed25519
    const signature = nacl.sign.detached(
      messageHash,
      this.demoKeypair.rawSecretKey()
    );

    // Create X-Payment header matching x402 spec
    const paymentPayload = {
      scheme: "flash",
      network: network,
      payload: {
        auth,
        signature: Buffer.from(signature).toString("hex"),
        publicKey: this.demoKeypair.publicKey(),
      },
    };

    return {
      "X-Payment": Buffer.from(JSON.stringify(paymentPayload)).toString(
        "base64"
      ),
    };
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    includePayment: boolean = false
  ): Promise<APIResponse<T>> {
    try {
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      };

      // Add payment headers if needed
      if (includePayment) {
        const serverAddress = import.meta.env.VITE_SERVER_ADDRESS;
        const amount = "10000"; // 0.001 XLM per request
        const paymentHeaders = await this.createPaymentHeaders(
          serverAddress,
          amount
        );
        headers = { ...headers, ...paymentHeaders };
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  async callWeatherAPI(
    method: "flash" | "standard",
    location?: string
  ): Promise<APIResponse> {
    const endpoint =
      method === "flash" ? "/api/weather" : "/api/weather-standard";
    return this.request(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify({ location }),
      },
      method === "flash" // Only include payment for flash method
    );
  }

  async runSpeedTest(
    iterations: number
  ): Promise<APIResponse<SpeedTestResult[]>> {
    return this.request("/api/speedtest/run", {
      method: "POST",
      body: JSON.stringify({ iterations }),
    });
  }

  async getMetrics(): Promise<
    APIResponse<{
      metrics: Transaction[];
      stats: any;
    }>
  > {
    return this.request("/api/metrics");
  }

  async clearMetrics(): Promise<APIResponse> {
    return this.request("/api/metrics/clear", {
      method: "POST",
    });
  }

  async getDemoStatus(): Promise<APIResponse> {
    return this.request("/api/demo/status");
  }
}

export const apiService = new APIService();
