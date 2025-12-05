#!/bin/bash

# Complete Build & Test Script for x402-Flash SDK
# Tests all 3 phases systematically

echo "🚀 x402-Flash SDK - Complete Build & Test"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PHASE1_PASS=0
PHASE2_PASS=0
PHASE3_PASS=0

echo "📦 Phase 1: Building Core SDK..."
echo "--------------------------------"

# Build Phase 1 SDK
cd sdk/typescript
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Phase 1 SDK build: SUCCESS${NC}"
    PHASE1_PASS=$((PHASE1_PASS + 1))
else
    echo -e "${RED}❌ Phase 1 SDK build: FAILED${NC}"
fi
cd ../..

# Test Phase 1 exports
if npx tsx test-phase1.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Phase 1 exports test: PASSED${NC}"
    PHASE1_PASS=$((PHASE1_PASS + 1))
else
    echo -e "${RED}❌ Phase 1 exports test: FAILED${NC}"
fi

echo ""
echo "🤖 Phase 2: Building AI Agent Packages..."
echo "------------------------------------------"

# Build Phase 2 packages
for pkg in core server client integrations/openai; do
    echo -n "Building @x402-ai/$pkg... "
    if npm --prefix packages/$pkg run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        PHASE2_PASS=$((PHASE2_PASS + 1))
    else
        echo -e "${RED}❌${NC}"
    fi
done

# Test Phase 2 exports
if npx tsx test-phase2.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Phase 2 exports test: PASSED${NC}"
    PHASE2_PASS=$((PHASE2_PASS + 1))
else
    echo -e "${RED}❌ Phase 2 exports test: FAILED${NC}"
fi

echo ""
echo "💬 Phase 3: Building MCP Server..."
echo "-----------------------------------"

# Build Phase 3 MCP server
if npm --prefix packages/mcp-server run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Phase 3 MCP server build: SUCCESS${NC}"
    PHASE3_PASS=$((PHASE3_PASS + 1))
else
    echo -e "${RED}❌ Phase 3 MCP server build: FAILED${NC}"
fi

echo ""
echo "📊 Final Results"
echo "================"
echo ""
echo "Phase 1 (Core SDK):        $PHASE1_PASS/2 tests passed"
echo "Phase 2 (AI Agents):       $PHASE2_PASS/5 tests passed"
echo "Phase 3 (MCP Server):      $PHASE3_PASS/1 tests passed"
echo ""

TOTAL_PASS=$((PHASE1_PASS + PHASE2_PASS + PHASE3_PASS))
TOTAL_TESTS=8

if [ $TOTAL_PASS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED ($TOTAL_PASS/$TOTAL_TESTS)${NC}"
    echo ""
    echo "✅ All packages build successfully!"
    echo "✅ All exports verified!"
    echo "✅ Ready for integration testing!"
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED ($TOTAL_PASS/$TOTAL_TESTS passed)${NC}"
    echo ""
    echo "Run individual tests for details:"
    echo "  npm --prefix sdk/typescript run build"
    echo "  npx tsx test-phase1.ts"
    echo "  npx tsx test-phase2.ts"
    exit 1
fi
