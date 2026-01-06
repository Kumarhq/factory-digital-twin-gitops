#!/bin/bash

echo "Starting Factory Digital Twin Backend..."

cd /Users/Jinal/factory-digital-twin-gitops/dashboard/backend

# Install dependencies
echo "Installing dependencies..."
pip3 install fastapi uvicorn neo4j pydantic --user

# Start backend
echo "Starting backend API on port 8000..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
