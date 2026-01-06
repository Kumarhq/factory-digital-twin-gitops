# Contributing to Factory Digital Twin Dashboard

Thank you for your interest in contributing to the Factory Digital Twin Dashboard! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- **Docker** 20.10+ and Docker Compose
- **Node.js** 20+ and npm
- **Python** 3.11+
- **Git**
- **kubectl** (for Kubernetes contributions)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/factory-digital-twin-gitops.git
cd factory-digital-twin-gitops/dashboard
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/factory-digital-twin-gitops.git
```

### Local Development Setup

#### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
```

#### Frontend Setup

```bash
cd frontend
npm install
```

#### Start Services

```bash
# From dashboard directory
docker-compose up -d neo4j  # Start only Neo4j for development
./init-database.sh  # Initialize with sample data
```

#### Run in Development Mode

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Neo4j Browser: http://localhost:7474

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-update
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test

# Linting
cd backend && flake8 .
cd frontend && npm run lint

# Type checking
cd frontend && npm run type-check
```

### 4. Build and Verify

```bash
# Build Docker images
./build-images.sh

# Start with Docker Compose
docker-compose up -d

# Verify everything works
curl http://localhost:8000/api/stats
curl http://localhost:3000
```

### 5. Commit Your Changes

Follow conventional commits (see [Commit Guidelines](#commit-guidelines))

```bash
git add .
git commit -m "feat: add drift detection for network configuration"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### Python (Backend)

#### Style Guide
- Follow **PEP 8** style guide
- Use **type hints** for function parameters and return values
- Maximum line length: **88 characters** (Black formatter)
- Use **docstrings** for all functions, classes, and modules

#### Code Example

```python
from typing import List, Dict, Optional

def get_asset_drift(
    asset_name: str,
    include_history: bool = False
) -> Dict[str, any]:
    """
    Calculate configuration drift for a specific asset.

    Args:
        asset_name: Name of the asset to check
        include_history: Whether to include historical drift data

    Returns:
        Dictionary containing drift information with keys:
        - drifts: List of detected drifts
        - severity: Overall drift severity
        - actions: Recommended remediation actions

    Raises:
        ValueError: If asset_name is not found
    """
    # Implementation here
    pass
```

#### Tools
- **Formatter**: Black (`black .`)
- **Linter**: Flake8 (`flake8 .`)
- **Type Checker**: mypy (`mypy .`)
- **Import Sorter**: isort (`isort .`)

### TypeScript (Frontend)

#### Style Guide
- Follow **ESLint** configuration
- Use **functional components** with hooks
- Use **TypeScript interfaces** for all props and data structures
- Maximum line length: **100 characters**
- Use **meaningful variable names**

#### Code Example

```typescript
interface AssetDriftProps {
  assetName: string;
  onResolve?: (action: string) => void;
}

const AssetDrift: React.FC<AssetDriftProps> = ({ assetName, onResolve }) => {
  const [driftData, setDriftData] = useState<DriftData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriftData();
  }, [assetName]);

  const fetchDriftData = async () => {
    try {
      const response = await axios.get(`/api/gitops/drift?asset=${assetName}`);
      setDriftData(response.data);
    } catch (error) {
      console.error('Failed to fetch drift data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Component JSX */}
    </Box>
  );
};
```

#### Tools
- **Linter**: ESLint (`npm run lint`)
- **Formatter**: Prettier (integrated with ESLint)
- **Type Checker**: TypeScript compiler (`npm run type-check`)

### General Principles

1. **DRY (Don't Repeat Yourself)** - Extract common logic into reusable functions
2. **KISS (Keep It Simple, Stupid)** - Prefer simple solutions over complex ones
3. **YAGNI (You Aren't Gonna Need It)** - Don't add functionality until it's necessary
4. **Single Responsibility** - Each function/component should do one thing well
5. **Error Handling** - Always handle errors gracefully with user-friendly messages

---

## Commit Guidelines

We use **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD pipeline changes

### Scope (Optional)

- `backend` - Backend changes
- `frontend` - Frontend changes
- `docker` - Docker/containerization
- `k8s` - Kubernetes manifests
- `rca` - Root Cause Analysis feature
- `drift` - Drift detection feature
- `dashboard` - Dashboard views

### Examples

```bash
# Feature
git commit -m "feat(drift): add severity classification for configuration drift"

# Bug fix
git commit -m "fix(rca): resolve issue with unreachable asset analysis"

# Documentation
git commit -m "docs: update deployment instructions for Kubernetes"

# Refactoring
git commit -m "refactor(backend): extract drift calculation into separate function"

# Breaking change
git commit -m "feat(api)!: change drift endpoint response structure

BREAKING CHANGE: drift endpoint now returns severity field instead of priority"
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] No merge conflicts

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Detailed list of changes
- File-by-file if necessary

## Testing
- How you tested the changes
- Test cases added

## Screenshots (if applicable)
Before/after screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linters
2. **Code Review**: At least one maintainer reviews your code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main branch

### After Merge

- Delete your feature branch
- Pull latest main: `git checkout main && git pull upstream main`
- Update your fork: `git push origin main`

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_drift.py

# Run with verbose output
pytest -v -s
```

#### Test Structure

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_drift_detection():
    """Test drift detection endpoint returns expected format"""
    response = client.get("/api/gitops/drift")
    assert response.status_code == 200
    assert "drifts" in response.json()
    assert "summary" in response.json()
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

#### Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import GitOpsDriftDashboard from './GitOpsDriftDashboard';

describe('GitOpsDriftDashboard', () => {
  it('renders drift summary cards', async () => {
    render(<GitOpsDriftDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Assets matching GitOps/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```bash
# Start all services
docker-compose up -d

# Run integration tests
pytest tests/integration/

# Stop services
docker-compose down
```

---

## Documentation

### Code Documentation

- **Python**: Use Google-style docstrings
- **TypeScript**: Use JSDoc comments
- **Complex Logic**: Add inline comments explaining "why", not "what"

### README Updates

Update relevant README files when:
- Adding new features
- Changing API endpoints
- Modifying deployment process
- Adding new configuration options

### API Documentation

FastAPI automatically generates API docs at `/docs`, but:
- Add clear descriptions to all endpoints
- Document all request/response models
- Include example payloads

---

## Getting Help

### Resources

- **Documentation**: See README.md and QUICKSTART.md
- **Issues**: Check existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **Issues**: Report bugs via GitHub Issues
- **Security**: Email security@example.com for vulnerabilities
- **General**: Open a Discussion on GitHub

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Acknowledged in release notes
- Granted contributor badge

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Factory Digital Twin Dashboard!**
