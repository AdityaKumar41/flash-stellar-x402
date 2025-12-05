# x402-Flash SDK

> Micropayment infrastructure for Stellar Soroban with AI agent monetization

## 🌟 Overview

The x402-Flash SDK enables instant micropayments using Stellar Soroban smart contracts. Built in phases:

- **Phase 1**: Core settlement infrastructure (smart contracts + TypeScript SDK)
- **Phase 2**: AI agent monetization layer
- **Phase 3**: Advanced marketplace features (planned)

## 📦 Project Structure

```
x402-flash-sdk/
├── contracts/               # Soroban smart contracts
│   └── x402-flash-settlement/
├── sdk/                     # Client SDKs
│   └── typescript/
├── examples/                # Example implementations
│   ├── demo-api-server/
│   ├── demo-client/
│   └── demo-frontend/
├── scripts/                 # Deployment scripts
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Rust & Cargo
- Stellar CLI (`cargo install --locked stellar-cli --features opt`)

### Installation

```bash
# Install dependencies
npm install

# Build contracts
cd contracts/x402-flash-settlement
cargo build --target wasm32-unknown-unknown --release

# Build SDK
cd ../../sdk/typescript
npm run build
```

### Usage

See [examples/](./examples/) for complete usage examples.

## 🎬 Live Demo

Experience x402-flash in action with our interactive demo:

```bash
# One-command setup and start
npm run setup:demo && npm run start:demo
```

Features:

- ⚡ **< 100ms** payment latency
- 🚀 **50x faster** than standard blockchain payments
- 🎨 Beautiful React UI with Freighter wallet integration
- 📊 Real-time metrics and speed tests
- 🔌 Complete payment channel lifecycle demo

👉 **[Full Demo Guide](./examples/DEMO_README.md)** | **[Quick Reference](./QUICK_REFERENCE.md)**

## 📚 Documentation

- **Demo & Getting Started**:
  - [Demo Guide](./examples/DEMO_README.md) - Complete interactive demo
  - [Quick Reference](./QUICK_REFERENCE.md) - Essential commands
  - [Demo Implementation](./DEMO_IMPLEMENTATION.md) - What was built
  - [Getting Started](./docs/GETTING_STARTED.md) - SDK usage guide

- **Architecture & Design**:
  - [Architecture](./docs/ARCHITECTURE.md) - System design
  - [Phase 1: Core Infrastructure](./Phase1.md)
  - [Phase 2: AI Agent Integration](./Phase2.md)
  - [Phase 3: MCP Server](./Phase3.md)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
