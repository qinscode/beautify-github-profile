# End-to-End Testing Documentation (Playwright)
## Beautify GitHub Profile Project

**Document Version**: 1.0.0
**Testing Framework**: Playwright
**Created Date**: 2025-11-05

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Playwright Setup](#playwright-setup)
3. [Test Structure](#test-structure)
4. [Writing E2E Tests](#writing-e2e-tests)
5. [User Flows Testing](#user-flows-testing)
6. [Cross-Browser Testing](#cross-browser-testing)
7. [Mobile Testing](#mobile-testing)
8. [Performance Testing](#performance-testing)
9. [Visual Regression](#visual-regression)
10. [Best Practices](#best-practices)

---

## 1. Overview

### 1.1 What is End-to-End Testing?

End-to-end (E2E) testing validates the entire application flow from start to finish, simulating real user scenarios. It ensures all integrated components work together correctly.

### 1.2 Why Playwright?

- ✅ **Cross-Browser**: Test on Chromium, Firefox, and WebKit
- ✅ **Auto-Wait**: Smart waiting for elements
- ✅ **Mobile Emulation**: Test on mobile devices
- ✅ **Fast Execution**: Parallel test execution
- ✅ **Rich Debugging**: Screenshots, videos, traces
- ✅ **Modern Features**: Network interception, geolocation, etc.

### 1.3 Test Coverage Goals

| Aspect | Target | Description |
|--------|--------|-------------|
| User Flows | 100% | All critical user journeys |
| Browsers | 3+ | Chrome, Firefox, Safari |
| Devices | 2+ | Desktop, Mobile |
| Performance | < 3s | Page load time |

---

## 2. Playwright Setup

### 2.1 Installation

```bash
# Install Playwright
npm init playwright@latest

# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium
```

### 2.2 Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Timeout for each action
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewports
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### 2.3 Test Environment Setup

Create `e2e/global-setup.ts`:

```typescript
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.use

  // Start browser
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Wait for server to be ready
  await page.goto(baseURL!)
  await page.waitForLoadState('networkidle')

  // Setup authentication if needed
  // await page.goto(`${baseURL}/login`)
  // await page.fill('[name="username"]', 'test-user')
  // await page.fill('[name="password"]', 'test-password')
  // await page.click('button[type="submit"]')
  // await page.context().storageState({ path: 'e2e/.auth/user.json' })

  await browser.close()
}

export default globalSetup
```

### 2.4 Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:codegen": "playwright codegen http://localhost:5173"
  }
}
```

---

## 3. Test Structure

### 3.1 File Organization

```
e2e/
├── fixtures/
│   ├── test-data.ts
│   └── custom-fixtures.ts
├── pages/
│   ├── home.page.ts
│   ├── badges.page.ts
│   └── badge-generator.page.ts
├── tests/
│   ├── home.spec.ts
│   ├── badge-generation.spec.ts
│   ├── navigation.spec.ts
│   └── mobile.spec.ts
├── utils/
│   ├── helpers.ts
│   └── assertions.ts
└── global-setup.ts
```

### 3.2 Page Object Model

```typescript
// e2e/pages/badge-generator.page.ts

import { Page, Locator } from '@playwright/test'

export class BadgeGeneratorPage {
  readonly page: Page
  readonly labelInput: Locator
  readonly messageInput: Locator
  readonly colorSelect: Locator
  readonly generateButton: Locator
  readonly preview: Locator
  readonly copyUrlButton: Locator
  readonly copyMarkdownButton: Locator
  readonly successToast: Locator

  constructor(page: Page) {
    this.page = page
    this.labelInput = page.getByLabel('Label')
    this.messageInput = page.getByLabel('Message')
    this.colorSelect = page.getByLabel('Color')
    this.generateButton = page.getByRole('button', { name: 'Generate' })
    this.preview = page.getByTestId('preview')
    this.copyUrlButton = page.getByRole('button', { name: /copy url/i })
    this.copyMarkdownButton = page.getByRole('button', { name: /copy markdown/i })
    this.successToast = page.getByRole('alert', { name: /success/i })
  }

  async goto() {
    await this.page.goto('/badge-generator')
    await this.page.waitForLoadState('networkidle')
  }

  async fillForm(data: {
    label: string
    message?: string
    color?: string
  }) {
    await this.labelInput.fill(data.label)

    if (data.message) {
      await this.messageInput.fill(data.message)
    }

    if (data.color) {
      await this.colorSelect.selectOption(data.color)
    }
  }

  async generate() {
    await this.generateButton.click()
    await this.preview.waitFor({ state: 'visible' })
  }

  async copyUrl() {
    await this.copyUrlButton.click()
    await this.successToast.waitFor({ state: 'visible' })
  }

  async copyMarkdown() {
    await this.copyMarkdownButton.click()
    await this.successToast.waitFor({ state: 'visible' })
  }

  async getPreviewUrl(): Promise<string> {
    const img = this.preview.locator('img')
    return await img.getAttribute('src') || ''
  }
}
```

### 3.3 Custom Fixtures

```typescript
// e2e/fixtures/custom-fixtures.ts

import { test as base } from '@playwright/test'
import { BadgeGeneratorPage } from '../pages/badge-generator.page'

type CustomFixtures = {
  badgeGeneratorPage: BadgeGeneratorPage
}

export const test = base.extend<CustomFixtures>({
  badgeGeneratorPage: async ({ page }, use) => {
    const badgeGeneratorPage = new BadgeGeneratorPage(page)
    await badgeGeneratorPage.goto()
    await use(badgeGeneratorPage)
  },
})

export { expect } from '@playwright/test'
```

---

## 4. Writing E2E Tests

### 4.1 Basic Test Structure

```typescript
// e2e/tests/home.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Beautify GitHub Profile/)
  })

  test('should display main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Beautify')
  })

  test('should have navigation menu', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()

    // Check navigation links
    await expect(page.getByRole('link', { name: 'Badges' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Widgets' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Icons' })).toBeVisible()
  })

  test('should navigate to Badges page', async ({ page }) => {
    await page.getByRole('link', { name: 'Badges' }).click()
    await expect(page).toHaveURL('/badges')
    await expect(page.getByRole('heading', { name: 'Badges' })).toBeVisible()
  })
})
```

### 4.2 Form Testing

```typescript
// e2e/tests/badge-generation.spec.ts

