# Storybook Component Testing Documentation
## Beautify GitHub Profile Project

**Document Version**: 1.0.0
**Testing Framework**: Storybook 7+
**Created Date**: 2025-11-05

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What is Storybook?](#what-is-storybook)
3. [Setup and Configuration](#setup-and-configuration)
4. [Writing Stories](#writing-stories)
5. [Component Testing](#component-testing)
6. [Visual Testing](#visual-testing)
7. [Interaction Testing](#interaction-testing)
8. [Accessibility Testing](#accessibility-testing)
9. [Documentation](#documentation)
10. [Best Practices](#best-practices)

---

## 1. Overview

### 1.1 Purpose

Storybook is a frontend workshop for building UI components and pages in isolation. It helps you:
- Develop components independently
- Document component usage
- Test component states visually
- Ensure accessibility compliance
- Share components across teams

### 1.2 Benefits

- ✅ **Isolated Development**: Build components without running the entire app
- ✅ **Visual Testing**: See all component states at once
- ✅ **Documentation**: Auto-generate component docs
- ✅ **Collaboration**: Share components with designers and stakeholders
- ✅ **Quality Assurance**: Test edge cases and error states
- ✅ **Regression Prevention**: Catch visual bugs early

---

## 2. What is Storybook?

### 2.1 Core Concepts

#### Stories
A story captures the rendered state of a UI component. It's a function that returns a component's state given a set of arguments.

```typescript
export const Primary = {
  args: {
    label: 'Button',
    variant: 'primary',
  },
}
```

#### Args
Args are component inputs (props) that can be dynamically changed in the Storybook UI.

#### Controls
Interactive controls that let you modify args in real-time without changing code.

### 2.2 Storybook Workflow

```
1. Write Component
   ↓
2. Create Story
   ↓
3. View in Storybook
   ↓
4. Test Interactions
   ↓
5. Document Usage
   ↓
6. Share with Team
```

---

## 3. Setup and Configuration

### 3.1 Installation

```bash
# Install Storybook
npx storybook@latest init

# Install additional addons
npm install -D @storybook/addon-a11y
npm install -D @storybook/addon-interactions
npm install -D @storybook/test-runner
npm install -D @storybook/addon-coverage
```

### 3.2 Configuration Files

#### 3.2.1 Main Configuration

Create `.storybook/main.js`:

```javascript
module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  staticDirs: ['../public'],
}
```

#### 3.2.2 Preview Configuration

Create `.storybook/preview.js`:

```javascript
import '../src/index.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#1a1a1a',
      },
    ],
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1920px',
          height: '1080px',
        },
      },
    },
  },
}

// Global decorators
export const decorators = [
  (Story) => (
    <div style={{ padding: '3rem' }}>
      <Story />
    </div>
  ),
]
```

#### 3.2.3 TypeScript Configuration

Create `.storybook/main.ts` for TypeScript support:

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

### 3.3 Package.json Scripts

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook",
    "test-storybook:ci": "concurrently -k -s first -n \"SB,TEST\" -c \"magenta,blue\" \"npm run build-storybook && npx http-server storybook-static --port 6006 --silent\" \"wait-on tcp:6006 && npm run test-storybook\""
  }
}
```

---

## 4. Writing Stories

### 4.1 Basic Story Structure

#### 4.1.1 Component-Story Format (CSF 3.0)

```typescript
// src/components/Badge/Badge.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

// Meta information about the component
const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The text displayed on the badge',
    },
    message: {
      control: 'text',
      description: 'Optional message to display',
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'red', 'yellow', 'orange'],
      description: 'Badge color',
    },
    icon: {
      control: 'text',
      description: 'Optional icon to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

// Primary story
export const Primary: Story = {
  args: {
    label: 'Badge',
    color: 'blue',
  },
}

// With message
export const WithMessage: Story = {
  args: {
    label: 'Build',
    message: 'Passing',
    color: 'green',
  },
}

// With icon
export const WithIcon: Story = {
  args: {
    label: 'GitHub',
    icon: '⭐',
    color: 'blue',
  },
}

// All colors
export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge label="Blue" color="blue" />
      <Badge label="Green" color="green" />
      <Badge label="Red" color="red" />
      <Badge label="Yellow" color="yellow" />
      <Badge label="Orange" color="orange" />
    </div>
  ),
}
```

### 4.2 Complex Component Stories

#### 4.2.1 Form Component

```typescript
// src/components/BadgeForm/BadgeForm.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { BadgeForm } from './BadgeForm'

const meta: Meta<typeof BadgeForm> = {
  title: 'Components/BadgeForm',
  component: BadgeForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof BadgeForm>

// Default state
export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Submitted:', data),
  },
}

// With initial values
export const WithInitialValues: Story = {
  args: {
    initialValues: {
      label: 'Build',
      message: 'Passing',
      color: 'green',
    },
    onSubmit: (data) => console.log('Submitted:', data),
  },
}

// Loading state
export const Loading: Story = {
  args: {
    isLoading: true,
    onSubmit: (data) => console.log('Submitted:', data),
  },
}

// With validation errors
export const WithErrors: Story = {
  args: {
    errors: {
      label: 'Label is required',
      color: 'Invalid color format',
    },
    onSubmit: (data) => console.log('Submitted:', data),
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    onSubmit: (data) => console.log('Submitted:', data),
  },
}
```

### 4.3 Story with Context

```typescript
// src/components/BadgeGenerator/BadgeGenerator.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { BadgeGenerator } from './BadgeGenerator'
import { useBadgeStore } from '../../store/badgeStore'

// Decorator to provide store context
const StoreDecorator = (Story: any) => {
  // Reset store before rendering
  useBadgeStore.getState().reset()

  return <Story />
}

const meta: Meta<typeof BadgeGenerator> = {
  title: 'Features/BadgeGenerator',
  component: BadgeGenerator,
  decorators: [StoreDecorator],
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BadgeGenerator>

export const Default: Story = {}

export const WithPrefilledData: Story = {
  decorators: [
    (Story) => {
      // Set initial state
      const store = useBadgeStore.getState()
      store.setLabel('Build')
      store.setMessage('Passing')
      store.setColor('green')

      return <Story />
    },
  ],
}

export const WithHistory: Story = {
  decorators: [
    (Story) => {
      // Add history items
      const store = useBadgeStore.getState()
      store.addToHistory({
        label: 'Build',
        message: 'Passing',
        color: 'green',
        style: 'flat',
      })
      store.addToHistory({
        label: 'Tests',
        message: '42 passed',
        color: 'blue',
        style: 'flat',
      })

      return <Story />
    },
  ],
}
```

---

## 5. Component Testing

### 5.1 Visual States Testing

#### 5.1.1 Button Component States

```typescript
// src/components/Button/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

// All button variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}

// All button sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
}

// Button states
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
      <Button icon="→">With Icon</Button>
    </div>
  ),
}

// Responsive behavior
export const Responsive: Story = {
  render: () => <Button fullWidth>Full Width Button</Button>,
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
```

### 5.2 Edge Cases Testing

```typescript
// src/components/Badge/Badge.stories.tsx

export const EdgeCases: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      {/* Very long text */}
      <Badge label="This is a very long label that might cause layout issues" />

      {/* Special characters */}
      <Badge label="C++" message="v17" />

      {/* Empty message */}
      <Badge label="Label" message="" />

      {/* Unicode characters */}
      <Badge label="Node.js" message="✓ Ready" />

      {/* Numbers */}
      <Badge label="Version" message="1.2.3" />
    </div>
  ),
}
```

### 5.3 Dark Mode Testing

```typescript
export const DarkMode: Story = {
  args: {
    label: 'Dark Mode',
    message: 'Enabled',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2rem' }}>
        <Badge label="Light Mode" color="blue" />
      </div>
      <div style={{ background: '#1a1a1a', padding: '2rem' }}>
        <Badge label="Dark Mode" color="blue" />
      </div>
    </div>
  ),
}
```

---

## 6. Visual Testing

### 6.1 Chromatic Setup

```bash
# Install Chromatic
npm install -D chromatic

