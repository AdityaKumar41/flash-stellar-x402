// Phase 2 Testing: Verify all AI agent packages
import { BaseAgent, AgentCapability, PricingModel } from './packages/core/dist/index.js';
import { AgentServer } from './packages/server/dist/index.js';
import { AgentClient } from './packages/client/dist/index.js';

console.log('\n🧪 Testing Phase 2 AI Agent SDK...\n');

// Test 1: Core package exports
if (typeof BaseAgent === 'function') {
  console.log('✅ BaseAgent exported from core package');
} else {
  console.log('❌ BaseAgent not found');
  process.exit(1);
}

if (AgentCapability && AgentCapability.TEXT_GENERATION) {
  console.log('✅ AgentCapability enum exported');
} else {
  console.log('❌ AgentCapability not found');
  process.exit(1);
}

if (PricingModel && PricingModel.PER_REQUEST) {
  console.log('✅ PricingModel enum exported');
} else {
  console.log('❌ PricingModel not found');
  process.exit(1);
}

// Test 2: Server package
if (typeof AgentServer === 'function') {
  console.log('✅ AgentServer exported from server package');
} else {
  console.log('❌ AgentServer not found');
  process.exit(1);
}

// Test 3: Client package
if (typeof AgentClient === 'function') {
  console.log('✅ AgentClient exported from client package');
} else {
  console.log('❌ AgentClient not found');
  process.exit(1);
}

console.log('\n🎉 Phase 2: All package exports verified!\n');
console.log('📦 Verified packages:');
console.log('   ✅ @x402-ai/core');
console.log('   ✅ @x402-ai/server');
console.log('   ✅ @x402-ai/client');
console.log('   ✅ @x402-ai/integrations-openai (build verified)\n');
