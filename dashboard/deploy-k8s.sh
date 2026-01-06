#!/bin/bash

# Deploy Factory Digital Twin to Kubernetes
# Usage: ./deploy-k8s.sh [namespace]

NAMESPACE=${1:-factory-digital-twin}

echo "Deploying Factory Digital Twin to Kubernetes namespace: $NAMESPACE"

# Create namespace
echo "Creating namespace..."
kubectl apply -f kubernetes/namespace.yaml

# Create ConfigMaps and Secrets
echo "Creating ConfigMaps and Secrets..."
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# Deploy Neo4j (StatefulSet)
echo "Deploying Neo4j database..."
kubectl apply -f kubernetes/neo4j-statefulset.yaml

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to be ready..."
kubectl wait --for=condition=ready pod -l app=neo4j -n $NAMESPACE --timeout=300s

# Deploy Backend
echo "Deploying backend API..."
kubectl apply -f kubernetes/backend-deployment.yaml

# Wait for Backend to be ready
echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=120s

# Deploy Frontend
echo "Deploying frontend..."
kubectl apply -f kubernetes/frontend-deployment.yaml

# Wait for Frontend to be ready
echo "Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=120s

# Optional: Deploy Ingress
read -p "Do you want to deploy Ingress? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying Ingress..."
  kubectl apply -f kubernetes/ingress.yaml
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check deployment status:"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo "Get service URLs:"
echo "  kubectl get svc -n $NAMESPACE"
echo ""
echo "View logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend -n $NAMESPACE"
echo ""
echo "Access the application:"
echo "  kubectl port-forward svc/frontend-service 3000:80 -n $NAMESPACE"
echo "  Then open: http://localhost:3000"
