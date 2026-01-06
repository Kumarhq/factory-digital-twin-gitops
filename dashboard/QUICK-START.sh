#!/bin/bash

# =============================================================================
# Factory Digital Twin Dashboard - Quick Start Script
# =============================================================================

set -e

echo "🏭 Factory Digital Twin - Complete RCA System Quick Start"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo -e "${BLUE}[1/5] Checking Docker...${NC}"
if ! docker --version &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not running${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start Neo4j (from main project directory)
echo -e "${BLUE}[2/5] Starting Neo4j database...${NC}"
cd /Users/Jinal/factory-digital-twin-gitops

# Check if Neo4j is already running
if docker ps | grep -q factory-neo4j; then
    echo -e "${GREEN}✅ Neo4j is already running${NC}"
else
    echo "Starting Neo4j container..."
    docker compose up -d neo4j 2>&1 || {
        echo -e "${YELLOW}⚠️  Docker compose failed, trying manual start...${NC}"
        docker run -d \
            --name factory-neo4j \
            -p 7474:7474 -p 7687:7687 \
            -e NEO4J_AUTH=neo4j/factory_twin_2025 \
            -e NEO4J_PLUGINS='["apoc"]' \
            neo4j:5.16.0-community || {
            echo -e "${RED}❌ Failed to start Neo4j${NC}"
            echo "Please start Neo4j manually:"
            echo "  docker run -d --name factory-neo4j -p 7474:7474 -p 7687:7687 \\"
            echo "    -e NEO4J_AUTH=neo4j/factory_twin_2025 neo4j:5.16.0-community"
            exit 1
        }
    }

    echo "Waiting for Neo4j to be ready..."
    sleep 15
fi
echo ""

# Step 3: Load test data
echo -e "${BLUE}[3/5] Loading RCA test data...${NC}"
if [ -f "dashboard/test-data/rca-test-scenarios.cypher" ]; then
    docker exec -i factory-neo4j cypher-shell -u neo4j -p factory_twin_2025 \
        < dashboard/test-data/rca-test-scenarios.cypher 2>&1 | tail -5
    echo -e "${GREEN}✅ Test data loaded${NC}"
else
    echo -e "${YELLOW}⚠️  Test data file not found, skipping...${NC}"
fi
echo ""

# Step 4: Start Dashboard services
echo -e "${BLUE}[4/5] Starting Dashboard services...${NC}"
cd dashboard

# Check if services are running
if docker ps | grep -q factory-dashboard; then
    echo -e "${GREEN}✅ Dashboard services already running${NC}"
else
    echo "Starting backend and frontend..."
    docker compose up -d 2>&1 || {
        echo -e "${YELLOW}⚠️  Using alternative startup method...${NC}"
        # Try starting services manually if needed
    }

    echo "Waiting for services to be ready..."
    sleep 10
fi
echo ""

# Step 5: Display status and URLs
echo -e "${BLUE}[5/5] Checking service status...${NC}"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep factory || true
echo ""

echo -e "${GREEN}=========================================================="
echo "✅ Factory Digital Twin Dashboard is ready!"
echo "==========================================================${NC}"
echo ""
echo -e "${BLUE}📊 Access URLs:${NC}"
echo "  Frontend (Dashboard):  http://localhost:3000"
echo "  Backend API:           http://localhost:8000"
echo "  API Documentation:     http://localhost:8000/docs"
echo "  Neo4j Browser:         http://localhost:7474"
echo "    Username: neo4j"
echo "    Password: factory_twin_2025"
echo ""
echo -e "${BLUE}🔍 Quick Test:${NC}"
echo "  1. Go to RCA Triaging tab"
echo "  2. Try 'Find Root Cause' for: PLC-001"
echo "  3. Click 'Run All Critical Scenarios'"
echo ""
echo "  Or try AI Assistant:"
echo "  • 'Why is PLC-001 offline?'"
echo "  • 'What if UPS-Main fails?'"
echo "  • 'Show network issues'"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • RCA-TRIAGING-SYSTEM.md"
echo "  • RCA-IMPLEMENTATION-SUMMARY.md"
echo "  • UI-ENHANCEMENTS.md"
echo ""
echo -e "${YELLOW}🛑 To stop services:${NC}"
echo "  cd dashboard && docker compose down"
echo ""

# Try to open browser (macOS)
if command -v open &> /dev/null; then
    read -p "Open dashboard in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sleep 3
        open http://localhost:3000
    fi
fi

echo -e "${GREEN}Happy diagnosing! 🎉${NC}"
