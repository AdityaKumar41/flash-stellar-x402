# Simple Chatbot - Phase 2 Example

This example demonstrates the complete Phase 2 AI agent monetization flow using OpenAI.

## What This Shows

- ✅ **BaseAgent** extension (OpenAIAgent)
- ✅ **AgentServer** wrapping the agent
- ✅ **x402-flash** payment integration
- ✅ **AgentClient** for consuming agents
- ✅ Automatic cost calculation
- ✅ Streaming responses
- ✅ Usage tracking

## Setup

1. **Add OpenAI API Key** to your `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Run the Example

### Terminal 1: Start the Agent Server

```bash
npm run start:server
```

This will:
- Initialize the OpenAI agent
- Start server on port 3001
- Enable x402-flash payments
- Provide multiple endpoints

### Terminal 2: Run the Client

```bash
npm run start:client
```

This will:
- Open a payment channel
- Get agent metadata
- Estimate costs
- Make a paid request
- Show usage stats
- Test streaming

## How It Works

### Server Side (Agent Provider)

```typescript
// 1. Create an agent by extending BaseAgent
const agent = new OpenAIAgent(apiKey, 'gpt-4', stellarAddress);

// 2. Wrap it with AgentServer
const server = new AgentServer(agent, {
  port: 3001,
  stellar: { /* x402-flash config */ },
});

// 3. Start serving!
await server.start();
```

### Client Side (Agent Consumer)

```typescript
// 1. Create AgentClient
const client = new AgentClient({
  stellar: { /* x402-flash config */ },
  autoOpenChannel: true,
});

// 2. Call agents with automatic payments
const response = await client.call(agentEndpoint, {
  capability: 'text_generation',
  input: 'Hello!',
});

// Payments happen automatically via x402-flash!
```

## Features Demonstrated

### 1. Automatic Payment Handling
- Client opens channel once
- Each request includes payment
- Server responses immediately
- Settlement happens async on-chain

### 2. Token-Based Pricing
- Cost calculated based on actual token usage
- Different rates for input/output tokens
- Transparent cost estimation

### 3. Multiple Endpoints
- `/execute` - Standard request/response
- `/stream` - Server-sent events
- `/estimate` - Cost prediction
- `/metadata` - Agent information
- `/stats` - Usage statistics

### 4. Built-in Features
- Rate limiting
- Usage tracking
- Health checks
- CORS support

## Pricing Model

This example uses **PER_TOKEN** pricing:
- Input tokens: 100 stroops / 1K tokens
- Output tokens: 150 stroops / 1K tokens

Modify in `server.ts` to use different models:
- `PER_REQUEST` - Fixed price per call
- `PER_SECOND` - Time-based
- `CUSTOM` - Your own logic

## Next Steps

1. **Try other capabilities**:
   - Code generation
   - Function calling
   - Different models

2. **Create your own agent**:
   extend `BaseAgent`

3. **Add more integrations**:
   - Anthropic (Claude)
   - Custom models
   - LangChain

4. **Deploy to production**:
   - Use proper token addresses
   - Set up monitoring
   - Configure rate limits

## See Also

- [Phase 2 Specification](../../Phase2.md)
- [Core Package Docs](../../packages/core/)
- [Server Package Docs](../../packages/server/)
- [Client Package Docs](../../packages/client/)