# Run visual tests
npx chromatic --project-token=<your-project-token>
```

### 6.2 Visual Regression Testing

```typescript
// .storybook/preview.js

export const parameters = {
  chromatic: {
    // Delay capture to ensure fonts are loaded
    delay: 300,
    // Viewport sizes to test
    viewports: [320, 768, 1024, 1920],
  },
}
```

### 6.3 Snapshot Testing

```typescript
// src/components/Badge/Badge.stories.tsx

export const Snapshot: Story = {
  args: {
    label: 'Snapshot',
    message: 'Test',
    color: 'blue',
  },
  parameters: {
    chromatic: { disableSnapshot: false },
  },
}

// Disable snapshot for specific story
export const NoSnapshot: Story = {
  args: {
    label: 'No Snapshot',
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
}
```

---

## 7. Interaction Testing

### 7.1 Play Functions

```typescript
import { within, userEvent, expect } from '@storybook/test'

export const ClickInteraction: Story = {
  args: {
    onClick: () => alert('Clicked!'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find button
    const button = canvas.getByRole('button')

    // Click button
    await userEvent.click(button)

    // Verify state change
    expect(button).toHaveClass('clicked')
  },
}
```

### 7.2 Form Interactions

```typescript
export const FormInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill out form
    const labelInput = canvas.getByLabelText('Label')
    await userEvent.type(labelInput, 'Build')

    const messageInput = canvas.getByLabelText('Message')
    await userEvent.type(messageInput, 'Passing')

    const colorSelect = canvas.getByLabelText('Color')
    await userEvent.selectOptions(colorSelect, 'green')

    // Submit form
    const submitButton = canvas.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    // Verify result
    await expect(canvas.getByTestId('preview')).toBeVisible()
  },
}
```

### 7.3 Keyboard Navigation

```typescript
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab through focusable elements
    await userEvent.tab()
    expect(canvas.getByRole('textbox', { name: /label/i })).toHaveFocus()

    await userEvent.tab()
    expect(canvas.getByRole('textbox', { name: /message/i })).toHaveFocus()

    await userEvent.tab()
    expect(canvas.getByRole('combobox', { name: /color/i })).toHaveFocus()

    // Test keyboard shortcuts
    await userEvent.keyboard('{Enter}')
  },
}
```

### 7.4 Async Interactions

```typescript
export const AsyncOperation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click button that triggers async operation
    const button = canvas.getByRole('button', { name: /generate/i })
    await userEvent.click(button)

    // Verify loading state
    expect(canvas.getByText('Loading...')).toBeInTheDocument()

    // Wait for completion
    await waitFor(
      () => {
        expect(canvas.queryByText('Loading...')).not.toBeInTheDocument()
        expect(canvas.getByTestId('result')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  },
}
```

---

## 8. Accessibility Testing

### 8.1 A11y Addon Configuration

```javascript
// .storybook/preview.js

export const parameters = {
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
      ],
    },
    options: {
      checks: { 'color-contrast': { options: { noScroll: true } } },
      restoreScroll: true,
    },
  },
}
```

### 8.2 Accessibility Stories

```typescript
export const Accessible: Story = {
  args: {
    label: 'Accessible Badge',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}

export const ARIA: Story = {
  render: () => (
    <div>
      <button aria-label="Generate badge">
        <span aria-hidden="true">⚙️</span>
      </button>
      <div role="region" aria-label="Badge preview">
        <Badge label="Preview" />
      </div>
    </div>
  ),
}
```

### 8.3 Keyboard Accessibility

```typescript
export const KeyboardAccessible: Story = {
  render: () => (
    <div>
      <button tabIndex={0}>Focusable 1</button>
      <button tabIndex={0}>Focusable 2</button>
      <button tabIndex={0}>Focusable 3</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const buttons = canvas.getAllByRole('button')

    // Verify all buttons are keyboard accessible
    for (const button of buttons) {
      expect(button).toHaveAttribute('tabIndex', '0')
    }
  },
}
```

---

## 9. Documentation

### 9.1 Auto-Generated Docs

```typescript
const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'], // Enable auto-docs
  parameters: {
    docs: {
      description: {
        component: 'A flexible badge component for displaying status, labels, and information.',
      },
    },
  },
  argTypes: {
    label: {
      description: 'The main text displayed on the badge',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
}
```

### 9.2 MDX Documentation

Create `Badge.stories.mdx`:

```mdx
import { Meta, Canvas, Story, ArgsTable } from '@storybook/blocks'
import { Badge } from './Badge'
import * as BadgeStories from './Badge.stories'

<Meta of={BadgeStories} />

# Badge Component

A versatile badge component for displaying status, labels, and information.

## Usage

```tsx
import { Badge } from './components/Badge'

function App() {
  return <Badge label="Build" message="Passing" color="green" />
}
```

## Examples

### Basic Badge

<Canvas>
  <Story of={BadgeStories.Primary} />
</Canvas>

### With Message

<Canvas>
  <Story of={BadgeStories.WithMessage} />
</Canvas>

### All Colors

<Canvas>
  <Story of={BadgeStories.AllColors} />
</Canvas>

## Props

<ArgsTable of={Badge} />

## Best Practices

- Use semantic colors (green for success, red for error)
- Keep labels short and descriptive
- Ensure sufficient color contrast for accessibility
- Provide alt text for screen readers
```

### 9.3 Component Guidelines

```typescript
export const Guidelines: Story = {
  parameters: {
    docs: {
      page: () => (
        <div>
          <h1>Badge Component Guidelines</h1>

          <h2>When to Use</h2>
          <ul>
            <li>Displaying status information</li>
            <li>Showing counts or numbers</li>
            <li>Indicating categories or tags</li>
          </ul>

          <h2>When Not to Use</h2>
          <ul>
            <li>For long text content (use labels instead)</li>
            <li>As actionable buttons (use Button component)</li>
          </ul>

          <h2>Accessibility</h2>
          <ul>
            <li>Always provide meaningful alt text</li>
            <li>Ensure color contrast meets WCAG AA standards</li>
            <li>Don't rely solely on color to convey meaning</li>
          </ul>
        </div>
      ),
    },
  },
}
```

---

## 10. Best Practices

### 10.1 Story Organization

```
src/
├── components/
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.test.tsx
│   │   ├── Badge.stories.tsx
│   │   ├── Badge.stories.mdx
│   │   └── index.ts
```

### 10.2 Naming Conventions

```typescript
// ✅ Good naming
export const Primary: Story = {}
export const WithIcon: Story = {}
export const LargeSize: Story = {}

// ❌ Bad naming
export const Story1: Story = {}
export const Test: Story = {}
export const Example: Story = {}
```

### 10.3 Args vs Render

```typescript
// ✅ Use args for simple props
export const Simple: Story = {
  args: {
    label: 'Simple',
    color: 'blue',
  },
}

// ✅ Use render for complex layouts
export const Complex: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <Badge label="One" />
      <Badge label="Two" />
      <Badge label="Three" />
    </div>
  ),
}
```

### 10.4 Reusable Decorators

```typescript
// .storybook/decorators.tsx

