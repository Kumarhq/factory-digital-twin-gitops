# 🚀 Launch Instructions - Factory Digital Twin RCA System

## Quick Launch (Recommended)

```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard
./QUICK-START.sh
```

This script will:
1. ✅ Check Docker is running
2. ✅ Start Neo4j database
3. ✅ Load RCA test data
4. ✅ Start dashboard backend & frontend
5. ✅ Display access URLs

---

## Manual Launch (If Quick Start Fails)

### Step 1: Start Neo4j

**Option A: Using Docker Compose**
```bash
cd /Users/Jinal/factory-digital-twin-gitops
docker compose up -d neo4j
```

**Option B: Manual Docker Run**
```bash
docker run -d \
  --name factory-neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/factory_twin_2025 \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.16.0-community
```

Wait 15-20 seconds for Neo4j to start.

### Step 2: Load Test Data

```bash
cd /Users/Jinal/factory-digital-twin-gitops
docker exec -i factory-neo4j cypher-shell -u neo4j -p factory_twin_2025 \
  < dashboard/test-data/rca-test-scenarios.cypher
```

Expected output: "Test data created successfully!"

### Step 3: Start Dashboard

```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard
docker compose up -d
```

Or start backend and frontend separately:

**Backend:**
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/backend
docker build -t factory-dashboard-api .
docker run -d -p 8000:8000 --name factory-dashboard-api \
  -e NEO4J_URI=bolt://host.docker.internal:7687 \
  -e NEO4J_USER=neo4j \
  -e NEO4J_PASSWORD=factory_twin_2025 \
  factory-dashboard-api
```

**Frontend:**
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/frontend
npm install
npm run dev
```

---

## Access URLs

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | None |
| **API** | http://localhost:8000 | None |
| **API Docs** | http://localhost:8000/docs | None |
| **Neo4j Browser** | http://localhost:7474 | neo4j / factory_twin_2025 |

---

## Quick Test

### Test 1: RCA Panel
1. Open http://localhost:3000
2. Click "RCA Triaging" tab
3. Enter "PLC-001" in asset name
4. Click "Find Root Cause"
5. Expected: NetworkSwitch-05 → EdgeGateway-02 → PLC-001

### Test 2: AI Assistant
1. Click "AI Assistant" tab
2. Type: "Why is PLC-001 offline?"
3. Expected: Formatted RCA response with failure chain

### Test 3: Factory-Wide Analysis
1. Go to "RCA Triaging" tab
2. Click "Run All Critical Scenarios"
3. Expected: 6 expandable sections with results

---

## Troubleshooting

### Issue: Neo4j won't start
**Solution:**
```bash
# Check if port is in use
lsof -i :7474
lsof -i :7687

# Kill existing Neo4j
docker stop factory-neo4j && docker rm factory-neo4j

# Restart
docker run -d --name factory-neo4j -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/factory_twin_2025 \
  neo4j:5.16.0-community
```

### Issue: Docker image pull fails
**Solution:**
```bash
# Check Docker daemon
docker ps

# Restart Docker Desktop (macOS)
# Open Docker Desktop → Restart

# Try pulling manually
docker pull neo4j:5.16.0-community
```

### Issue: Dashboard frontend won't start
**Solution:**
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start dev server
npm run dev
```

### Issue: Backend API errors
**Solution:**
```bash
# Check Neo4j connection
docker logs factory-dashboard-api

# Verify Neo4j is reachable
docker exec factory-neo4j cypher-shell -u neo4j -p factory_twin_2025 "RETURN 1"

# Restart backend
docker restart factory-dashboard-api
```

---

## Verify Installation

### Check Neo4j
```bash
# Should return 1
docker exec factory-neo4j cypher-shell -u neo4j -p factory_twin_2025 "RETURN 1"

# Count nodes (should be 50+)
docker exec factory-neo4j cypher-shell -u neo4j -p factory_twin_2025 \
  "MATCH (n) RETURN count(n)"
```

### Check Backend API
```bash
# Health check
curl http://localhost:8000/

# Test RCA endpoint
curl -X POST http://localhost:8000/api/rca/root-cause \
  -H "Content-Type: application/json" \
  -d '{"assetName": "PLC-001"}'
```

### Check Frontend
```bash
# Should return HTML
curl http://localhost:3000/
```

---

## Stop Services

```bash
# Stop dashboard
cd /Users/Jinal/factory-digital-twin-gitops/dashboard
docker compose down

# Stop Neo4j
cd /Users/Jinal/factory-digital-twin-gitops
docker compose down neo4j

# Or stop everything
docker stop factory-neo4j factory-dashboard-api factory-dashboard-frontend
docker rm factory-neo4j factory-dashboard-api factory-dashboard-frontend
```

---

## Next Steps

Once launched:

1. **Explore RCA Panel:**
   - Try different asset names
   - Run cascade impact analysis
   - Execute factory-wide scenarios

2. **Test AI Assistant:**
   - Use natural language queries
   - Try quick action buttons
   - Test different query types

3. **Review Results:**
   - Check severity indicators
   - Read recommendations
   - Explore failure chains

4. **Read Documentation:**
   - RCA-TRIAGING-SYSTEM.md
   - RCA-IMPLEMENTATION-SUMMARY.md
   - UI-ENHANCEMENTS.md

---

## Support

If you encounter issues:

1. Check Docker is running: `docker ps`
2. Check logs: `docker logs [container-name]`
3. Verify ports are free: `lsof -i :3000 -i :7474 -i :7687 -i :8000`
4. Review documentation in `/dashboard` directory

---

**Happy Diagnosing! 🎉**
