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

## 📚 Documentation

- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Tutorial](./docs/TUTORIAL.md)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
