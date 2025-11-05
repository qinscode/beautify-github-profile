# 单元测试文档
## Beautify GitHub Profile 项目

**文档版本**: 1.0.0
**测试框架**: Vitest
**创建日期**: 2025-11-05

---

## 📋 目录

1. [概述](#概述)
2. [测试环境配置](#测试环境配置)
3. [测试结构](#测试结构)
4. [工具函数测试](#工具函数测试)
5. [组件测试](#组件测试)
6. [Hooks 测试](#hooks-测试)
7. [状态管理测试](#状态管理测试)
8. [最佳实践](#最佳实践)
9. [示例代码](#示例代码)

---

## 1. 概述

### 1.1 什么是单元测试？

单元测试是软件测试的最小单位，用于验证代码中最小可测试部分（通常是函数或方法）的正确性。

### 1.2 为什么需要单元测试？

- ✅ **快速反馈**: 在开发过程中快速发现问题
- ✅ **代码质量**: 提高代码质量和可维护性
- ✅ **重构信心**: 重构时有测试保护
- ✅ **文档作用**: 测试即文档，展示代码如何使用
- ✅ **减少 Bug**: 在早期发现和修复缺陷

### 1.3 测试覆盖目标

| 类型 | 覆盖率目标 | 当前覆盖率 |
|------|------------|------------|
| 语句覆盖率 | ≥ 80% | - |
| 分支覆盖率 | ≥ 75% | - |
| 函数覆盖率 | ≥ 85% | - |
| 行覆盖率 | ≥ 80% | - |

---

## 2. 测试环境配置

### 2.1 安装依赖

```bash
# 安装 Vitest 和相关依赖
npm install -D vitest @vitest/ui @vitest/coverage-v8

# 安装 React 测试库（如果使用 React）
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# 安装 Vue 测试库（如果使用 Vue）
npm install -D @testing-library/vue @testing-library/jest-dom
```

### 2.2 Vitest 配置文件

创建 `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // 启用全局测试 API
    globals: true,

    // 测试环境
    environment: 'jsdom',

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/dist/**',
        '**/.storybook/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },

    // 测试文件匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // 排除文件
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
})
```

### 2.3 测试设置文件

创建 `tests/setup.ts`:

```typescript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// 扩展 expect 匹配器
expect.extend(matchers)

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
} as any

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
})
```

### 2.4 Package.json 脚本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

---

## 3. 测试结构

### 3.1 文件组织

```
src/
├── components/
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.test.tsx
│   │   └── index.ts
│   └── BadgeGenerator/
│       ├── BadgeGenerator.tsx
│       ├── BadgeGenerator.test.tsx
│       └── index.ts
├── utils/
│   ├── formatters.ts
│   ├── formatters.test.ts
│   ├── validators.ts
│   └── validators.test.ts
├── hooks/
│   ├── useClipboard.ts
│   ├── useClipboard.test.ts
│   ├── useBadgeGenerator.ts
│   └── useBadgeGenerator.test.ts
└── store/
    ├── badgeStore.ts
    └── badgeStore.test.ts
```

### 3.2 测试命名规范

- **文件命名**: `<ComponentName>.test.tsx` 或 `<fileName>.test.ts`
- **describe 块**: 描述被测试的组件或函数
- **it/test 块**: 描述具体的测试场景

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // 测试代码
  })

  it('should handle user input', () => {
    // 测试代码
  })

  describe('when user is logged in', () => {
    it('should show user menu', () => {
      // 测试代码
    })
  })
})
```

### 3.3 测试模式 AAA

- **Arrange** (准备): 设置测试数据和环境
- **Act** (执行): 执行被测试的代码
- **Assert** (断言): 验证结果

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ]

  // Act
  const result = calculateTotal(items)

  // Assert
  expect(result).toBe(35)
})
```

---

## 4. 工具函数测试

### 4.1 formatters.ts - 格式化函数

#### 4.1.1 被测试代码

```typescript
// src/utils/formatters.ts

/**
 * 格式化徽章 URL
 * @param label - 徽章标签
 * @param message - 徽章消息
 * @param color - 徽章颜色
 * @returns 格式化的 URL
 */
export function formatBadgeUrl(
  label: string,
  message?: string,
  color: string = 'blue'
): string {
  if (!label || label.trim() === '') {
    throw new Error('Label is required')
  }

  const encodedLabel = encodeURIComponent(label)
  const encodedMessage = message ? encodeURIComponent(message) : ''
  const encodedColor = encodeURIComponent(color)

  if (message) {
    return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${encodedColor}`
  }

  return `https://img.shields.io/badge/${encodedLabel}-${encodedColor}`
}

/**
 * 格式化 Markdown 代码
 * @param url - 图片 URL
 * @param alt - 替代文本
 * @returns Markdown 代码
 */
export function formatMarkdown(url: string, alt: string = 'Badge'): string {
  return `![${alt}](${url})`
}

/**
 * 格式化 HTML 代码
 * @param url - 图片 URL
 * @param alt - 替代文本
 * @returns HTML 代码
 */
export function formatHtml(url: string, alt: string = 'Badge'): string {
  return `<img src="${url}" alt="${alt}" />`
}

/**
 * 转换为 URL 友好的字符串
 * @param str - 输入字符串
 * @returns URL 友好的字符串
 */
export function toUrlFriendly(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
```

#### 4.1.2 测试代码

```typescript
// src/utils/formatters.test.ts

import { describe, it, expect } from 'vitest'
import {
  formatBadgeUrl,
  formatMarkdown,
  formatHtml,
  toUrlFriendly,
} from './formatters'

describe('formatters', () => {
  describe('formatBadgeUrl', () => {
    it('should format badge URL with label only', () => {
      const result = formatBadgeUrl('test', undefined, 'blue')
      expect(result).toBe('https://img.shields.io/badge/test-blue')
    })

    it('should format badge URL with label and message', () => {
      const result = formatBadgeUrl('build', 'passing', 'green')
      expect(result).toBe('https://img.shields.io/badge/build-passing-green')
    })

    it('should handle special characters in label', () => {
      const result = formatBadgeUrl('C++', 'v11', 'blue')
      expect(result).toBe('https://img.shields.io/badge/C%2B%2B-v11-blue')
    })

    it('should handle spaces in parameters', () => {
      const result = formatBadgeUrl('build status', 'all passing', 'green')
      expect(result).toBe(
        'https://img.shields.io/badge/build%20status-all%20passing-green'
      )
    })

    it('should use default color if not provided', () => {
      const result = formatBadgeUrl('test')
      expect(result).toBe('https://img.shields.io/badge/test-blue')
    })

    it('should throw error for empty label', () => {
      expect(() => formatBadgeUrl('')).toThrow('Label is required')
    })

    it('should throw error for whitespace-only label', () => {
      expect(() => formatBadgeUrl('   ')).toThrow('Label is required')
    })

    it('should handle undefined label', () => {
      expect(() => formatBadgeUrl(null as any)).toThrow()
    })
  })

  describe('formatMarkdown', () => {
    it('should format markdown with URL and alt text', () => {
      const url = 'https://example.com/badge.svg'
      const result = formatMarkdown(url, 'Build Status')
      expect(result).toBe('![Build Status](https://example.com/badge.svg)')
    })

    it('should use default alt text if not provided', () => {
      const url = 'https://example.com/badge.svg'
      const result = formatMarkdown(url)
      expect(result).toBe('![Badge](https://example.com/badge.svg)')
    })

    it('should handle empty alt text', () => {
      const url = 'https://example.com/badge.svg'
      const result = formatMarkdown(url, '')
      expect(result).toBe('[](https://example.com/badge.svg)')
    })
  })

  describe('formatHtml', () => {
    it('should format HTML with URL and alt text', () => {
      const url = 'https://example.com/badge.svg'
      const result = formatHtml(url, 'Build Status')
      expect(result).toBe(
        '<img src="https://example.com/badge.svg" alt="Build Status" />'
      )
    })

    it('should use default alt text if not provided', () => {
      const url = 'https://example.com/badge.svg'
      const result = formatHtml(url)
      expect(result).toBe('<img src="https://example.com/badge.svg" alt="Badge" />')
    })

    it('should handle special characters in URL', () => {
      const url = 'https://example.com/badge.svg?color=blue&style=flat'
      const result = formatHtml(url, 'Test')
      expect(result).toBe(
        '<img src="https://example.com/badge.svg?color=blue&style=flat" alt="Test" />'
      )
    })
  })

  describe('toUrlFriendly', () => {
    it('should convert string to URL friendly format', () => {
      expect(toUrlFriendly('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(toUrlFriendly('Hello@World!')).toBe('helloworld')
    })

    it('should replace multiple spaces with single dash', () => {
      expect(toUrlFriendly('Hello   World')).toBe('hello-world')
    })

    it('should remove trailing/leading whitespace', () => {
      expect(toUrlFriendly('  Hello World  ')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(toUrlFriendly('')).toBe('')
    })

    it('should handle string with only special characters', () => {
      expect(toUrlFriendly('!@#$%^&*()')).toBe('')
    })

    it('should preserve hyphens', () => {
      expect(toUrlFriendly('hello-world-test')).toBe('hello-world-test')
    })

    it('should collapse multiple hyphens', () => {
      expect(toUrlFriendly('hello---world')).toBe('hello-world')
    })
  })
})
```

### 4.2 validators.ts - 验证函数

#### 4.2.1 被测试代码

```typescript
// src/utils/validators.ts

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidGithubUsername(username: string): boolean {
  // GitHub username rules:
  // - Max 39 characters
  // - Alphanumeric and hyphens
  // - Cannot start/end with hyphen
  // - Cannot have consecutive hyphens
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)
}
```

#### 4.2.2 测试代码

```typescript
// src/utils/validators.test.ts

import { describe, it, expect } from 'vitest'
import {
  isValidUrl,
  isValidHexColor,
  isValidEmail,
  isValidGithubUsername,
} from './validators'

describe('validators', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('://example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidUrl('ftp://example.com')).toBe(true)
      expect(isValidUrl('mailto:test@example.com')).toBe(true)
    })
  })

  describe('isValidHexColor', () => {
    it('should validate 3-digit hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#FFF')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
    })

    it('should validate 6-digit hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
      expect(isValidHexColor('#123456')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('fff')).toBe(false)
      expect(isValidHexColor('#gg')).toBe(false)
      expect(isValidHexColor('#12345')).toBe(false)
      expect(isValidHexColor('#1234567')).toBe(false)
      expect(isValidHexColor('')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@example.com')).toBe(true)
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidGithubUsername', () => {
    it('should validate correct usernames', () => {
      expect(isValidGithubUsername('octocat')).toBe(true)
      expect(isValidGithubUsername('octo-cat')).toBe(true)
      expect(isValidGithubUsername('octocat123')).toBe(true)
      expect(isValidGithubUsername('123octocat')).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(isValidGithubUsername('-octocat')).toBe(false)
      expect(isValidGithubUsername('octocat-')).toBe(false)
      expect(isValidGithubUsername('octo--cat')).toBe(false)
      expect(isValidGithubUsername('octo_cat')).toBe(false)
      expect(isValidGithubUsername('')).toBe(false)
    })

    it('should enforce length limit', () => {
      const longName = 'a'.repeat(40)
      expect(isValidGithubUsername(longName)).toBe(false)

      const maxLengthName = 'a'.repeat(39)
      expect(isValidGithubUsername(maxLengthName)).toBe(true)
    })
  })
})
```

---

## 5. 组件测试

### 5.1 Badge 组件

#### 5.1.1 组件代码

```typescript
// src/components/Badge/Badge.tsx

import React from 'react'
import './Badge.css'

export interface BadgeProps {
  label: string
  message?: string
  color?: string
  icon?: string
  onClick?: () => void
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  message,
  color = 'blue',
  icon,
  onClick,
  className = '',
}) => {
  const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(
    label
  )}${message ? `-${encodeURIComponent(message)}` : ''}-${color}`

  return (
    <div className={`badge-container ${className}`} onClick={onClick}>
      {icon && <span className="badge-icon">{icon}</span>}
      <img src={badgeUrl} alt={`${label} badge`} className="badge-image" />
    </div>
  )
}
```

#### 5.1.2 测试代码

```typescript
// src/components/Badge/Badge.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with label only', () => {
      render(<Badge label="test" />)

      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'test badge')
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('test')
      )
    })

    it('should render badge with label and message', () => {
      render(<Badge label="build" message="passing" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('build')
      )
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('passing')
      )
    })

    it('should use custom color', () => {
      render(<Badge label="test" color="green" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('green')
      )
    })

    it('should render with icon', () => {
      render(<Badge label="test" icon="⭐" />)

      const icon = screen.getByText('⭐')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('badge-icon')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Badge label="test" className="custom-class" />
      )

      const badgeContainer = container.querySelector('.badge-container')
      expect(badgeContainer).toHaveClass('custom-class')
    })
  })

  describe('Interactions', () => {
    it('should handle onClick event', () => {
      const handleClick = vi.fn()
      render(<Badge label="test" onClick={handleClick} />)

      const container = screen.getByRole('img').parentElement
      fireEvent.click(container!)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not throw if onClick is not provided', () => {
      render(<Badge label="test" />)

      const container = screen.getByRole('img').parentElement
      expect(() => fireEvent.click(container!)).not.toThrow()
    })
  })

  describe('URL Encoding', () => {
    it('should encode special characters in label', () => {
      render(<Badge label="C++" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('C%2B%2B')
      )
    })

    it('should encode spaces', () => {
      render(<Badge label="build status" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('build%20status')
      )
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text', () => {
      render(<Badge label="build" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'build badge')
    })

    it('should be keyboard accessible when clickable', () => {
      const handleClick = vi.fn()
      render(<Badge label="test" onClick={handleClick} />)

      const container = screen.getByRole('img').parentElement
      container!.focus()

      expect(document.activeElement).toBe(container)
    })
  })
})
```

---

## 6. Hooks 测试

### 6.1 useClipboard Hook

#### 6.1.1 Hook 代码

```typescript
// src/hooks/useClipboard.ts

import { useState, useCallback } from 'react'

export interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
  reset: () => void
}

export function useClipboard(timeout = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, timeout)
      } catch (error) {
        console.error('Failed to copy:', error)
        setCopied(false)
      }
    },
    [timeout]
  )

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}
```

#### 6.1.2 测试代码

```typescript
// src/hooks/useClipboard.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useClipboard } from './useClipboard'

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useClipboard())

      expect(result.current.copied).toBe(false)
      expect(typeof result.current.copy).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('copy function', () => {
    it('should copy text to clipboard', async () => {
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
      expect(result.current.copied).toBe(true)
    })

    it('should reset copied state after timeout', async () => {
      const { result } = renderHook(() => useClipboard(1000))

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.copied).toBe(false)
      })
    })

    it('should use custom timeout', async () => {
      const { result } = renderHook(() => useClipboard(5000))

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(true)

      // After 4 seconds, should still be true
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(result.current.copied).toBe(true)

      // After 5 seconds, should be false
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.copied).toBe(false)
      })
    })

    it('should handle copy errors', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(
        new Error('Copy failed')
      )

      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(result.current.copied).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('reset function', () => {
    it('should reset copied state immediately', async () => {
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.copied).toBe(false)
    })

    it('should prevent timeout from resetting after manual reset', async () => {
      const { result } = renderHook(() => useClipboard(1000))

      await act(async () => {
        await result.current.copy('test text')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.copied).toBe(false)

      // Advance time past the original timeout
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Should still be false
      expect(result.current.copied).toBe(false)
    })
  })
})
```

---

## 7. 状态管理测试

### 7.1 Badge Store (Zustand)

#### 7.1.1 Store 代码

```typescript
// src/store/badgeStore.ts

import { create } from 'zustand'

export interface BadgeConfig {
  label: string
  message: string
  color: string
  style: 'flat' | 'flat-square' | 'plastic'
}

interface BadgeStore {
  config: BadgeConfig
  history: BadgeConfig[]
  setLabel: (label: string) => void
  setMessage: (message: string) => void
  setColor: (color: string) => void
  setStyle: (style: BadgeConfig['style']) => void
  setConfig: (config: Partial<BadgeConfig>) => void
  addToHistory: (config: BadgeConfig) => void
  clearHistory: () => void
  reset: () => void
}

const defaultConfig: BadgeConfig = {
  label: '',
  message: '',
  color: 'blue',
  style: 'flat',
}

export const useBadgeStore = create<BadgeStore>((set) => ({
  config: defaultConfig,
  history: [],

  setLabel: (label) =>
    set((state) => ({
      config: { ...state.config, label },
    })),

  setMessage: (message) =>
    set((state) => ({
      config: { ...state.config, message },
    })),

  setColor: (color) =>
    set((state) => ({
      config: { ...state.config, color },
    })),

  setStyle: (style) =>
    set((state) => ({
      config: { ...state.config, style },
    })),

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  addToHistory: (config) =>
    set((state) => ({
      history: [config, ...state.history].slice(0, 10), // Keep last 10
    })),

  clearHistory: () =>
    set(() => ({
      history: [],
    })),

  reset: () =>
    set(() => ({
      config: defaultConfig,
    })),
}))
```

#### 7.1.2 测试代码

```typescript
// src/store/badgeStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useBadgeStore } from './badgeStore'

describe('badgeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useBadgeStore.getState().reset()
      useBadgeStore.getState().clearHistory()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useBadgeStore.getState()

      expect(state.config).toEqual({
        label: '',
        message: '',
        color: 'blue',
        style: 'flat',
      })
      expect(state.history).toEqual([])
    })
  })

  describe('setLabel', () => {
    it('should update label', () => {
      act(() => {
        useBadgeStore.getState().setLabel('test')
      })

      const state = useBadgeStore.getState()
      expect(state.config.label).toBe('test')
    })

    it('should not affect other config properties', () => {
      act(() => {
        useBadgeStore.getState().setMessage('message')
        useBadgeStore.getState().setLabel('test')
      })

      const state = useBadgeStore.getState()
      expect(state.config.message).toBe('message')
      expect(state.config.label).toBe('test')
    })
  })

  describe('setMessage', () => {
    it('should update message', () => {
      act(() => {
        useBadgeStore.getState().setMessage('passing')
      })

      const state = useBadgeStore.getState()
      expect(state.config.message).toBe('passing')
    })
  })

  describe('setColor', () => {
    it('should update color', () => {
      act(() => {
        useBadgeStore.getState().setColor('green')
      })

      const state = useBadgeStore.getState()
      expect(state.config.color).toBe('green')
    })
  })

  describe('setStyle', () => {
    it('should update style', () => {
      act(() => {
        useBadgeStore.getState().setStyle('flat-square')
      })

      const state = useBadgeStore.getState()
      expect(state.config.style).toBe('flat-square')
    })
  })

  describe('setConfig', () => {
    it('should update multiple config properties', () => {
      act(() => {
        useBadgeStore.getState().setConfig({
          label: 'build',
          message: 'passing',
          color: 'green',
        })
      })

      const state = useBadgeStore.getState()
      expect(state.config).toEqual({
        label: 'build',
        message: 'passing',
        color: 'green',
        style: 'flat', // unchanged
      })
    })

    it('should merge with existing config', () => {
      act(() => {
        useBadgeStore.getState().setLabel('test')
        useBadgeStore.getState().setConfig({
          color: 'red',
        })
      })

      const state = useBadgeStore.getState()
      expect(state.config.label).toBe('test')
      expect(state.config.color).toBe('red')
    })
  })

  describe('addToHistory', () => {
    it('should add config to history', () => {
      const config = {
        label: 'test',
        message: 'success',
        color: 'green',
        style: 'flat' as const,
      }

      act(() => {
        useBadgeStore.getState().addToHistory(config)
      })

      const state = useBadgeStore.getState()
      expect(state.history).toHaveLength(1)
      expect(state.history[0]).toEqual(config)
    })

    it('should add new items to the beginning', () => {
      const config1 = {
        label: 'test1',
        message: 'success',
        color: 'green',
        style: 'flat' as const,
      }

      const config2 = {
        label: 'test2',
        message: 'failed',
        color: 'red',
        style: 'flat' as const,
      }

      act(() => {
        useBadgeStore.getState().addToHistory(config1)
        useBadgeStore.getState().addToHistory(config2)
      })

      const state = useBadgeStore.getState()
      expect(state.history[0]).toEqual(config2)
      expect(state.history[1]).toEqual(config1)
    })

    it('should keep only last 10 items', () => {
      act(() => {
        for (let i = 0; i < 15; i++) {
          useBadgeStore.getState().addToHistory({
            label: `test${i}`,
            message: 'success',
            color: 'green',
            style: 'flat',
          })
        }
      })

      const state = useBadgeStore.getState()
      expect(state.history).toHaveLength(10)
      expect(state.history[0].label).toBe('test14')
      expect(state.history[9].label).toBe('test5')
    })
  })

  describe('clearHistory', () => {
    it('should clear history', () => {
      act(() => {
        useBadgeStore.getState().addToHistory({
          label: 'test',
          message: 'success',
          color: 'green',
          style: 'flat',
        })
        useBadgeStore.getState().clearHistory()
      })

      const state = useBadgeStore.getState()
      expect(state.history).toHaveLength(0)
    })
  })

  describe('reset', () => {
    it('should reset config to default', () => {
      act(() => {
        useBadgeStore.getState().setConfig({
          label: 'test',
          message: 'success',
          color: 'green',
          style: 'flat-square',
        })
        useBadgeStore.getState().reset()
      })

      const state = useBadgeStore.getState()
      expect(state.config).toEqual({
        label: '',
        message: '',
        color: 'blue',
        style: 'flat',
      })
    })

    it('should not clear history', () => {
      act(() => {
        useBadgeStore.getState().addToHistory({
          label: 'test',
          message: 'success',
          color: 'green',
          style: 'flat',
        })
        useBadgeStore.getState().reset()
      })

      const state = useBadgeStore.getState()
      expect(state.history).toHaveLength(1)
    })
  })
})
```

---

## 8. 最佳实践

### 8.1 测试原则

#### 8.1.1 独立性
- ✅ 每个测试应该是独立的
- ✅ 不依赖其他测试的执行顺序
- ✅ 使用 beforeEach/afterEach 清理状态

```typescript
describe('Component', () => {
  beforeEach(() => {
    // 每个测试前重置状态
    localStorage.clear()
  })

  it('test 1', () => {
    // 不依赖其他测试
  })

  it('test 2', () => {
    // 独立执行
  })
})
```

#### 8.1.2 可读性
- ✅ 使用描述性的测试名称
- ✅ 遵循 AAA 模式
- ✅ 一个测试只验证一个功能点

```typescript
// ❌ 不好的命名
it('test 1', () => {})

// ✅ 好的命名
it('should calculate total price when items are added to cart', () => {})
```

#### 8.1.3 完整性
- ✅ 测试正常情况
- ✅ 测试边界情况
- ✅ 测试错误情况

```typescript
describe('divide', () => {
  it('should divide two numbers correctly', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('should handle zero dividend', () => {
    expect(divide(0, 5)).toBe(0)
  })

  it('should throw error for division by zero', () => {
    expect(() => divide(10, 0)).toThrow()
  })

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
})
```

### 8.2 测试覆盖

#### 8.2.1 关键路径优先
- 主要功能
- 用户交互
- 数据处理

#### 8.2.2 覆盖率目标
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 85,
    lines: 80,
  }
}
```

#### 8.2.3 查看覆盖率报告
```bash
npm run test:coverage
open coverage/index.html
```

### 8.3 Mock 和 Stub

#### 8.3.1 Mock 函数
```typescript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockResolvedValue({ data: 'test' })

expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg')
```

#### 8.3.2 Mock 模块
```typescript
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}))
```

#### 8.3.3 Mock 定时器
```typescript
vi.useFakeTimers()

// 快进时间
vi.advanceTimersByTime(1000)

// 执行所有定时器
vi.runAllTimers()

vi.useRealTimers()
```

### 8.4 测试调试

#### 8.4.1 调试单个测试
```typescript
it.only('should test this one', () => {
  // 只运行这个测试
})
```

#### 8.4.2 跳过测试
```typescript
it.skip('should test this later', () => {
  // 跳过这个测试
})
```

#### 8.4.3 查看渲染结果
```typescript
import { screen } from '@testing-library/react'

const { debug } = render(<Component />)
debug() // 打印 DOM
screen.logTestingPlaygroundURL() // 生成 playground URL
```

---

## 9. 示例代码

完整的测试示例项目结构：

```
src/
├── components/
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.test.tsx
│   │   ├── Badge.stories.tsx
│   │   └── index.ts
│   └── BadgeGenerator/
│       ├── BadgeGenerator.tsx
│       ├── BadgeGenerator.test.tsx
│       ├── BadgeGenerator.stories.tsx
│       └── index.ts
├── utils/
│   ├── formatters.ts
│   ├── formatters.test.ts
│   ├── validators.ts
│   └── validators.test.ts
├── hooks/
│   ├── useClipboard.ts
│   ├── useClipboard.test.ts
│   ├── useBadgeGenerator.ts
│   └── useBadgeGenerator.test.ts
├── store/
│   ├── badgeStore.ts
│   └── badgeStore.test.ts
└── tests/
    ├── setup.ts
    └── helpers/
        └── testUtils.tsx
```

---

**文档结束**

最后更新: 2025-11-05
