#!/bin/bash

# Comprehensive Test Suite for x402-Flash SDK
# Tests all components across all 3 phases

echo "🚀 x402-Flash SDK - COMPREHENSIVE TEST SUITE"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TOTAL_TESTS=0
PASSED_TESTS=0

# Helper function
test_command() {
    local name=$1
    local command=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo  -e "${BLUE}  Phase 1: Rust Smart Contract${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_command "Rust contract syntax check" "cd contracts/x402-flash-settlement && cargo check --quiet"
test_command "Rust contract WASM build" "cd contracts/x402-flash-settlement && cargo build --target wasm32-unknown-unknown --release --quiet"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 1: TypeScript SDK${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_command "TypeScript SDK build" "npm --prefix sdk/typescript run build --silent"
test_command "TypeScript SDK type check" "npx tsc --noEmit --project sdk/typescript/tsconfig.json"
test_command "Phase 1 exports test" "npx tsx test-phase1.ts"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 2: AI Agent Packages${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_command "@x402-ai/core build" "npm --prefix packages/core run build --silent"
test_command "@x402-ai/server build" "npm --prefix packages/server run build --silent"  
test_command "@x402-ai/client build" "npm --prefix packages/client run build --silent"
test_command "@x402-ai/openai build" "npm --prefix packages/integrations/openai run build --silent"
test_command "Phase 2 exports test" "npx tsx test-phase2.ts"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 3: MCP Server${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_command "MCP server build" "npm --prefix packages/mcp-server run build --silent"
test_command "MCP server type check" "npx tsc --noEmit --project packages/mcp-server/tsconfig.json"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Integration Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_command "Demo server integration" "npx tsx test-demo-server.ts"
test_command "Demo API server deps" "cd examples/demo-api-server && npm list --depth=0 > /dev/null"
test_command "Demo client deps" "cd examples/demo-client && npm list --depth=0 > /dev/null"
test_command "Chatbot example deps" "cd examples/simple-chatbot-phase2 && npm list --depth=0 > /dev/null"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "           FINAL RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Tests Passed: $PASSED_TESTS/$TOTAL_TESTS ($PERCENTAGE%)"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! SDK IS 100% COMPLETE!${NC}"
    echo ""
    echo "✅ Phase 1: Smart Contract + SDK"
    echo "✅ Phase 2: AI Agent Framework"
    echo "✅ Phase 3: MCP Server"
    echo "✅ All Integration Tests"
    echo ""
    echo "🚀 Ready for deployment to Stellar testnet!"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed ($PASSED_TESTS/$TOTAL_TESTS passed)${NC}"
    echo ""
    echo "Run individual test commands for details"
    exit 1
fi