import { test, expect } from '../fixtures/custom-fixtures'

test.describe('Badge Generation', () => {
  test('should generate badge with valid input', async ({ badgeGeneratorPage }) => {
    // Fill form
    await badgeGeneratorPage.fillForm({
      label: 'Build',
      message: 'Passing',
      color: 'green',
    })

    // Generate badge
    await badgeGeneratorPage.generate()

    // Verify preview
    const previewUrl = await badgeGeneratorPage.getPreviewUrl()
    expect(previewUrl).toContain('Build')
    expect(previewUrl).toContain('Passing')
    expect(previewUrl).toContain('green')
  })

  test('should show validation error for empty label', async ({ badgeGeneratorPage }) => {
    // Try to generate without label
    await badgeGeneratorPage.generate()

    // Verify error message
    const errorMessage = badgeGeneratorPage.page.getByText(/label is required/i)
    await expect(errorMessage).toBeVisible()

    // Verify preview is not shown
    await expect(badgeGeneratorPage.preview).not.toBeVisible()
  })

  test('should copy URL to clipboard', async ({ badgeGeneratorPage, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Generate badge
    await badgeGeneratorPage.fillForm({ label: 'Test' })
    await badgeGeneratorPage.generate()

    // Copy URL
    await badgeGeneratorPage.copyUrl()

    // Verify clipboard content
    const clipboardText = await badgeGeneratorPage.page.evaluate(() =>
      navigator.clipboard.readText()
    )
    expect(clipboardText).toContain('shields.io')
    expect(clipboardText).toContain('Test')
  })

  test('should copy Markdown to clipboard', async ({ badgeGeneratorPage, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await badgeGeneratorPage.fillForm({ label: 'Build', message: 'Passing' })
    await badgeGeneratorPage.generate()
    await badgeGeneratorPage.copyMarkdown()

    const clipboardText = await badgeGeneratorPage.page.evaluate(() =>
      navigator.clipboard.readText()
    )
    expect(clipboardText).toMatch(/!\[.*\]\(.*\)/)
  })

  test('should update preview when config changes', async ({ badgeGeneratorPage }) => {
    // First generation
    await badgeGeneratorPage.fillForm({ label: 'Test1' })
    await badgeGeneratorPage.generate()

    let previewUrl = await badgeGeneratorPage.getPreviewUrl()
    expect(previewUrl).toContain('Test1')

    // Change and regenerate
    await badgeGeneratorPage.fillForm({ label: 'Test2' })
    await badgeGeneratorPage.generate()

    previewUrl = await badgeGeneratorPage.getPreviewUrl()
    expect(previewUrl).toContain('Test2')
  })
})
```

### 4.3 Navigation Testing

```typescript
// e2e/tests/navigation.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    await page.goto('/')

    // Navigate to Badges
    await page.getByRole('link', { name: 'Badges' }).click()
    await expect(page).toHaveURL('/badges')

    // Navigate to Widgets
    await page.getByRole('link', { name: 'Widgets' }).click()
    await expect(page).toHaveURL('/widgets')

    // Navigate to Icons
    await page.getByRole('link', { name: 'Icons' }).click()
    await expect(page).toHaveURL('/icons')

    // Navigate back to Home
    await page.getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL('/')
  })

  test('should support browser back/forward navigation', async ({ page }) => {
    await page.goto('/')

    // Navigate forward
    await page.getByRole('link', { name: 'Badges' }).click()
    await expect(page).toHaveURL('/badges')

    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL('/badges')
  })

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/badge-generator')

    // Fill form
    await page.getByLabel('Label').fill('Test')

    // Navigate away
    await page.getByRole('link', { name: 'Home' }).click()

    // Navigate back
    await page.goBack()

    // Verify state is maintained (if using local storage)
    // Note: This depends on your state management implementation
  })
})
```

---

## 5. User Flows Testing

### 5.1 Complete User Journey

```typescript
// e2e/tests/user-flows.spec.ts

