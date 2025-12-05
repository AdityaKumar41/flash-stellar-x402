# Phase-by-Phase Testing Plan

## Phase 1: Core SDK Testing

### Test 1: TypeScript SDK Build ✅
```bash
cd sdk/typescript
npm run build
```
**Status**: PASSED

### Test 2: SDK Type Checking
```bash
cd sdk/typescript
npx tsc --noEmit
```

### Test 3: Demo API Server
```bash
cd examples/demo-api-server
npm install
npm run dev
# Should start on port 3000
```

### Test 4: Demo Client
```bash
cd examples/demo-client
npm install
# Requires contract deployed and .env configured
```

### Test 5: Smart Contract (Pending)
```bash
cd contracts/x402-flash-settlement
cargo check
cargo build --target wasm32-unknown-unknown --release
```
**Status**: Has compilation errors - needs fixing

---

## Phase 2: AI Agent SDK Testing

### Test 1: Core Package ✅
```bash
cd packages/core
npm run build
```
**Status**: PASSED

### Test 2: Server Package ✅
```bash
cd packages/server
npm run build
```
**Status**: PASSED

### Test 3: Client Package ✅
```bash
cd packages/client
npm run build
```
**Status**: PASSED

### Test 4: OpenAI Integration ✅
```bash
cd packages/integrations/openai
npm run build
```
**Status**: PASSED

### Test 5: Chatbot Example
```bash
cd examples/simple-chatbot-phase2
npm install
# Requires OPENAI_API_KEY and contract deployed
npm run start:server
npm run start:client
```

---

## Phase 3: MCP Server Testing

### Test 1: MCP Server Build ⚠️
```bash
cd packages/mcp-server
npm run build
```
**Status**: Has 1 type error - needs fixing

### Test 2: Wallet Setup
```bash
cd packages/mcp-server
npx tsx scripts/setup-wallet.ts
```

### Test 3: Claude Desktop Integration
- Configure claude_desktop_config.json
- Restart Claude Desktop
- Test with prompts

---

## Testing Priority

1. ✅ **Phase 1 SDK** - Verify builds and exports
2. ✅ **Phase 2 Packages** - All build successfully
3. ⚠️ **Phase 3 MCP** - Fix type error first
4. ⚠️ **Phase 1 Contract** - Fix compilation errors
5. 🔄 **Integration Tests** - End-to-end flows
