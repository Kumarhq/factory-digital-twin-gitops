# CI/CD Pipeline Documentation

## Overview

The Factory Digital Twin Dashboard uses GitHub Actions for automated testing, building, security scanning, and deployment.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Every push to `main` or `develop`
- Every pull request to `main` or `develop`

**Jobs:**
1. **Backend Tests**
   - Python linting (Flake8, Black)
   - Type checking (mypy)
   - Unit tests (pytest)
   - Code coverage reporting

2. **Frontend Tests**
   - ESLint linting
   - TypeScript type checking
   - Jest tests
   - Code coverage reporting

3. **Docker Compose Integration Test**
   - Build all services
   - Start services
   - Verify health checks
   - Test endpoints

**Duration:** ~5-10 minutes

---

### 2. Docker Build Workflow (`docker-build.yml`)

**Triggers:**
- Push to `main` or `develop`
- Tags matching `v*`
- Pull requests to `main` or `develop`

**Jobs:**
1. **Build Backend Image**
   - Multi-stage Docker build
   - Push to GitHub Container Registry
   - Tag with branch/version/SHA

2. **Build Frontend Image**
   - Multi-stage Docker build with Nginx
   - Push to GitHub Container Registry
   - Tag with branch/version/SHA

3. **Security Scan**
   - Trivy vulnerability scanning
   - Upload results to GitHub Security

**Duration:** ~8-12 minutes

**Image Locations:**
```
ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest
ghcr.io/kumarhq/factory-digital-twin-gitops/factory-frontend:latest
```

---

### 3. Complete Deployment Workflow (`deploy.yml`)

**Triggers:**
- Push to `main`
- Tags matching `v*`
- Manual workflow dispatch

**Jobs:**

#### 1. Test (5-10 min)
- Run all backend tests
- Run all frontend tests
- Generate coverage reports

#### 2. Build Images (8-12 min)
- Build backend and frontend Docker images
- Push to GitHub Container Registry
- Multi-architecture support (amd64, arm64)
- Automated tagging:
  - `latest` for main branch
  - `v1.0.0` for version tags
  - `main-abc123` for commit SHA

#### 3. Security Scan (3-5 min)
- Trivy vulnerability scanning
- Upload to GitHub Security tab
- Block deployment on critical vulnerabilities (optional)

#### 4. Create Release (1 min)
**Triggered on:** Tags only (`v*`)
- Auto-generate release notes
- Include Docker pull commands
- Link to documentation
- Attach deployment instructions

#### 5. Deploy to Staging (2-5 min)
**Triggered on:** Push to `main`
- Deploy latest images to staging environment
- Run smoke tests
- Notify team

#### 6. Deploy to Production (2-5 min)
**Triggered on:** Tags only (`v*`)
**Requires:** Manual approval
- Deploy versioned images to production
- Run health checks
- Notify team

#### 7. Notify (1 min)
- Send success/failure notifications
- Update deployment status
- Log deployment metrics

**Total Duration:** ~20-35 minutes (end-to-end)

---

## Image Tagging Strategy

### Automatic Tags

| Event | Tags Created | Example |
|-------|--------------|---------|
| Push to `main` | `latest`, `main`, `main-{sha}` | `latest`, `main`, `main-abc123` |
| Push to `develop` | `develop`, `develop-{sha}` | `develop`, `develop-def456` |
| Tag `v1.0.0` | `v1.0.0`, `1.0`, `1`, `latest` | `v1.0.0`, `1.0`, `1` |
| Pull Request #42 | `pr-42` | `pr-42` |

### Tag Usage

```bash
# Latest stable (main branch)
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest

# Specific version
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:v1.0.0

# Development branch
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:develop

# Specific commit
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:main-abc123
```

---

## Environment Configuration

### GitHub Secrets

Required secrets for deployment:

| Secret | Purpose | Example |
|--------|---------|---------|
| `GITHUB_TOKEN` | Push to GHCR (auto-provided) | `ghp_...` |
| `KUBECONFIG_STAGING` | Kubernetes config for staging | base64 encoded |
| `KUBECONFIG_PRODUCTION` | Kubernetes config for production | base64 encoded |
| `SLACK_WEBHOOK` | Notifications (optional) | `https://hooks.slack.com/...` |

### GitHub Environments

**Staging:**
- No approval required
- Auto-deploy on push to `main`
- URL: `https://staging.factory-digital-twin.example.com`

**Production:**
- Requires manual approval
- Deploy on version tags only
- URL: `https://factory-digital-twin.example.com`
- Reviewers: @team-leads

---

## Deployment Process

### Staging Deployment (Automatic)

1. **Developer pushes to `main`**:
   ```bash
   git push origin main
   ```

2. **GitHub Actions:**
   - ✅ Run tests
   - ✅ Build images
   - ✅ Security scan
   - ✅ Deploy to staging
   - ✅ Send notification

3. **Verify:**
   - Visit staging URL
   - Check logs
   - Run smoke tests

### Production Deployment (Manual)

1. **Create version tag**:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. **GitHub Actions:**
   - ✅ Run tests
   - ✅ Build versioned images
   - ✅ Security scan
   - ✅ Create GitHub release
   - ⏸️ **Wait for approval**

3. **Approve deployment:**
   - Go to: Actions → Deploy workflow → Review deployments
   - Click "Review pending deployments"
   - Select "production"
   - Click "Approve and deploy"