import { test, expect } from '@playwright/test'

test.describe('User Flows', () => {
  test('Complete badge creation and copy workflow', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // 1. Visit home page
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // 2. Navigate to badge generator
    await page.getByRole('link', { name: /badges/i }).click()
    await page.getByRole('link', { name: /generator/i }).click()
    await expect(page).toHaveURL(/badge-generator/)

    // 3. Fill out form
    await page.getByLabel('Label').fill('Coverage')
    await page.getByLabel('Message').fill('95%')
    await page.getByLabel('Color').selectOption('brightgreen')

    // 4. Generate badge
    await page.getByRole('button', { name: /generate/i }).click()

    // 5. Verify preview
    await expect(page.getByTestId('preview')).toBeVisible()
    const badgeImage = page.getByRole('img', { name: /coverage badge/i })
    await expect(badgeImage).toBeVisible()

    // 6. Copy Markdown
    await page.getByRole('button', { name: /copy markdown/i }).click()

    // 7. Verify success message
    await expect(page.getByText(/copied/i)).toBeVisible()

    // 8. Verify clipboard
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toMatch(/!\[Coverage\]/)

    // 9. Check history
    const historyItems = page.getByTestId('history-item')
    await expect(historyItems.first()).toBeVisible()
  })

  test('First-time user onboarding flow', async ({ page }) => {
    await page.goto('/')

    // 1. See welcome message
    await expect(page.getByText(/welcome/i)).toBeVisible()

    // 2. Click "Get Started"
    await page.getByRole('button', { name: /get started/i }).click()

    // 3. View tutorial
    await expect(page.getByRole('dialog', { name: /tutorial/i })).toBeVisible()

    // 4. Step through tutorial
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next/i }).click()
    }

    // 5. Finish tutorial
    await page.getByRole('button', { name: /finish/i }).click()

    // 6. Verify tutorial is dismissed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('Badge customization workflow', async ({ page }) => {
    await page.goto('/badge-generator')

    // 1. Select badge type
    await page.getByLabel('Badge Type').selectOption('shields')

    // 2. Customize appearance
    await page.getByLabel('Style').selectOption('flat-square')
    await page.getByLabel('Label').fill('npm')
    await page.getByLabel('Message').fill('v1.0.0')

    // 3. Choose color scheme
    await page.getByLabel('Color Scheme').selectOption('blue')

    // 4. Add icon
    await page.getByLabel('Icon').fill('npm')

    // 5. Preview updates in real-time
    const preview = page.getByTestId('live-preview')
    await expect(preview).toBeVisible()
    await expect(preview.locator('img')).toHaveAttribute('src', /npm/)

    // 6. Generate final badge
    await page.getByRole('button', { name: /generate/i }).click()

    // 7. View code snippets
    const htmlTab = page.getByRole('tab', { name: 'HTML' })
    await htmlTab.click()
    await expect(page.getByRole('code')).toContainText('<img')

    const markdownTab = page.getByRole('tab', { name: 'Markdown' })
    await markdownTab.click()
    await expect(page.getByRole('code')).toContainText('![')
  })
})
```

### 5.2 Error Recovery Flow

```typescript
test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true)

    await page.goto('/badge-generator')

    await page.getByLabel('Label').fill('Test')
    await page.getByRole('button', { name: /generate/i }).click()

    // Verify error message
    await expect(page.getByText(/network error/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()

    // Go back online
    await context.setOffline(false)

    // Retry
    await page.getByRole('button', { name: /retry/i }).click()

    // Verify success
    await expect(page.getByTestId('preview')).toBeVisible()
  })

  test('should handle API errors', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/badges/generate', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/badge-generator')

    await page.getByLabel('Label').fill('Test')
    await page.getByRole('button', { name: /generate/i }).click()

    // Verify error handling
    await expect(page.getByText(/error generating badge/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
  })
})
```

---

## 6. Cross-Browser Testing

### 6.1 Browser-Specific Tests

```typescript
// e2e/tests/cross-browser.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test('should work in all browsers', async ({ page, browserName }) => {
    await page.goto('/')

    // Log browser being tested
    console.log(`Testing on: ${browserName}`)

    // Basic functionality should work across all browsers
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('clipboard functionality', async ({ page, browserName, context }) => {
    // Skip Safari due to clipboard limitations
    test.skip(browserName === 'webkit', 'Clipboard API limited in WebKit')

    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/badge-generator')

    // Test clipboard
    await page.getByLabel('Label').fill('Test')
    await page.getByRole('button', { name: /generate/i }).click()
    await page.getByRole('button', { name: /copy url/i }).click()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('shields.io')
  })

  test('CSS features', async ({ page, browserName }) => {
    await page.goto('/')

    // Check if CSS Grid is supported
    const gridSupported = await page.evaluate(() => {
      return CSS.supports('display', 'grid')
    })
    expect(gridSupported).toBe(true)

    // Check if Flexbox is supported
    const flexSupported = await page.evaluate(() => {
      return CSS.supports('display', 'flex')
    })
    expect(flexSupported).toBe(true)
  })
})
```

### 6.2 Browser-Specific Workarounds

```typescript
test('file download', async ({ page, browserName }) => {
  await page.goto('/badge-generator')

  // Setup download handler
  const downloadPromise = page.waitForEvent('download')

  await page.getByRole('button', { name: /download/i }).click()

  const download = await downloadPromise

  // Browser-specific handling
  if (browserName === 'webkit') {
    // WebKit might need special handling
    await download.saveAs(`./downloads/${download.suggestedFilename()}`)
  } else {
    await download.saveAs(`./downloads/${download.suggestedFilename()}`)
  }

  // Verify download
  expect(download.suggestedFilename()).toMatch(/\.svg$/)
})
```

---

## 7. Mobile Testing

### 7.1 Mobile Viewport Tests

```typescript
// e2e/tests/mobile.spec.ts

