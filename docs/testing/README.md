# Testing Documentation

Welcome to the testing documentation for the Beautify GitHub Profile project. This directory contains comprehensive documentation for all testing aspects of the project.

## 📚 Documentation Overview

### Main Documents

1. **[TEST_PLAN.md](./TEST_PLAN.md)** - Complete testing strategy and plan
   - Testing objectives and scope
   - Test levels and strategies
   - Tools and frameworks (Vitest, Playwright, Storybook)
   - Timeline and milestones

2. **[UNIT_TEST.md](./UNIT_TEST.md)** - Unit testing with Vitest
   - Unit testing setup and configuration
   - Testing utilities and components
   - Hooks and state management testing
   - Examples and best practices

3. **[INTEGRATION_TEST.md](./INTEGRATION_TEST.md)** - Integration testing
   - API integration testing
   - Component integration testing
   - State management integration
   - Form and workflow testing

4. **[STORYBOOK_COMPONENT_TEST.md](./STORYBOOK_COMPONENT_TEST.md)** - Storybook component testing
   - Storybook setup and configuration
   - Writing stories
   - Visual testing
   - Interaction testing
   - Accessibility testing

5. **[E2E_TEST.md](./E2E_TEST.md)** - End-to-end testing with Playwright
   - Playwright setup and configuration
   - User flow testing
   - Cross-browser testing
   - Mobile testing
   - Performance testing

6. **[TEST_CASES.md](./TEST_CASES.md)** - Detailed test cases
   - Functional test cases
   - UI/UX test cases
   - Performance test cases
   - Security test cases
   - Accessibility test cases

7. **[USER_TESTING_GUIDE.md](./USER_TESTING_GUIDE.md)** - Guide for user testers
   - Getting started with testing
   - Test scenarios
   - How to report issues
   - Feedback guidelines

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18 or higher
node --version

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Run Storybook tests
npm run test-storybook
```

## 📊 Test Coverage

Our testing goals:

| Type | Coverage Target | Current |
|------|----------------|---------|
| Unit Tests | ≥ 80% | - |
| Integration Tests | ≥ 70% | - |
| E2E Tests | 100% of critical flows | - |
| Component Tests | 100% of UI components | - |

## 🛠️ Testing Tools

### Vitest
- **Purpose**: Unit and integration testing
- **Website**: https://vitest.dev/
- **Configuration**: `vitest.config.ts`
- **Setup**: `tests/setup.ts`

### Playwright
- **Purpose**: End-to-end testing
- **Website**: https://playwright.dev/
- **Configuration**: `playwright.config.ts`
- **Tests Location**: `e2e/`

### Storybook
- **Purpose**: Component development and testing
- **Website**: https://storybook.js.org/
- **Configuration**: `.storybook/`
- **Stories Location**: `src/**/*.stories.tsx`

### Testing Library
- **Purpose**: Testing utilities for React
- **Website**: https://testing-library.com/
- **Used with**: Vitest

## 📁 Project Structure

```
beautify-github-profile/
├── .github/
│   └── workflows/
│       └── test.yml           # CI/CD test workflow
├── .storybook/
│   ├── main.js               # Storybook configuration
│   └── preview.js            # Storybook preview config
├── docs/
│   └── testing/              # Testing documentation
│       ├── README.md         # This file
│       ├── TEST_PLAN.md
│       ├── UNIT_TEST.md
│       ├── INTEGRATION_TEST.md
│       ├── STORYBOOK_COMPONENT_TEST.md
│       ├── E2E_TEST.md
│       ├── TEST_CASES.md
│       └── USER_TESTING_GUIDE.md
├── e2e/                      # E2E tests
│   ├── tests/
│   ├── pages/                # Page objects
│   └── fixtures/             # Test fixtures
├── src/
│   ├── components/
│   │   └── **/*.test.tsx     # Component tests
│   │   └── **/*.stories.tsx  # Storybook stories
│   ├── utils/
│   │   └── **/*.test.ts      # Utility tests
│   └── hooks/
│       └── **/*.test.ts      # Hook tests
├── tests/
│   ├── setup.ts              # Test setup
│   └── helpers/              # Test helpers
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
└── package.json
```

## 🎯 Testing Best Practices

### 1. Write Clear Test Names

```typescript
// ✅ Good
it('should display error message when label is empty', () => {})

