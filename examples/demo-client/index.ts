import { X402FlashClient } from '@x402-flash/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function main() {
  const client = new X402FlashClient({
    rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    contractId: process.env.CONTRACT_ID!,
    secretKey: process.env.CLIENT_SECRET_KEY!,
  });

  console.log('📦 Opening escrow channel...');
  
  try {
    // Open channel with 1 XLM escrow
    await client.openEscrow(
      process.env.SERVER_ADDRESS!,
      process.env.TOKEN_ADDRESS!,
      '10000000', // 1 XLM = 10^7 stroops
      86400 // 24 hours TTL
    );

    console.log('✅ Channel opened!');

    // Wrap fetch for automatic payment handling
    const paidFetch = client.wrapFetch();

    console.log('\n🌤️  Fetching weather data...');
    const weatherResponse = await paidFetch('http://localhost:3000/api/weather');
    const weatherData = await weatherResponse.json();
    console.log('Weather:', weatherData);

    console.log('\n💎 Fetching premium data...');
    const premiumResponse = await paidFetch('http://localhost:3000/api/premium-data');
    const premiumData = await premiumResponse.json();
    console.log('Premium Data:', premiumData);

    // Check remaining balance
    const balance = await client.getEscrowBalance(process.env.SERVER_ADDRESS!);
    console.log(`\n💰 Remaining escrow: ${balance} stroops`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
