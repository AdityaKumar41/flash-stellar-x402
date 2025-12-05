import { AgentClient } from '@x402-ai/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function main() {
  const client = new AgentClient({
    stellar: {
      rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
      networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
      contractId: process.env.CONTRACT_ID!,
      secretKey: process.env.CLIENT_SECRET_KEY!,
    },
    autoOpenChannel: true,
    defaultEscrow: '10000000', // 1 XLM
  });

  const agentEndpoint = 'http://localhost:3001';

  console.log('💬 AI Chatbot Client\n');

  try {
    // Get agent info
    const metadata = await client.getMetadata(agentEndpoint);
    console.log('🤖 Agent:', metadata.name);
    console.log('📦 Capabilities:', metadata.capabilities.join(', '));
    console.log('💰 Price:', metadata.pricing.basePrice, 'per', metadata.pricing.model);

    // Estimate cost
    const estimate = await client.estimateCost(agentEndpoint, {
      capability: 'text_generation',
      input: 'What is the meaning of life?',
    });
    console.log('\n💵 Estimated cost:', estimate.estimate);

    // Make call
    console.log('\n🤖 Asking agent...');
    const response = await client.call(agentEndpoint, {
      capability: 'text_generation',
      input: 'What is the meaning of life in 3 sentences?',
      userId: 'user123',
    });

    console.log('\n📝 Response:', response.output);
    console.log('💰 Actual cost:', response.usage?.cost);
    console.log('⚡ Time:', response.usage?.computeTime, 'ms');
    console.log('📊 Tokens:', {
      input: response.usage?.inputTokens,
      output: response.usage?.outputTokens,
    });

    // Check remaining balance
    const balance = await client.getChannelBalance(agentEndpoint);
    console.log('\n💵 Remaining balance:', balance, 'stroops');

    // Try streaming
    console.log('\n\n🌊 Testing streaming...');
    let streamOutput = '';
    await client.callStream(
      agentEndpoint,
      {
        capability: 'text_generation',
        input: 'Count from 1 to 5',
        userId: 'user123',
      },
      (chunk) => {
        streamOutput += chunk;
        process.stdout.write('.');
      }
    );
    console.log('\n📝 Streamed:', streamOutput);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);
