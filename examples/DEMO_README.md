# 🎬 x402-flash Demo - Complete Guide

Experience lightning-fast micropayments on Stellar with this comprehensive demo!

## ✨ What's Included

### 📦 Components

1. **Demo Frontend** (`examples/demo-frontend/`)
   - Interactive React web app
   - Freighter wallet integration
   - Live payment channel demo
   - Speed test comparisons
   - Real-time metrics

2. **Demo API Server** (`examples/demo-api-server/`)
   - Express.js backend
   - x402-flash payment middleware
   - WebSocket support for real-time updates
   - Multiple API endpoints (weather, premium data)
   - Metrics and analytics

3. **Soroban Smart Contract** (`contracts/x402-flash-settlement/`)
   - Payment channel management
   - Escrow handling
   - Settlement verification
   - Security features

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Rust & Cargo** ([Install](https://rustup.rs/))
- **Stellar CLI** ([Install](https://developers.stellar.org/docs/tools/developer-tools))
- **Freighter Wallet** ([Install](https://www.freighter.app/))

### 1. Run Setup Script

```bash
# From project root
./scripts/setup-demo.sh
```

This will:

- Install all dependencies
- Build the SDK
- Compile the contract
- Create `.env` files
- Set up frontend and backend

### 2. Generate Keys

```bash
# Generate server keypair
stellar keys generate server --network testnet

# Generate client keypair
stellar keys generate client --network testnet
```

### 3. Deploy Contract

```bash
# Deploy to Stellar testnet
npm run deploy:contract

# Note the contract ID returned
```

### 4. Configure Environment

Update `.env` in project root:

```env
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

CONTRACT_ID=<your-contract-id>
TOKEN_ADDRESS=native

SERVER_SECRET_KEY=<server-secret-key>
PAYMENT_ADDRESS=<server-public-key>

CLIENT_SECRET_KEY=<client-secret-key>

PORT=3001
```

Update `examples/demo-frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ID=<your-contract-id>
VITE_SERVER_ADDRESS=<server-public-key>
VITE_STELLAR_NETWORK=testnet
VITE_RPC_URL=https://soroban-testnet.stellar.org
```

### 5. Fund Accounts

Fund your accounts with testnet XLM:

```bash
# Fund server
curl "https://friendbot.stellar.org?addr=<server-public-key>"

# Fund client (or use Freighter)
curl "https://friendbot.stellar.org?addr=<client-public-key>"
```

### 6. Start Demo

**Terminal 1 - API Server:**

```bash
cd examples/demo-api-server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd examples/demo-frontend
npm run dev
```

### 7. Open in Browser

Navigate to: http://localhost:3000

## 🎯 Using the Demo

### Step 1: Connect Wallet

1. Click "Connect Wallet"
2. Approve Freighter connection
3. See your balance and address

### Step 2: Run Live Demo

Click "Run Demo" to see the full payment channel flow:

1. ✅ **Connect Wallet** - Already done
2. ⚡ **Open Channel** - Deposit 0.1 XLM into payment channel
3. 💰 **Make Payment** - Call weather API with instant payment
4. 📊 **Check Balance** - Verify remaining channel balance
5. 🔒 **Close Channel** - Withdraw remaining funds

### Step 3: Run Speed Test

Compare x402-flash vs standard payments:

1. Click "Run Speed Test"
2. Watch real-time comparison
3. See performance metrics:
   - **Flash**: < 100ms
   - **Standard**: 3-5 seconds
   - **Speedup**: ~50x faster!

## 📊 Demo Features

### Interactive Components

- **Hero Section**: Key metrics and value propositions
- **Live Demo**: Step-by-step payment channel flow
- **Speed Test**: Real-time performance comparison
- **Metrics Dashboard**: Analytics and statistics
- **WebSocket Updates**: Real-time payment notifications

### API Endpoints

#### With x402-flash Payment:

- `POST /api/weather` - Get weather data (0.001 XLM)
- `POST /api/premium-data` - Get premium content (0.01 XLM)

#### Without Payment (for comparison):

- `POST /api/weather-standard` - Slow standard payment

#### Utilities:

- `GET /health` - Health check
- `GET /api/demo/status` - Demo status
- `GET /api/metrics` - Performance metrics
- `POST /api/metrics/clear` - Clear metrics

### Frontend Features

- **Wallet Integration**: Freighter wallet support
- **Real-time Updates**: WebSocket connections
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Framer Motion
- **Toast Notifications**: User feedback
- **Performance Tracking**: Built-in analytics

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Demo Frontend (React)              │
│  - Wallet connection                         │
│  - Payment channel UI                        │
│  - Speed tests                               │
│  - Real-time metrics                         │
└──────────────┬──────────────────────────────┘
               │ HTTP/WebSocket
┌──────────────▼──────────────────────────────┐
│        Demo API Server (Express)             │
│  - x402-flash middleware                     │
│  - Payment validation                        │
│  - WebSocket server                          │
│  - Metrics collection                        │
└──────────────┬──────────────────────────────┘
               │ Soroban RPC
┌──────────────▼──────────────────────────────┐
│    x402-flash Settlement Contract            │
│  - Payment channels                          │
│  - Escrow management                         │
│  - Settlement logic                          │
│  - Security checks                           │
└──────────────┬──────────────────────────────┘
               │
         Stellar Testnet
```

## 🔧 Troubleshooting

### Contract Deployment Fails

```bash
# Check Stellar CLI installation
stellar --version

# Ensure account is funded
stellar account get <your-public-key> --network testnet
```

### Wallet Connection Issues

1. Install Freighter: https://www.freighter.app/
2. Switch to testnet in Freighter settings
3. Refresh the page

### API Server Errors

```bash
# Check environment variables
cat .env

# Verify contract ID is set
echo $CONTRACT_ID

# Check server logs for details
cd examples/demo-api-server
npm run dev
```

### Frontend Build Issues

```bash
# Clear cache and reinstall
cd examples/demo-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 Additional Resources

- **Architecture**: `docs/ARCHITECTURE.md`
- **Getting Started**: `docs/GETTING_STARTED.md`
- **Phase 1 Guide**: `Phase1.md`
- **Phase 2 Guide**: `Phase2.md`
- **Phase 3 Guide**: `Phase3.md`

## 🎥 Demo Video

Record your screen showing:

1. Wallet connection
2. Opening payment channel
3. Making instant payments
4. Speed test comparison
5. Closing channel

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue!

## 📄 License

See LICENSE file in repository root.

## 🌟 What's Next?

- Try modifying API prices
- Add new endpoints
- Customize the UI
- Test with real AI agents
- Deploy to production

---

Built with ❤️ on Stellar Soroban