// ❌ Bad
it('test1', () => {})
```

### 2. Follow AAA Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(30)
})
```

### 3. Test User Behavior, Not Implementation

```typescript
// ✅ Good - Tests what user sees
expect(screen.getByText('Success')).toBeInTheDocument()

// ❌ Bad - Tests implementation details
expect(component.state.isSuccess).toBe(true)
```

### 4. Keep Tests Independent

```typescript
// ✅ Good - Each test is independent
describe('Component', () => {
  beforeEach(() => {
    // Reset state before each test
  })

  it('test 1', () => {})
  it('test 2', () => {})
})
```

### 5. Use Appropriate Test Types

- **Unit Tests**: Individual functions, components, hooks
- **Integration Tests**: Multiple components working together
- **E2E Tests**: Complete user workflows
- **Visual Tests**: Component appearance (Storybook)

## 🐛 Debugging Tests

### Vitest

```bash
# Run specific test file
npm run test:unit -- path/to/test.spec.ts

# Run tests matching pattern
npm run test:unit -- --grep "Badge"

# Run in debug mode
npm run test:unit -- --inspect-brk
```

### Playwright

```bash
# Run in headed mode
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- path/to/test.spec.ts

# View test report
npm run test:e2e:report
```

### Storybook

```bash
# Start Storybook with specific story
npm run storybook -- --initial-path=/story/components-badge--primary
```

## 📈 Continuous Integration

Tests run automatically on:
- ✅ Every push to `main` or `develop` branches
- ✅ Every pull request
- ✅ Daily scheduled runs (2 AM UTC)

### CI Workflow

1. **Lint & Type Check** - Code quality checks
2. **Unit Tests** - Fast unit and integration tests
3. **Build** - Verify project builds successfully
4. **E2E Tests** - Cross-browser end-to-end tests
5. **Storybook Tests** - Component interaction tests
6. **Performance Tests** - Lighthouse audits

## 📝 Writing New Tests

### Adding a Unit Test

1. Create test file: `ComponentName.test.tsx`
2. Import component and testing utilities
3. Write test cases
4. Run tests: `npm run test:unit`

Example:
```typescript
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('should render with label', () => {
    render(<Badge label="Test" />)
    expect(screen.getByAltText(/test/i)).toBeInTheDocument()
  })
})
```

### Adding an E2E Test

1. Create test file in `e2e/tests/`
2. Write test using Page Object Model
3. Run tests: `npm run test:e2e`

Example:
```typescript
import { test, expect } from '@playwright/test'

test('generate badge flow', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Label').fill('Test')
  await page.getByRole('button', { name: /generate/i }).click()
  await expect(page.getByTestId('preview')).toBeVisible()
})
```

### Adding a Storybook Story

1. Create story file: `ComponentName.stories.tsx`
2. Define stories for different states
3. Start Storybook: `npm run storybook`

Example:
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
}

export default meta
type Story = StoryObj<typeof Badge>

export const Primary: Story = {
  args: {
    label: 'Badge',
  },
}
```

## 🤝 Contributing Tests

When contributing, please:

1. ✅ Write tests for new features
2. ✅ Update tests for bug fixes
3. ✅ Maintain or improve code coverage
4. ✅ Follow existing test patterns
5. ✅ Document complex test scenarios

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## 🆘 Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Join our community discussions
- **Documentation**: Refer to detailed docs in this directory
- **Examples**: Look at existing tests for reference

## 📊 Test Reports

After running tests, reports are available:

- **Unit Test Coverage**: `coverage/index.html`
- **Playwright Report**: `playwright-report/index.html`
- **Storybook**: `http://localhost:6006`

## 🔄 Test Maintenance

### Regular Tasks

- **Weekly**: Review and update flaky tests
- **Monthly**: Update test dependencies
- **Quarterly**: Review test strategy and coverage
- **Yearly**: Comprehensive test audit

### Updating Tests

When updating code:
1. Run existing tests
2. Update failing tests
3. Add new tests for new behavior
4. Verify coverage hasn't decreased

---

**Happy Testing!** 🎉

For questions or issues with testing, please open an issue or contact the testing team.

Last Updated: 2025-11-05
