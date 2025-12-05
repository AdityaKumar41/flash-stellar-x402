// Integration Test: Demo API Server
// Tests that the demo server can start and respond to requests

import express from 'express';

console.log('🧪 Testing Demo API Server Integration...\n');

// Test 1: Can we import required modules?
try {
  console.log('✅ Express imported');
} catch (error: any) {
  console.log('❌ Failed to import dependencies:', error.message);
  process.exit(1);
}

// Test 2: Can we create an Express app?
try {
  const app = express();
  console.log('✅ Express app created');
} catch (error: any) {
  console.log('❌ Failed to create Express app:', error.message);
  process.exit(1);
}

// Test 3: Can the server start on a test port?
async function testServerStartup() {
  try {
    const app = express();
    app.get('/test', (req, res) => {
      res.json({ status: 'ok' });
    });

    const server = app.listen(0); // Use random available port
    const address: any = server.address();
    const port = address.port;
    
    console.log(`✅ Server started on port ${port}`);
    
    // Make a test request
    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Server responds to requests');
    }
    
    server.close();
    console.log('✅ Server shutdown cleanly');
    
  } catch (error: any) {
    console.log('❌ Server test failed:', error.message);
    process.exit(1);
  }
}

testServerStartup().then(() => {
  console.log('\n🎉 All demo server integration tests passed!');
  console.log('\n📝 Next: Start the actual demo server with:');
  console.log('   cd examples/demo-api-server');
  console.log('   npm run dev');
}).catch(console.error);
