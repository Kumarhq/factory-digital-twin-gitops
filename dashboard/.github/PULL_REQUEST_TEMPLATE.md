## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Dependency update
- [ ] CI/CD change

## Related Issues

<!-- Link related issues here using #issue_number -->
Closes #
Related to #

## Changes Made

<!-- List the specific changes made in this PR -->

### Backend Changes
- [ ] Modified API endpoints
- [ ] Updated database queries
- [ ] Changed data models
- [ ] Other:

### Frontend Changes
- [ ] Added new components
- [ ] Modified existing components
- [ ] Updated styling
- [ ] Other:

### Infrastructure Changes
- [ ] Docker configuration
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Other:

## Detailed Changes

<!-- Provide a detailed list of changes by file or component -->

**Backend (`backend/`):**
- `main.py`: Added new endpoint `/api/xyz`
- `models.py`: Updated AssetModel with new field

**Frontend (`frontend/src/`):**
- `components/NewComponent.tsx`: Created new component for XYZ
- `App.tsx`: Integrated new component

**Other:**
- `docker-compose.yml`: Added new environment variable
- `README.md`: Updated deployment instructions

## Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

### How Has This Been Tested?

<!-- Describe how you tested your changes -->

**Test Configuration:**
- Deployment type: Docker Compose / Kubernetes / Local
- Neo4j version: 5.16.0
- Python version: 3.11
- Node.js version: 20

**Test Cases:**
1. Test case 1 description
   - Steps:
   - Expected result:
   - Actual result:

2. Test case 2 description
   - Steps:
   - Expected result:
   - Actual result:

### Test Results

```bash
# Backend tests
$ pytest tests/ -v
PASSED tests/test_xyz.py::test_new_feature

# Frontend tests
$ npm test
PASS src/components/NewComponent.test.tsx
```

## Screenshots

<!-- Add screenshots for UI changes -->

**Before:**


**After:**


## Checklist

<!-- Mark completed items with an 'x' -->

### Code Quality
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have removed any console.log() or debugging code

### Documentation
- [ ] I have updated the documentation (README, CONTRIBUTING, etc.)
- [ ] I have added/updated API documentation
- [ ] I have added/updated inline code comments
- [ ] I have updated relevant diagrams or schemas

### Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the changes in Docker Compose
- [ ] I have tested the changes in Kubernetes (if applicable)

### Dependencies
- [ ] I have checked for dependency conflicts
- [ ] I have updated requirements.txt / package.json if dependencies changed
- [ ] I have verified all dependencies are compatible

### Breaking Changes
- [ ] This PR introduces breaking changes
- [ ] I have documented all breaking changes in the description
- [ ] I have updated the version number according to semver
- [ ] I have provided migration guide for breaking changes

### Deployment
- [ ] Changes work with existing database schema
- [ ] Database migrations are included (if needed)
- [ ] Environment variables are documented
- [ ] Deployment configuration is updated (if needed)

### Security
- [ ] I have reviewed my code for security vulnerabilities
- [ ] No sensitive data (passwords, tokens, keys) is hardcoded
- [ ] Input validation is implemented where needed
- [ ] SQL/Cypher injection vulnerabilities are addressed

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No performance impact
- [ ] Performance improvement (describe below)
- [ ] Potential performance degradation (describe and justify below)

**Performance Notes:**


## Deployment Notes

<!-- Any special deployment considerations? -->

**Environment Variables:**
```yaml
NEW_VAR: description of new variable
```

**Database Migrations:**
```cypher
// Cypher commands needed for database migration
CREATE CONSTRAINT ...
```

**Post-Deployment Steps:**
1. Step 1
2. Step 2

## Rollback Plan

<!-- How can this change be rolled back if needed? -->

1. Rollback step 1
2. Rollback step 2

## Additional Context

<!-- Add any other context, links, or information about the PR here -->

## Reviewer Notes

<!-- Anything specific you want reviewers to focus on? -->

- Please pay special attention to:
- Known issues/limitations:
- Future improvements planned:

---

**By submitting this PR, I confirm that:**
- [ ] I have read and agree to the [Contributing Guidelines](../CONTRIBUTING.md)
- [ ] My code is licensed under the project's MIT License
- [ ] I have tested my changes thoroughly
