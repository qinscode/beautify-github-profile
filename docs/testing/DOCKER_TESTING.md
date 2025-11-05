# Docker Testing Guide
## Beautify GitHub Profile Project

**Document Version**: 1.0.0
**Created Date**: 2025-11-05

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Docker Images](#docker-images)
4. [Running Tests](#running-tests)
5. [Docker Compose](#docker-compose)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### 1.1 Why Docker for Testing?

- ✅ **Consistency**: Same environment everywhere
- ✅ **Isolation**: No conflicts with local setup
- ✅ **Reproducibility**: Exact same results every time
- ✅ **CI/CD Ready**: Easy integration with pipelines
- ✅ **Multi-platform**: Test on different OS/browsers

### 1.2 Available Images

| Image | Purpose | Size |
|-------|---------|------|
| `test-unit` | Unit tests | ~200MB |
| `test-e2e` | E2E tests | ~1.5GB |
| `test-storybook` | Storybook tests | ~300MB |
| `test-all` | All tests | ~1.5GB |
| `ci` | CI/CD optimized | ~1.5GB |

---

## 2. Quick Start

### 2.1 Prerequisites

```bash
# Install Docker
# macOS
brew install docker

# Ubuntu
sudo apt-get install docker.io docker-compose

# Windows
# Download from https://www.docker.com/products/docker-desktop
```

### 2.2 Run Tests

```bash
# Run all tests
docker-compose -f docker-compose.test.yml up test-all

# Run specific test suite
docker-compose -f docker-compose.test.yml up test-unit
docker-compose -f docker-compose.test.yml up test-e2e
docker-compose -f docker-compose.test.yml up test-storybook
```

### 2.3 View Results

```bash
# View coverage report
docker-compose -f docker-compose.test.yml up coverage-server
open http://localhost:8080

# View Playwright report
docker-compose -f docker-compose.test.yml run test-e2e npm run test:e2e:report
```

---

## 3. Docker Images

### 3.1 Building Images

#### Build All Images

```bash
# Build all test images
docker-compose -f docker-compose.test.yml build

# Build specific image
docker-compose -f docker-compose.test.yml build test-unit
```

#### Build with Docker

```bash
# Build unit test image
docker build -f Dockerfile.test --target test-unit -t bgp-test-unit .

# Build E2E test image
docker build -f Dockerfile.test --target test-e2e -t bgp-test-e2e .

# Build Storybook test image
docker build -f Dockerfile.test --target test-storybook -t bgp-test-storybook .

# Build all tests image
docker build -f Dockerfile.test --target test-all -t bgp-test-all .
```

### 3.2 Image Details

#### test-unit

```dockerfile
# Based on: node:18-alpine
# Includes:
- Node.js 18
- npm dependencies
- Test frameworks (Vitest)
- Coverage tools

# Usage:
docker run bgp-test-unit
```

#### test-e2e

```dockerfile
# Based on: mcr.microsoft.com/playwright
# Includes:
- Playwright
- All browsers (Chromium, Firefox, WebKit)
- Test dependencies

# Usage:
docker run bgp-test-e2e
```

#### test-storybook

```dockerfile
# Based on: node:18-alpine
# Includes:
- Storybook
- Built stories
- Chromium for tests

# Usage:
docker run -p 6006:6006 bgp-test-storybook
```

### 3.3 Image Optimization

```dockerfile
# Use multi-stage builds
FROM node:18-alpine AS base
# ... install dependencies

FROM base AS test
# ... copy only what's needed

# Use .dockerignore
node_modules
dist
coverage
*.log
```

---

## 4. Running Tests

### 4.1 Unit Tests

```bash
# Run unit tests
docker-compose -f docker-compose.test.yml up test-unit

# With coverage
docker-compose -f docker-compose.test.yml run test-unit npm run test:coverage

# Watch mode
docker-compose -f docker-compose.test.yml up test-watch
```

### 4.2 E2E Tests

```bash
# Run all E2E tests
docker-compose -f docker-compose.test.yml up test-e2e

# Run specific browser
docker-compose -f docker-compose.test.yml up test-e2e-chromium
docker-compose -f docker-compose.test.yml up test-e2e-firefox
docker-compose -f docker-compose.test.yml up test-e2e-webkit

# Run with UI mode
docker-compose -f docker-compose.test.yml run test-e2e npm run test:e2e:ui

# Debug mode
docker-compose -f docker-compose.test.yml run test-e2e npm run test:e2e:debug
```

### 4.3 Storybook Tests

```bash
# Build and test Storybook
docker-compose -f docker-compose.test.yml up test-storybook

# Just view Storybook
docker-compose -f docker-compose.test.yml up storybook
# Open http://localhost:6006
```

### 4.4 All Tests

```bash
# Run complete test suite
docker-compose -f docker-compose.test.yml up test-all

# View logs
docker-compose -f docker-compose.test.yml logs -f test-all
```

---

## 5. Docker Compose

### 5.1 Common Commands

```bash
# Start services
docker-compose -f docker-compose.test.yml up [service]

# Start in background
docker-compose -f docker-compose.test.yml up -d [service]

# Stop services
docker-compose -f docker-compose.test.yml down

# Remove volumes
docker-compose -f docker-compose.test.yml down -v

# View logs
docker-compose -f docker-compose.test.yml logs -f [service]

# Execute command in running container
docker-compose -f docker-compose.test.yml exec [service] [command]
```

### 5.2 Service Configuration

#### Environment Variables

```yaml
# docker-compose.test.yml
services:
  test-unit:
    environment:
      - NODE_ENV=test
      - CI=true
      - COVERAGE_DIR=/app/coverage
```

#### Volume Mounts

```yaml
services:
  test-unit:
    volumes:
      - ./coverage:/app/coverage      # Coverage reports
      - ./test-results:/app/test-results  # Test results
```

#### Networks

```yaml
networks:
  default:
    name: bgp-test-network
```

### 5.3 Advanced Usage

#### Parallel Testing

```bash
# Run multiple test suites in parallel
docker-compose -f docker-compose.test.yml up -d test-unit test-e2e-chromium test-storybook

# Wait for all to complete
docker-compose -f docker-compose.test.yml wait
```

#### Custom Commands

```bash
# Run specific test file
docker-compose -f docker-compose.test.yml run test-unit npm test -- Button.test.tsx

# Run with specific options
docker-compose -f docker-compose.test.yml run test-e2e npm run test:e2e -- --headed --project=chromium
```

---

## 6. CI/CD Integration

### 6.1 GitHub Actions

```yaml
# .github/workflows/test-docker.yml
name: Docker Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build test images
        run: docker-compose -f docker-compose.test.yml build

      - name: Run unit tests
        run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-unit

      - name: Run E2E tests
        run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-e2e

      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/

      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.test.yml down -v
```

### 6.2 GitLab CI

```yaml
# .gitlab-ci.yml
test:unit:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-unit
  artifacts:
    paths:
      - coverage/
```

### 6.3 Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker-compose -f docker-compose.test.yml build'
            }
        }

        stage('Test') {
            parallel {
                stage('Unit') {
                    steps {
                        sh 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-unit'
                    }
                }
                stage('E2E') {
                    steps {
                        sh 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-e2e'
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker-compose -f docker-compose.test.yml down -v'
        }
    }
}
```

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Permission Denied

```bash
# Issue: Permission denied when accessing files

# Solution 1: Fix file permissions
sudo chown -R $USER:$USER coverage test-results

# Solution 2: Run with user
docker-compose -f docker-compose.test.yml run --user $(id -u):$(id -g) test-unit
```

#### Out of Memory

```bash
# Issue: Container runs out of memory

# Solution: Increase Docker memory
# Docker Desktop → Settings → Resources → Memory → 4GB+

# Or in docker-compose.yml:
services:
  test-e2e:
    mem_limit: 4g
```

#### Port Already in Use

```bash
# Issue: Port 6006 already in use

# Solution 1: Stop conflicting service
lsof -ti:6006 | xargs kill -9

# Solution 2: Use different port
docker-compose -f docker-compose.test.yml run -p 6007:6006 storybook
```

#### Slow Test Execution

```bash
# Issue: Tests running slowly in Docker

# Solution 1: Use volume mounts for node_modules
volumes:
  - /app/node_modules  # Don't mount local node_modules

# Solution 2: Increase resources
# Docker Desktop → Settings → Resources
# CPU: 4+
# Memory: 4GB+
```

### 7.2 Debugging

#### Interactive Shell

```bash
# Open shell in container
docker-compose -f docker-compose.test.yml run test-unit sh

# Run commands manually
npm test
npm run lint
```

#### View Logs

```bash
# Follow logs
docker-compose -f docker-compose.test.yml logs -f test-e2e

# View all logs
docker-compose -f docker-compose.test.yml logs

# Export logs
docker-compose -f docker-compose.test.yml logs > logs.txt
```

#### Inspect Container

```bash
# List running containers
docker ps

# Inspect container
docker inspect bgp-test-unit

# View container stats
docker stats bgp-test-unit
```

### 7.3 Cleanup

```bash
# Stop all containers
docker-compose -f docker-compose.test.yml down

# Remove volumes
docker-compose -f docker-compose.test.yml down -v

# Remove images
docker rmi bgp-test-unit bgp-test-e2e bgp-test-storybook

# Clean all Docker resources
docker system prune -a --volumes
```

---

## 8. Best Practices

### 8.1 Image Building

```dockerfile
# ✅ Use specific versions
FROM node:18.17.0-alpine

# ❌ Avoid latest
FROM node:latest

# ✅ Multi-stage builds
FROM node:18-alpine AS build
# ...
FROM node:18-alpine AS test
COPY --from=build /app/dist ./dist

# ✅ Minimize layers
RUN apk add --no-cache git curl && \
    npm ci && \
    npm cache clean --force
```

### 8.2 Volume Management

```yaml
# ✅ Use named volumes for persistence
volumes:
  node_modules:
  coverage:

# ✅ Mount only necessary files
volumes:
  - ./src:/app/src:ro  # Read-only source
  - ./coverage:/app/coverage  # Write coverage
```

### 8.3 Security

```dockerfile
# ✅ Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# ✅ Scan for vulnerabilities
docker scan bgp-test-unit
```

### 8.4 Performance

```dockerfile
# ✅ Cache npm dependencies
COPY package*.json ./
RUN npm ci
COPY . .

# ✅ Use .dockerignore
node_modules
.git
coverage
*.log
```

---

## 9. Examples

### 9.1 Development Workflow

```bash
# 1. Start development server
docker-compose -f docker-compose.test.yml up -d dev-server

# 2. Watch tests
docker-compose -f docker-compose.test.yml up -d test-watch

# 3. View Storybook
docker-compose -f docker-compose.test.yml up storybook

# 4. Make changes, tests auto-run

# 5. Cleanup
docker-compose -f docker-compose.test.yml down
```

### 9.2 Pre-commit Testing

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests in Docker..."

docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-unit

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

echo "Tests passed!"
```

### 9.3 CI Testing Script

```bash
#!/bin/bash
# scripts/test-ci.sh

set -e

echo "Building test images..."
docker-compose -f docker-compose.test.yml build

echo "Running unit tests..."
docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-unit

echo "Running E2E tests..."
docker-compose -f docker-compose.test.yml up --abort-on-container-exit test-e2e

echo "Generating reports..."
docker-compose -f docker-compose.test.yml run test-unit npm run test:report

echo "All tests passed!"

docker-compose -f docker-compose.test.yml down -v
```

---

## 10. References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Playwright Docker](https://playwright.dev/docs/docker)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Last Updated**: 2025-11-05
