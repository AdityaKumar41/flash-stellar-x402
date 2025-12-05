import { OpenAIAgent } from '@x402-ai/integrations-openai';
import { AgentServer } from '@x402-ai/server';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function main() {
  // Create OpenAI agent
  const agent = new OpenAIAgent(
    process.env.OPENAI_API_KEY!,
    'gpt-4',
    process.env.PAYMENT_ADDRESS // Stellar address to receive payments
  );

  // Create server
  const server = new AgentServer(agent, {
    port: parseInt(process.env.PORT || '3001'),
    stellar: {
      rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
      networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
      contractId: process.env.CONTRACT_ID!,
      secretKey: process.env.SERVER_SECRET_KEY!,
      paymentAddress: process.env.PAYMENT_ADDRESS!,
    },
    cors: {
      origin: '*',
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
    },
  });

  // Start server
  await server.start();
  
  console.log('🤖 OpenAI Chatbot Agent Ready!');
  console.log('💬 Try: POST http://localhost:3001/execute');
  console.log('📝 Body: { "capability": "text_generation", "input": "Hello!" }');
  console.log('\n💡 Endpoints:');
  console.log('   GET  /health    - Health check');
  console.log('   GET  /metadata  - Agent info');
  console.log('   POST /execute   - Execute agent (with payment)');
  console.log('   POST /stream    - Stream response (with payment)');
  console.log('   POST /estimate  - Cost estimate');
  console.log('   GET  /stats     - Usage stats');
}

main().catch(console.error);
