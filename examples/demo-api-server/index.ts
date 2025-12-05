import express from "express";
import cors from "cors";
import { x402FlashMiddleware } from "@x402-flash/stellar-sdk";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import http from "http";

dotenv.config({ path: "../../.env" });

// Validate required environment variables
const requiredEnvVars = ["CONTRACT_ID", "SERVER_SECRET_KEY", "PAYMENT_ADDRESS"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("\n❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\n📋 Setup instructions:");
  console.error(
    "   1. Generate keys: stellar keys generate server --network testnet"
  );
  console.error("   2. Update .env file with CONTRACT_ID and keys");
  console.error(
    "   3. Fund your account: curl 'https://friendbot.stellar.org?addr=YOUR_ADDRESS'"
  );
  console.error("\n📚 See: examples/DEMO_README.md for full setup guide\n");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Middleware
app.use(cors());
app.use(express.json());

// Metrics storage
interface Metric {
  id: string;
  timestamp: number;
  method: "flash" | "standard";
  latency: number;
  endpoint: string;
  status: "success" | "failed";
}

const metrics: Metric[] = [];

// Configure x402-flash middleware (updated API)
const paymentMiddleware = x402FlashMiddleware(
  {
    rpcUrl:
      process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE ||
      "Test SDF Network ; September 2015",
    contractId: process.env.CONTRACT_ID!,
    secretKey: process.env.SERVER_SECRET_KEY!,
    paymentAddress: process.env.PAYMENT_ADDRESS!,
  },
  {
    // Simple price format
    "POST /api/weather": "10000", // 0.001 XLM

    // Full configuration format with description
    "POST /api/premium-data": {
      price: "100000", // 0.01 XLM
      token: process.env.TOKEN_ADDRESS || "native",
      network: "stellar-testnet",
      config: {
        description: "Access to premium market data",
        mimeType: "application/json",
        maxTimeoutSeconds: 60,
      },
    },
  }
);

// WebSocket connections
const clients = new Set<any>();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("WebSocket client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket client disconnected");
  });
});

function broadcastMetric(metric: Metric) {
  const message = JSON.stringify({ type: "metric", data: metric });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Demo status
app.get("/api/demo/status", (req, res) => {
  res.json({
    success: true,
    data: {
      server: "running",
      payments: "enabled",
      contract: process.env.CONTRACT_ID,
      network: "testnet",
    },
    timestamp: Date.now(),
  });
});

// Weather API with x402-flash payment
app.post("/api/weather", paymentMiddleware, (req, res) => {
  const startTime = Date.now();
  const location = req.body?.location || "San Francisco";

  // Simulate weather data
  const weatherData = {
    location,
    temperature: 15 + Math.floor(Math.random() * 20),
    conditions: ["Sunny", "Cloudy", "Rainy", "Windy"][
      Math.floor(Math.random() * 4)
    ],
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 20),
  };

  const latency = Date.now() - startTime;
  const metric: Metric = {
    id: `flash-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    method: "flash",
    latency,
    endpoint: "/api/weather",
    status: "success",
  };

  metrics.push(metric);
  broadcastMetric(metric);

  res.json({
    success: true,
    data: weatherData,
    timestamp: Date.now(),
    latency,
  });
});

// Standard weather API (without payment channel)
app.post("/api/weather-standard", async (req, res) => {
  const startTime = Date.now();
  const location = req.body?.location || "San Francisco";

  // Simulate blockchain transaction delay
  await new Promise((resolve) =>
    setTimeout(resolve, 3000 + Math.random() * 2000)
  );

  const weatherData = {
    location,
    temperature: 15 + Math.floor(Math.random() * 20),
    conditions: ["Sunny", "Cloudy", "Rainy", "Windy"][
      Math.floor(Math.random() * 4)
    ],
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 20),
  };

  const latency = Date.now() - startTime;
  const metric: Metric = {
    id: `standard-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    method: "standard",
    latency,
    endpoint: "/api/weather-standard",
    status: "success",
  };

  metrics.push(metric);
  broadcastMetric(metric);

  res.json({
    success: true,
    data: weatherData,
    timestamp: Date.now(),
    latency,
  });
});

// Premium data API
app.post("/api/premium-data", paymentMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      premium: true,
      value: Math.random() * 10000,
      insights: [
        "Market trend analysis",
        "Predictive modeling data",
        "Real-time analytics",
      ],
    },
    timestamp: Date.now(),
  });
});

// Speed test endpoint
app.post("/api/speedtest/run", async (req, res) => {
  const iterations = req.body?.iterations || 10;
  const results: any[] = [];

  for (let i = 0; i < iterations; i++) {
    // Flash test
    const flashStart = Date.now();
    // Simulate instant payment
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.random() * 50)
    );
    results.push({
      id: `flash-${Date.now()}`,
      method: "flash",
      latency: Date.now() - flashStart,
      timestamp: Date.now(),
      status: "success",
    });

    // Standard test
    const standardStart = Date.now();
    // Simulate blockchain delay
    await new Promise((resolve) =>
      setTimeout(resolve, 3000 + Math.random() * 2000)
    );
    results.push({
      id: `standard-${Date.now()}`,
      method: "standard",
      latency: Date.now() - standardStart,
      timestamp: Date.now(),
      status: "success",
    });
  }

  res.json({
    success: true,
    data: results,
    timestamp: Date.now(),
  });
});

// Get metrics
app.get("/api/metrics", (req, res) => {
  const flashMetrics = metrics.filter((m) => m.method === "flash");
  const standardMetrics = metrics.filter((m) => m.method === "standard");

  const stats = {
    total: metrics.length,
    flash: {
      count: flashMetrics.length,
      avgLatency:
        flashMetrics.reduce((sum, m) => sum + m.latency, 0) /
          flashMetrics.length || 0,
    },
    standard: {
      count: standardMetrics.length,
      avgLatency:
        standardMetrics.reduce((sum, m) => sum + m.latency, 0) /
          standardMetrics.length || 0,
    },
  };

  res.json({
    success: true,
    data: {
      metrics: metrics.slice(-100), // Last 100 metrics
      stats,
    },
    timestamp: Date.now(),
  });
});

// Clear metrics
app.post("/api/metrics/clear", (req, res) => {
  metrics.length = 0;
  res.json({
    success: true,
    timestamp: Date.now(),
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💳 x402-flash payments enabled`);
  console.log(`📝 Contract: ${process.env.CONTRACT_ID}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}/ws`);
});
