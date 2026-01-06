---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

A clear and concise description of the bug.

## To Reproduce

Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

What actually happened instead.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

**Deployment Type:** (Docker Compose / Kubernetes / Local Development)

**Docker:**
- Docker version: [e.g. 24.0.5]
- Docker Compose version: [e.g. 2.20.2]

**Kubernetes (if applicable):**
- Kubernetes version: [e.g. 1.28]
- kubectl version: [e.g. 1.28]

**Browser (for frontend issues):**
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 120]

**Operating System:**
- OS: [e.g. macOS, Ubuntu, Windows]
- Version: [e.g. 13.5, 22.04, 11]

## Component

Which component is affected?
- [ ] Frontend
- [ ] Backend
- [ ] Neo4j Database
- [ ] Docker/Kubernetes deployment
- [ ] Documentation

## Logs

Please provide relevant logs:

**Backend logs:**
```
Paste backend logs here
```

**Frontend logs (browser console):**
```
Paste browser console logs here
```

**Docker/Kubernetes logs:**
```
Paste container/pod logs here
```

## Configuration

**Backend environment variables:**
```yaml
NEO4J_URI: bolt://neo4j:7687
# Other relevant config (redact sensitive info)
```

**Frontend environment:**
```yaml
VITE_API_URL: http://localhost:8000
```

## Additional Context

Add any other context about the problem here.

## Possible Solution

If you have ideas on how to fix this, please describe them here (optional).

## Related Issues

Link any related issues here.