import { test, expect, devices } from '@playwright/test'

test.use(devices['iPhone 12'])

test.describe('Mobile Experience', () => {
  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/')

    // Check for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu/i })
    await expect(menuButton).toBeVisible()

    // Open menu
    await menuButton.click()

    // Check menu items
    await expect(page.getByRole('link', { name: 'Badges' })).toBeVisible()
  })

  test('should be touch-friendly', async ({ page }) => {
    await page.goto('/badge-generator')

    // Check button sizes (should be at least 44x44 for touch)
    const button = page.getByRole('button', { name: /generate/i })
    const box = await button.boundingBox()

    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.width).toBeGreaterThanOrEqual(44)
  })

  test('should handle orientation changes', async ({ page }) => {
    await page.goto('/')

    // Portrait mode
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading')).toBeVisible()

    // Landscape mode
    await page.setViewportSize({ width: 667, height: 375 })
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
```

### 7.2 Touch Gestures

```typescript
test('should support swipe gestures', async ({ page }) => {
  test.use(devices['iPhone 12'])

  await page.goto('/badges')

  // Get carousel element
  const carousel = page.getByTestId('badge-carousel')

  // Swipe left
  await carousel.dragTo(carousel, {
    force: true,
    sourcePosition: { x: 200, y: 100 },
    targetPosition: { x: 50, y: 100 },
  })

  // Verify carousel moved
  const secondItem = page.getByTestId('carousel-item-1')
  await expect(secondItem).toBeInViewport()
})

test('should support pinch zoom', async ({ page }) => {
  test.use(devices['iPhone 12'])

  await page.goto('/badge-preview')

  const preview = page.getByTestId('badge-preview')

  // Simulate pinch zoom (requires touch events)
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="badge-preview"]')
    const touchStart = new TouchEvent('touchstart', {
      touches: [
        { clientX: 100, clientY: 100 } as Touch,
        { clientX: 200, clientY: 200 } as Touch,
      ],
    })
    element?.dispatchEvent(touchStart)
  })
})
```

---

## 8. Performance Testing

### 8.1 Page Load Performance

```typescript
// e2e/tests/performance.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('should load home page quickly', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/')

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve({
            FCP: entries.find((e) => e.name === 'first-contentful-paint'),
            LCP: entries.find((e) => e.entryType === 'largest-contentful-paint'),
          })
        })
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      })
    })

    // FCP should be under 1.5s
    expect((metrics as any).FCP.startTime).toBeLessThan(1500)

    // LCP should be under 2.5s
    expect((metrics as any).LCP.startTime).toBeLessThan(2500)
  })

  test('should have acceptable bundle size', async ({ page }) => {
    const resources: any[] = []

    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        resources.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const totalSize = resources.reduce((sum, r) => sum + r.size, 0)

    // Total JS + CSS should be under 500KB
    expect(totalSize).toBeLessThan(500 * 1024)
  })
})
```

### 8.2 Network Performance

```typescript
test('should handle slow network', async ({ page, context }) => {
  // Simulate slow 3G
  await context.route('**/*', (route) => {
    setTimeout(() => route.continue(), 1000) // 1s delay
  })

  await page.goto('/')

  // Verify loading state
  await expect(page.getByTestId('loading-spinner')).toBeVisible()

  // Wait for content
  await expect(page.getByRole('heading')).toBeVisible({ timeout: 10000 })
})

