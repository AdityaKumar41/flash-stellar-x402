import express from 'express';
import { x402FlashMiddleware } from '@x402-flash/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const app = express();

// Configure x402-flash middleware
const paymentMiddleware = x402FlashMiddleware(
  {
    rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    contractId: process.env.CONTRACT_ID!,
    secretKey: process.env.SERVER_SECRET_KEY!,
    paymentAddress: process.env.PAYMENT_ADDRESS!,
  },
  {
    'GET /api/weather': {
      price: '10000', // 0.001 XLM or token units
      token: process.env.TOKEN_ADDRESS!,
      network: 'stellar-testnet',
    },
    'GET /api/premium-data': {
      price: '100000', // 0.01 XLM or token units
      token: process.env.TOKEN_ADDRESS!,
      network: 'stellar-testnet',
    },
  }
);

// Apply middleware
app.use(paymentMiddleware);

// Routes
app.get('/api/weather', (req, res) => {
  res.json({
    temperature: 72,
    condition: 'Sunny',
    location: 'San Francisco',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/premium-data', (req, res) => {
  res.json({
    data: 'Premium content here',
    value: Math.random() * 1000,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💳 x402-flash payments enabled`);
  console.log(`📝 Contract: ${process.env.CONTRACT_ID}`);
});
