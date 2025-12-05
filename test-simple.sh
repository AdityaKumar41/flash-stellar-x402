#!/bin/bash

# Simplified Test Suite - No silent flags
echo "🚀 x402-Flash SDK - Test Suite"
echo "==============================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASSED=0
FAILED=0

test_cmd() {
    local name=$1
    local cmd=$2
    
    echo -n "→ $name... "
    if eval "$cmd" > /tmp/test_output.log 2>&1; then
        echo -e "${GREEN}✅${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC}"
        echo "  Error details:" 
        tail -5 /tmp/test_output.log | sed 's/^/    /'
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "Phase 1: Rust Contract"
echo "----------------------"
test_cmd "Cargo check" "cd contracts/x402-flash-settlement && cargo check"
test_cmd "WASM build" "cd contracts/x402-flash-staller-sdk/contracts/x402-flash-settlement && cargo build --target wasm32-unknown-unknown --release"

echo ""
echo "Phase 1: TypeScript SDK"
echo "-----------------------"
test_cmd "SDK build" "npm --prefix sdk/typescript run build"
test_cmd "Phase 1 test" "npx tsx test-phase1.ts"

echo ""
echo "Phase 2: AI Packages"
echo "--------------------"
test_cmd "@x402-ai/core" "npm --prefix packages/core run build"
test_cmd "@x402-ai/server" "npm --prefix packages/server run build"
test_cmd "@x402-ai/client" "npm --prefix packages/client run build"
test_cmd "@x402-ai/openai" "npm --prefix packages/integrations/openai run build"
test_cmd "Phase 2 test" "npx tsx test-phase2.ts"

echo ""
echo "Phase 3: MCP Server"
echo "-------------------"
test_cmd "MCP build" "npm --prefix packages/mcp-server run build"

echo ""
echo "=============================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=============================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