test('should optimize image loading', async ({ page }) => {
  const images: string[] = []

  page.on('response', (response) => {
    if (response.url().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      images.push(response.url())
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Check if images use modern formats
  const hasWebP = images.some((url) => url.includes('.webp'))
  expect(hasWebP).toBeTruthy()
})
```

---

## 9. Visual Regression

### 9.1 Screenshot Testing

```typescript
// e2e/tests/visual.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('home page screenshot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('home-page.png')
  })

  test('badge generator screenshot', async ({ page }) => {
    await page.goto('/badge-generator')
    await expect(page).toHaveScreenshot('badge-generator.png')
  })

  test('component screenshots', async ({ page }) => {
    await page.goto('/badge-generator')

    // Generate badge
    await page.getByLabel('Label').fill('Test')
    await page.getByRole('button', { name: /generate/i }).click()

    // Screenshot of preview
    const preview = page.getByTestId('preview')
    await expect(preview).toHaveScreenshot('badge-preview.png')
  })

  test('responsive screenshots', async ({ page }) => {
    await page.goto('/')

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page).toHaveScreenshot('home-desktop.png')

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page).toHaveScreenshot('home-tablet.png')

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('home-mobile.png')
  })
})
```

### 9.2 Visual Comparison Options

```typescript
test('screenshot with options', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveScreenshot({
    // Mask dynamic content
    mask: [page.getByTestId('timestamp')],

    // Full page screenshot
    fullPage: true,

    // Allow minor differences
    maxDiffPixels: 100,

    // Animation handling
    animations: 'disabled',
  })
})
```

---

## 10. Best Practices

### 10.1 Test Organization

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  })

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  })

  test.describe('Happy Path', () => {
    test('should complete main workflow', async ({ page }) => {
      // Test implementation
    })
  })

  test.describe('Error Cases', () => {
    test('should handle errors', async ({ page }) => {
      // Test implementation
    })
  })
})
```

### 10.2 Assertions

```typescript
// ✅ Good assertions
await expect(page.getByRole('button')).toBeVisible()
await expect(page).toHaveURL(/expected-url/)
await expect(page.getByText('Success')).toContainText('Success')

// ❌ Avoid hard waits
await page.waitForTimeout(5000) // Bad

// ✅ Use smart waits
await page.waitForLoadState('networkidle')
await page.waitForSelector('[data-testid="preview"]')
```

### 10.3 Debugging

```typescript
// Debug mode
test('debug test', async ({ page }) => {
  await page.goto('/')

  // Pause execution
  await page.pause()

  // Or use debugger
  // npx playwright test --debug
})

// Screenshots on failure
test('take screenshot on failure', async ({ page }, testInfo) => {
  try {
    await page.goto('/')
    // Test assertions
  } catch (error) {
    await page.screenshot({
      path: `screenshots/${testInfo.title}.png`,
    })
    throw error
  }
})
```

### 10.4 Parallel Execution

```typescript
// Run tests in parallel
test.describe.configure({ mode: 'parallel' })

test.describe('Parallel Tests', () => {
  test('test 1', async ({ page }) => {
    // Independent test
  })

  test('test 2', async ({ page }) => {
    // Independent test
  })
})

// Run tests serially
test.describe.configure({ mode: 'serial' })

test.describe('Serial Tests', () => {
  test('test 1', async ({ page }) => {
    // Depends on previous state
  })

  test('test 2', async ({ page }) => {
    // Depends on test 1
  })
})
```

---

**Document End**

Last Updated: 2025-11-05