4. **GitHub Actions continues:**
   - ✅ Deploy to production
   - ✅ Health checks
   - ✅ Send notification

5. **Verify:**
   - Visit production URL
   - Monitor metrics
   - Check error logs

---

## Manual Workflow Dispatch

You can manually trigger deployments via GitHub UI:

1. Go to: **Actions** → **Build, Test, and Deploy**
2. Click **"Run workflow"**
3. Select:
   - **Branch**: `main` or tag
   - **Environment**: `staging` or `production`
4. Click **"Run workflow"**

**Command Line:**
```bash
gh workflow run deploy.yml --ref main
```

---

## Rollback Procedures

### Option 1: Redeploy Previous Version

```bash
# Tag the previous working version
git tag -a v1.0.1-rollback -m "Rollback to v1.0.0"
git push origin v1.0.1-rollback
```

### Option 2: Kubernetes Rollback

```bash
# Rollback backend
kubectl rollout undo deployment/backend -n production

# Rollback frontend
kubectl rollout undo deployment/frontend -n production

# Check status
kubectl rollout status deployment/backend -n production
```

### Option 3: Manual Image Change

```bash
# Use previous image
kubectl set image deployment/backend \
  backend=ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:v1.0.0 \
  -n production
```

---

## Monitoring & Notifications

### Build Status

**Badge for README:**
```markdown
![CI](https://github.com/Kumarhq/factory-digital-twin-gitops/workflows/CI/badge.svg)
![Deploy](https://github.com/Kumarhq/factory-digital-twin-gitops/workflows/Build,%20Test,%20and%20Deploy/badge.svg)
```

### Slack Notifications (Optional)

Add to workflow:
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment to ${{ github.event.inputs.environment }} completed!"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Troubleshooting

### Build Failures

**Issue**: Tests failing
```bash
# Check logs
gh run view --log

# Run tests locally
cd dashboard/backend && pytest
cd dashboard/frontend && npm test
```

**Issue**: Docker build failing
```bash
# Build locally
docker build -t test-backend ./dashboard/backend
docker build -t test-frontend ./dashboard/frontend
```

### Deployment Failures

**Issue**: Image not found
```bash
# Verify image exists
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest

# Check GHCR
gh api user/packages/container/factory-backend/versions
```

**Issue**: Kubernetes deployment failing
```bash
# Check pods
kubectl get pods -n production

# Check logs
kubectl logs deployment/backend -n production

# Describe pod
kubectl describe pod <pod-name> -n production
```

---

## Security Scanning

### Trivy Results

**View in GitHub:**
- Go to: **Security** → **Code scanning alerts**
- Filter by: Trivy

**Run locally:**
```bash
# Scan backend image
trivy image ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest

# Scan with severity threshold
trivy image --severity HIGH,CRITICAL ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest
```

### Handling Vulnerabilities

1. **Critical vulnerabilities**: Block deployment, fix immediately
2. **High vulnerabilities**: Create issue, fix in next release
3. **Medium/Low**: Monitor, fix in regular updates

---

## Performance Optimization

### Build Cache

GitHub Actions uses Docker layer caching:
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefits:**
- Faster builds (~50% reduction)
- Lower costs
- Reduced resource usage

### Multi-Architecture Builds

Images support both AMD64 and ARM64:
```yaml
platforms: linux/amd64,linux/arm64
```

**Use cases:**
- AMD64: Standard servers, cloud VMs
- ARM64: AWS Graviton, Raspberry Pi, Apple Silicon

---

## Best Practices

### 1. Version Tagging
- Use semantic versioning (`v1.0.0`)
- Tag format: `v{major}.{minor}.{patch}`
- Include release notes

### 2. Testing
- Run tests locally before pushing
- Add tests for new features
- Maintain >80% code coverage

### 3. Security
- Review Trivy scan results
- Update dependencies regularly
- Use secrets for sensitive data

### 4. Deployment
- Test in staging first
- Use manual approval for production
- Have rollback plan ready

### 5. Monitoring
- Watch deployment logs
- Monitor application metrics
- Set up alerts for failures

---

## Quick Reference

### Common Commands

```bash
# Trigger CI
git push origin main

# Create release
git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0

# View workflow runs
gh run list

# Watch workflow
gh run watch

# Pull latest images
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-backend:latest
docker pull ghcr.io/kumarhq/factory-digital-twin-gitops/factory-frontend:latest

# Deploy manually
gh workflow run deploy.yml --ref main
```

---

## Workflow Visualization

```
Push to main
    ↓
┌─────────────┐
│  Run Tests  │ (5-10 min)
└──────┬──────┘
       ↓
┌─────────────┐
│Build Images │ (8-12 min)
└──────┬──────┘
       ↓
┌─────────────┐
│Security Scan│ (3-5 min)
└──────┬──────┘
       ↓
┌─────────────┐
│   Deploy    │ (2-5 min)
│   Staging   │
└─────────────┘

Tag v1.0.0
    ↓
[Same as above]
    ↓
┌─────────────┐
│   Create    │ (1 min)
│   Release   │
└──────┬──────┘
       ↓
┌─────────────┐
│   MANUAL    │
│  APPROVAL   │ ⏸️
└──────┬──────┘
       ↓
┌─────────────┐
│   Deploy    │ (2-5 min)
│ Production  │
└─────────────┘
```

---

**Updated**: 2026-01-07
**Version**: 1.0
**Maintained by**: DevOps Team
