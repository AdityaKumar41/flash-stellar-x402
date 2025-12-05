// Quick test to verify Phase 1 SDK exports correctly
import { X402FlashClient, X402FlashServer } from './sdk/typescript/dist/index.js';

console.log('\n🧪 Testing Phase 1 SDK Exports...\n');

// Test 1: Client export
if (typeof X402FlashClient === 'function') {
  console.log('✅ X402FlashClient exported correctly');
} else {
  console.log('❌ X402FlashClient not found');
  process.exit(1);
}

// Test 2: Server export
if (typeof X402FlashServer === 'function') {
  console.log('✅ X402FlashServer exported correctly');
} else {
  console.log('❌ X402FlashServer not found');
  process.exit(1);
}

// Test 3: Client initialization (without network calls)
try {
  const testClient = new X402FlashClient({
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'TEST_CONTRACT_ID',
    secretKey: 'SD4IRBQBSIKDVRR7N2UUXUKCLCE54Z6FXRERUY2QXQ4FOA7LLXII3ZUD',
  });
  console.log('✅ X402FlashClient can be instantiated');
} catch (error: any) {
  console.log('❌ X402FlashClient instantiation failed:', error.message);
  process.exit(1);
}

// Test 4: Server initialization
try {
  const testServer = new X402FlashServer({
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'TEST_CONTRACT_ID',
    secretKey: 'SD4IRBQBSIKDVRR7N2UUXUKCLCE54Z6FXRERUY2QXQ4FOA7LLXII3ZUD',
    paymentAddress: 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  });
  console.log('✅ X402FlashServer can be instantiated');
} catch (error: any) {
  console.log('❌ X402FlashServer instantiation failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Phase 1 SDK: All basic tests passed!\n');
console.log('📝 Note: End-to-end testing requires:');
console.log('   1. Deployed x402-flash contract on Stellar testnet');
console.log('   2. Funded test accounts');
console.log('   3. Valid .env configuration\n');
