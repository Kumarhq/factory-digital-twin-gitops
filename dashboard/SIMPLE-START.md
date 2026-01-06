# Simple Start Guide - No Docker Needed

If Docker is having issues, you can run the frontend locally and connect to Neo4j Desktop or a cloud instance.

## Option 1: Frontend Only (Preview Mode)

Run just the frontend to see the UI:

```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/frontend
npm install
npm run dev
```

Open: http://localhost:5173

**Note:** RCA features won't work without backend, but you can see the UI.

## Option 2: Full Setup with Neo4j Desktop

### Step 1: Install Neo4j Desktop
Download from: https://neo4j.com/download/

### Step 2: Create Database
1. Open Neo4j Desktop
2. Create new project: "Factory Digital Twin"
3. Add Local DBMS
4. Set password: `factory_twin_2025`
5. Start the database

### Step 3: Load Test Data
1. Open Neo4j Browser (http://localhost:7474)
2. Copy contents of `/dashboard/test-data/rca-test-scenarios.cypher`
3. Paste and run in Neo4j Browser

### Step 4: Start Backend
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/backend

# Install dependencies
pip install fastapi uvicorn neo4j pydantic

# Set environment variables
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=factory_twin_2025

# Run backend
python main.py
```

### Step 5: Start Frontend
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/frontend
npm install
npm run dev
```

Open: http://localhost:5173

## Option 3: Docker Desktop Fix

If Docker Desktop is installed but not working:

### On macOS:
1. Open Docker Desktop
2. Click the bug icon → "Restart"
3. Wait for Docker to fully start
4. Try running: `docker ps`

### If Docker isn't installed:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Run the QUICK-START.sh script again

## Option 4: Use Pre-built Demo

I can create a standalone demo that doesn't require Neo4j:

```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard/frontend
npm run dev
```

The UI will load with mock data for preview purposes.

## Troubleshooting

### Issue: npm not found
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Python not found
**Solution:** Install Python 3.10+ from https://www.python.org/

### Issue: Can't connect to Neo4j
**Solution:**
```bash
# Check if Neo4j is running
curl http://localhost:7474

# Check bolt connection
telnet localhost 7687
```

### Issue: Port 5173 already in use
**Solution:**
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

## What Works Without Backend

Without the backend, you can still:
- ✅ See the UI layout
- ✅ Navigate between tabs
- ✅ View component structure
- ❌ RCA analysis won't work
- ❌ AI Assistant won't work
- ❌ No real data

## What You Need for Full Functionality

- Neo4j (Desktop or Docker)
- Backend API (Python)
- Frontend (Node.js)

## Quick Status Check

Run these to verify services:

```bash
# Neo4j
curl http://localhost:7474

# Backend
curl http://localhost:8000

# Frontend
curl http://localhost:5173
```

All should return responses (not errors).

---

**Need help? The system works best with Docker, but can run locally with Neo4j Desktop.**
