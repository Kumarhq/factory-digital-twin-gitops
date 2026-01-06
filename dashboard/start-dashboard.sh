#!/bin/bash

# Factory Digital Twin - Dashboard Quick Start Script

set -e

echo "🏭 Factory Digital Twin - Web Dashboard"
echo "========================================"
echo ""

# Check if Neo4j is running
echo "📊 Checking Neo4j database..."
if ! docker ps | grep -q factory-neo4j; then
    echo "❌ Neo4j is not running!"
    echo "   Please start Neo4j first:"
    echo "   cd /Users/Jinal/factory-digital-twin-gitops && docker compose up -d"
    exit 1
fi
echo "✅ Neo4j is running"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "   Please run this script from the dashboard directory:"
    echo "   cd /Users/Jinal/factory-digital-twin-gitops/dashboard"
    exit 1
fi

# Start dashboard services
echo "🚀 Starting dashboard services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker ps | grep -q factory-dashboard-api && docker ps | grep -q factory-dashboard-frontend; then
    echo "✅ Dashboard services are running!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "📊 Neo4j Browser: http://localhost:7474"
    echo ""
    echo "📝 View logs:"
    echo "   docker compose logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker compose down"
    echo ""

    # Try to open browser (macOS)
    if command -v open &> /dev/null; then
        read -p "Open dashboard in browser? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sleep 3  # Give frontend time to fully start
            open http://localhost:3000
        fi
    fi
else
    echo "❌ Failed to start services"
    echo "   Check logs: docker compose logs"
    exit 1
fi
