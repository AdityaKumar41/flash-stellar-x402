# Contributing to x402-Flash SDK

Thank you for your interest in contributing to the x402-Flash SDK!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## Project Structure

- `contracts/` - Soroban smart contracts (Rust)
- `sdk/` - Client SDKs (TypeScript)
- `packages/` - Phase 2+ components
- `examples/` - Example implementations
- `scripts/` - Deployment and utility scripts
- `docs/` - Documentation

## Making Changes

### Smart Contracts

1. Make changes in `contracts/x402-flash-settlement/src/`
2. Run tests: `cargo test`
3. Build: `cargo build --target wasm32-unknown-unknown --release`
4. Test deployment on testnet before submitting PR

### TypeScript SDK

1. Make changes in `sdk/typescript/src/`
2. Update types in `types.ts` if needed
3. Add tests
4. Build: `npm run build`
5. Test with examples

### Documentation

- Update relevant docs in `docs/`
- Add code examples where appropriate
- Keep README.md in sync with changes

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes with clear commit messages
3. Add tests for new functionality
4. Update documentation
5. Push to your fork and create a PR
6. Address review feedback

## Code Style

- **Rust**: Follow standard Rust conventions, use `cargo fmt`
- **TypeScript**: Use Prettier configuration, run `npm run format`
- Write clear comments for complex logic
- Use descriptive variable names

## Testing

- Write unit tests for new functions
- Add integration tests for end-to-end flows
- Test on Stellar testnet before mainnet

## Versioning

We use [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes

## Questions?

Open an issue or join our [Discord](https://discord.gg/stellar).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
