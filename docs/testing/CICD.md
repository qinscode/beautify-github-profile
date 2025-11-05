# CI/CD Documentation
## Beautify GitHub Profile Project

**Document Version**: 1.0.0
**Created Date**: 2025-11-05
**Last Updated**: 2025-11-05

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Environment Setup](#environment-setup)
4. [Deployment Process](#deployment-process)
5. [Secrets Management](#secrets-management)
6. [Monitoring and Alerts](#monitoring-and-alerts)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 1. Overview

### 1.1 CI/CD Architecture

```
┌─────────────┐
│   Commit    │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐                  ┌──────────────┐
│  PR Checks   │                  │  Main Build  │
└──────┬───────┘                  └──────┬───────┘
       │                                  │
       ├─ Lint                           ├─ Test
       ├─ Type Check                     ├─ Build
       ├─ Unit Tests                     └─ Deploy to Staging
       ├─ E2E Tests                              │
       ├─ Security Scan                          ▼
       └─ Build                          ┌──────────────┐
                                         │ Smoke Tests  │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │Deploy to Prod│
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ Monitoring   │
                                         └──────────────┘
```

### 1.2 Workflow Files

| File | Purpose | Trigger |
|------|---------|---------|
| `test.yml` | Main CI tests | Push to main/develop |
| `pr-checks.yml` | PR validation | Pull request |
| `deploy.yml` | Deployment pipeline | Push to main, tags |
| `scheduled-tests.yml` | Periodic tests | Daily/Weekly schedule |

### 1.3 Deployment Stages

```
Development → Staging → Production
    ↓           ↓          ↓
   Tests    Smoke Tests  Full Tests
```

---

## 2. Workflows

### 2.1 PR Checks Workflow

**File**: `.github/workflows/pr-checks.yml`

#### Purpose
Validates every pull request before merging.

#### Jobs

1. **Quick Checks** (5 min)
   - Check for console.log
   - Verify package-lock.json
   - Check for merge conflicts

2. **Code Quality**
   - ESLint
   - Prettier
   - TypeScript type checking
   - Bundle size check

3. **Unit Tests**
   - Run on Node 18 and 20
   - Generate coverage reports
   - Upload to Codecov

4. **Build Verification**
   - Build project
   - Upload artifacts

5. **E2E Tests**
   - Test across browsers (Chrome, Firefox, Safari)
   - Shard tests for faster execution

6. **Storybook Tests**
   - Build Storybook
   - Run interaction tests

7. **Security & Accessibility**
   - npm audit
   - Snyk scan
   - pa11y accessibility tests

#### Usage

```yaml
# Automatically runs on PR
on:
  pull_request:
    branches: [main, develop]
```

#### Example Output

```
✅ Quick Checks passed
✅ Code Quality passed
✅ Unit Tests passed (90% coverage)
✅ Build successful
✅ E2E Tests passed (3 browsers)
✅ Storybook Tests passed
⚠️  Accessibility: 2 warnings
```

### 2.2 Main Test Workflow

**File**: `.github/workflows/test.yml`

#### Purpose
Comprehensive testing on main/develop branches.

#### Jobs

1. **Lint & Type Check**
2. **Unit & Integration Tests**
3. **Build**
4. **E2E Tests** (all browsers)
5. **Storybook Tests**
6. **Performance Tests**
7. **Test Summary**

#### Trigger

```yaml
on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
```

### 2.3 Deployment Workflow

**File**: `.github/workflows/deploy.yml`

#### Purpose
Deploy application to staging and production.

#### Deployment Flow

```
1. Pre-deployment Checks
   ├─ Run tests
   └─ Build project

2. Deploy to Staging
   ├─ Vercel
   ├─ Netlify
   └─ GitHub Pages

3. Smoke Tests (Staging)

4. Deploy to Production
   ├─ Vercel
   ├─ Netlify
   ├─ GitHub Pages
   └─ Cloudflare Pages

5. Smoke Tests (Production)

6. Performance Monitoring

7. Create Release (if tag)

8. Notify Team
```

#### Triggers

```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options:
          - staging
          - production
```

#### Manual Deployment

```bash
# Go to Actions → Deploy → Run workflow
# Select environment: staging or production
```

### 2.4 Scheduled Tests Workflow

**File**: `.github/workflows/scheduled-tests.yml`

#### Purpose
Run automated tests on schedule.

#### Schedule

| Test Type | Frequency | Time (UTC) |
|-----------|-----------|------------|
| Regression | Daily | 2:00 AM |
| Comprehensive | Weekly | Sunday 3:00 AM |
| Performance | Daily | 2:00 AM |
| Security | Daily | 2:00 AM |

#### Jobs

1. **Daily Regression**
   - E2E tests on staging and production
   - All browsers

2. **Weekly Comprehensive**
   - Full test suite
   - Generate detailed report
   - Create GitHub issue

3. **Performance Benchmark**
   - Lighthouse audits
   - WebPageTest
   - Check thresholds

4. **Security Scan**
   - npm audit
   - Snyk
   - OWASP ZAP
   - Trivy

5. **Link Checker** (Weekly)

---

## 3. Environment Setup

### 3.1 Environments

#### Staging
- **URL**: https://staging.beautify-github-profile.com
- **Purpose**: Pre-production testing
- **Auto-deploy**: On merge to main

#### Production
- **URL**: https://beautify-github-profile.com
- **Purpose**: Live environment
- **Deploy**: Manual or on version tag

### 3.2 GitHub Environments Configuration

```yaml
# Configure in: Settings → Environments

staging:
  deployment_branch_policy:
    protected_branches: true
    custom_branch_policies: false
  reviewers: []
  wait_timer: 0

production:
  deployment_branch_policy:
    protected_branches: true
  reviewers:
    - devops-team
  wait_timer: 30  # 30 minutes
  protection_rules:
    - required_reviewers: 2
```

### 3.3 Required Secrets

Configure in: `Settings → Secrets and variables → Actions`

#### Deployment Secrets

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Netlify
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID

# Cloudflare
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID

# GitHub
GITHUB_TOKEN  # Auto-provided
```

#### Testing Secrets

```bash
# Chromatic (Visual Regression)
CHROMATIC_PROJECT_TOKEN

# Codecov
CODECOV_TOKEN

# Snyk
SNYK_TOKEN

# WebPageTest
WPT_API_KEY

# Lighthouse CI
LHCI_GITHUB_APP_TOKEN
```

#### Notification Secrets

```bash
# Slack
SLACK_WEBHOOK

# Discord
DISCORD_WEBHOOK

# Email
EMAIL_USERNAME
EMAIL_PASSWORD
NOTIFICATION_EMAIL
```

---

## 4. Deployment Process

### 4.1 Automatic Deployment

#### Staging Deployment

```bash
# Automatically deploys when:
1. PR merged to main
2. Direct push to main

# Process:
git checkout main
git pull origin main
git merge feature-branch
git push origin main

# GitHub Actions will:
1. Run tests
2. Build project
3. Deploy to staging
4. Run smoke tests
```

#### Production Deployment

```bash
# Create and push version tag:
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions will:
1. Deploy to staging
2. Run smoke tests
3. Deploy to production
4. Run smoke tests
5. Create GitHub release
6. Notify team
```

### 4.2 Manual Deployment

#### Via GitHub UI

1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Select environment: `staging` or `production`
5. Click **Run workflow**

#### Via GitHub CLI

```bash
# Deploy to staging
gh workflow run deploy.yml -f environment=staging

# Deploy to production
gh workflow run deploy.yml -f environment=production
```

### 4.3 Rollback Process

#### Automatic Rollback

Rollback automatically triggers if:
- Smoke tests fail
- Production deployment fails

#### Manual Rollback

```bash
# 1. Find previous successful deployment
gh run list --workflow=deploy.yml --status=success

# 2. Re-deploy previous version
git checkout v1.0.0  # Previous version tag
git tag -a v1.0.1 -m "Rollback to v1.0.0"
git push origin v1.0.1

# Or manually trigger deployment
gh workflow run deploy.yml -f environment=production
```

### 4.4 Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Changelog updated
- [ ] Version tag created
- [ ] Staging tested
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Team notified

---

## 5. Secrets Management

### 5.1 Adding Secrets

#### Repository Secrets

```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret

# Via GitHub CLI
gh secret set VERCEL_TOKEN < token.txt
gh secret set NETLIFY_AUTH_TOKEN --body "secret-value"
```

#### Environment Secrets

```bash
# Via GitHub UI
Settings → Environments → [Environment] → Add secret

# Via GitHub CLI
gh secret set VERCEL_TOKEN --env production < token.txt
```

### 5.2 Secret Rotation

#### Best Practices

1. **Regular Rotation**: Rotate secrets every 90 days
2. **Audit**: Review secret usage monthly
3. **Minimal Scope**: Use least privilege principle
4. **Expiration**: Set expiration dates when possible

#### Rotation Schedule

| Secret | Rotation Frequency | Owner |
|--------|-------------------|-------|
| API Tokens | 90 days | DevOps |
| Webhooks | 180 days | Team Lead |
| Service Keys | 90 days | Security Team |

### 5.3 Secret Security

```yaml
# ❌ Bad - Exposing secret
- name: Deploy
  run: echo ${{ secrets.API_KEY }}

# ✅ Good - Using secret safely
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: deploy.sh
```

---

## 6. Monitoring and Alerts

### 6.1 Workflow Monitoring

#### GitHub Actions Dashboard

```
Actions → Workflows → [Select Workflow]

View:
- Run history
- Success/failure rates
- Duration trends
- Resource usage
```

#### Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Test Success Rate | 100% | < 95% |
| Build Time | < 5 min | > 10 min |
| Deployment Time | < 10 min | > 20 min |
| Test Coverage | ≥ 80% | < 75% |

### 6.2 Notification Channels

#### Slack Notifications

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

Receives:
- ✅ Successful deployments
- ❌ Failed tests/deployments
- ⚠️ Performance degradation
- 🔒 Security alerts

#### Discord Notifications

```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

#### Email Alerts

Configured for:
- Critical failures
- Security vulnerabilities
- Production incidents

### 6.3 Dashboard

#### Recommended Tools

1. **GitHub Actions Dashboard** (Built-in)
2. **Datadog** (External monitoring)
3. **Grafana** (Metrics visualization)
4. **Sentry** (Error tracking)

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Issue: Tests Failing on CI but Passing Locally

**Cause**: Environment differences

**Solutions**:
```bash
# Use same Node version
nvm use 18

# Clean install
rm -rf node_modules package-lock.json
npm install

# Run in CI mode
CI=true npm test
```

#### Issue: Deployment Timeout

**Cause**: Long build time or network issues

**Solutions**:
```yaml
# Increase timeout
timeout-minutes: 30

# Use caching
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

#### Issue: Flaky E2E Tests

**Cause**: Race conditions, timing issues

**Solutions**:
```typescript
// Add retries
test.describe.configure({ retries: 2 })

// Use better waits
await page.waitForLoadState('networkidle')

// Increase timeouts
test.setTimeout(60000)
```

#### Issue: Out of Memory

**Cause**: Large test suite or memory leaks

**Solutions**:
```yaml
# Increase Node memory
- name: Run tests
  run: NODE_OPTIONS=--max_old_space_size=4096 npm test

# Run tests in batches
- name: Run tests
  run: npm test -- --maxWorkers=2
```

### 7.2 Debugging Workflows

#### Enable Debug Logging

```bash
# Repository variables
ACTIONS_RUNNER_DEBUG=true
ACTIONS_STEP_DEBUG=true
```

#### View Logs

```bash
# Via GitHub CLI
gh run view [run-id] --log

# Download logs
gh run download [run-id]
```

#### Re-run Failed Jobs

```bash
# Via GitHub CLI
gh run rerun [run-id]

# Re-run only failed jobs
gh run rerun [run-id] --failed
```

### 7.3 Performance Optimization

#### Caching Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'  # Auto-cache npm dependencies
```

#### Parallel Execution

```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [ubuntu-latest, windows-latest]
  max-parallel: 4
```

#### Conditional Execution

```yaml
- name: E2E Tests
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: npm run test:e2e
```

---

## 8. Best Practices

### 8.1 Workflow Design

#### ✅ Do's

- **Fast Feedback**: Run quick checks first
- **Fail Fast**: Stop on critical failures
- **Parallelization**: Run independent jobs in parallel
- **Caching**: Cache dependencies and build artifacts
- **Idempotent**: Workflows should be rerunnable
- **Minimal Secrets**: Only use necessary secrets

#### ❌ Don'ts

- **Long Running**: Keep workflows under 30 minutes
- **Hardcoded Values**: Use variables and secrets
- **Ignore Failures**: Always investigate failures
- **Skip Tests**: Don't deploy without testing

### 8.2 Security Best Practices

```yaml
# ✅ Pin action versions
- uses: actions/checkout@v4.1.0

# ❌ Don't use @master or @main
- uses: actions/checkout@main

# ✅ Limit permissions
permissions:
  contents: read
  pull-requests: write

# ✅ Use environment protection
environment:
  name: production
  url: https://example.com
```

### 8.3 Cost Optimization

#### Free Tier Limits (GitHub Actions)

- **Public repos**: Unlimited minutes
- **Private repos**: 2,000 minutes/month

#### Optimization Strategies

1. **Reduce Test Time**
   ```yaml
   # Shard tests
   --shard=${{ matrix.shard }}/4
   ```

2. **Cancel Redundant Runs**
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

3. **Conditional Workflows**
   ```yaml
   if: |
     github.event_name == 'push' &&
     !contains(github.event.head_commit.message, '[skip ci]')
   ```

### 8.4 Documentation

Maintain documentation for:

- [ ] Workflow diagrams
- [ ] Secret requirements
- [ ] Deployment procedures
- [ ] Troubleshooting guides
- [ ] Runbooks for incidents

---

## 9. Maintenance

### 9.1 Regular Tasks

#### Weekly
- [ ] Review failed workflow runs
- [ ] Check test flakiness
- [ ] Monitor resource usage

#### Monthly
- [ ] Update dependencies in workflows
- [ ] Review and optimize workflow performance
- [ ] Audit secrets and rotate if needed
- [ ] Update documentation

#### Quarterly
- [ ] Review entire CI/CD pipeline
- [ ] Update action versions
- [ ] Optimize costs
- [ ] Team training on new features

### 9.2 Metrics to Track

```yaml
# Create dashboard with:
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate
- Test success rate
- Build duration
- Coverage trends
```

---

## 10. References

### 10.1 Documentation Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### 10.2 Related Files

- [Test Plan](./TEST_PLAN.md)
- [Testing README](./README.md)
- [Unit Test Guide](./UNIT_TEST.md)
- [E2E Test Guide](./E2E_TEST.md)

---

**Last Updated**: 2025-11-05
**Maintained By**: DevOps Team