export const CenterDecorator = (Story: any) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
    <Story />
  </div>
)

export const DarkModeDecorator = (Story: any) => (
  <div style={{ background: '#1a1a1a', padding: '3rem', minHeight: '100vh' }}>
    <Story />
  </div>
)

// Use in stories
export const Centered: Story = {
  decorators: [CenterDecorator],
}
```

### 10.5 Performance Optimization

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

export const LazyLoaded: Story = {
  render: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  ),
}
```

### 10.6 Testing Guidelines

```typescript
// ✅ Test user interactions
export const UserInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    expect(canvas.getByText('Success')).toBeInTheDocument()
  },
}

// ✅ Test edge cases
export const EdgeCase: Story = {
  args: {
    label: 'A'.repeat(100), // Very long text
  },
}

// ✅ Test error states
export const ErrorState: Story = {
  args: {
    error: true,
    errorMessage: 'Something went wrong',
  },
}
```

---

## 11. Running Storybook Tests

### 11.1 Development Mode

```bash
# Start Storybook
npm run storybook

# Open browser at http://localhost:6006
```

### 11.2 Build and Test

```bash
# Build Storybook
npm run build-storybook

# Test interactions
npm run test-storybook

# Test with coverage
npm run test-storybook -- --coverage
```

### 11.3 CI/CD Integration

```yaml
# .github/workflows/storybook.yml
name: Storybook Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Run Storybook tests
        run: npm run test-storybook

      - name: Publish to Chromatic
        run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

---

**Document End**

Last Updated: 2025-11-05
