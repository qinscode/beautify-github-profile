# 集成测试文档
## Beautify GitHub Profile 项目

**文档版本**: 1.0.0
**测试框架**: Vitest + Testing Library
**创建日期**: 2025-11-05

---

## 📋 目录

1. [概述](#概述)
2. [集成测试策略](#集成测试策略)
3. [API 集成测试](#api-集成测试)
4. [组件集成测试](#组件集成测试)
5. [路由集成测试](#路由集成测试)
6. [状态管理集成测试](#状态管理集成测试)
7. [表单集成测试](#表单集成测试)
8. [最佳实践](#最佳实践)

---

## 1. 概述

### 1.1 什么是集成测试？

集成测试验证多个模块、组件或服务之间的交互是否正常工作。它位于单元测试和端到端测试之间，确保系统的各个部分能够正确地协同工作。

### 1.2 集成测试 vs 单元测试

| 特性 | 单元测试 | 集成测试 |
|------|----------|----------|
| 测试范围 | 单个函数/组件 | 多个模块的交互 |
| 依赖 | 完全隔离（Mock） | 部分真实依赖 |
| 执行速度 | 快 | 中等 |
| 失败定位 | 容易 | 较难 |
| 覆盖范围 | 小 | 中 |

### 1.3 测试目标

- ✅ 验证组件间的数据流动
- ✅ 测试 API 调用和响应处理
- ✅ 验证状态管理在多个组件中的一致性
- ✅ 测试用户流程的关键路径
- ✅ 确保路由和导航正常工作

---

## 2. 集成测试策略

### 2.1 测试金字塔中的位置

```
           /\
          /  \
         / E2E \      10%
        /--------\
       /          \
      / Integration \   20%
     /    Tests      \
    /------------------\
   /                    \
  /    Unit Tests        \  70%
 /________________________\
```

### 2.2 什么应该进行集成测试？

#### 应该测试：
- ✅ 组件组合和通信
- ✅ API 调用和数据处理
- ✅ 表单提交流程
- ✅ 用户认证流程
- ✅ 状态同步
- ✅ 路由导航

#### 不应该测试：
- ❌ 纯 UI 样式（使用 Storybook）
- ❌ 单个函数的逻辑（使用单元测试）
- ❌ 完整的用户旅程（使用 E2E 测试）

### 2.3 测试环境设置

```typescript
// tests/integration/setup.ts

import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// 设置 MSW 服务器
export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
```

---

## 3. API 集成测试

### 3.1 Mock Service Worker (MSW) 配置

#### 3.1.1 安装 MSW

```bash
npm install -D msw
```

#### 3.1.2 配置 API Mock

```typescript
// tests/mocks/handlers.ts

import { http, HttpResponse } from 'msw'

export const handlers = [
  // 获取徽章列表
  http.get('/api/badges', () => {
    return HttpResponse.json({
      badges: [
        {
          id: '1',
          name: 'GitHub Stars',
          category: 'stats',
          url: 'https://img.shields.io/github/stars/user/repo',
        },
        {
          id: '2',
          name: 'Build Status',
          category: 'ci',
          url: 'https://img.shields.io/github/workflow/status/user/repo/CI',
        },
      ],
    })
  }),

  // 生成自定义徽章
  http.post('/api/badges/generate', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      badge: {
        id: '3',
        url: `https://img.shields.io/badge/${body.label}-${body.message}-${body.color}`,
        markdown: `![${body.label}](url)`,
        html: `<img src="url" alt="${body.label}" />`,
      },
    })
  }),

  // 保存配置
  http.post('/api/config/save', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      configId: 'config-123',
    })
  }),

  // 错误场景
  http.get('/api/badges/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }),
]
```

### 3.2 API 服务测试

#### 3.2.1 服务代码

```typescript
// src/services/badgeService.ts

export interface Badge {
  id: string
  name: string
  category: string
  url: string
}

export interface GenerateBadgeRequest {
  label: string
  message: string
  color: string
}

export interface GenerateBadgeResponse {
  badge: {
    id: string
    url: string
    markdown: string
    html: string
  }
}

export const badgeService = {
  async getBadges(): Promise<Badge[]> {
    const response = await fetch('/api/badges')

    if (!response.ok) {
      throw new Error('Failed to fetch badges')
    }

    const data = await response.json()
    return data.badges
  },

  async generateBadge(
    request: GenerateBadgeRequest
  ): Promise<GenerateBadgeResponse> {
    const response = await fetch('/api/badges/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Failed to generate badge')
    }

    return response.json()
  },

  async saveConfig(config: any): Promise<{ success: boolean; configId: string }> {
    const response = await fetch('/api/config/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error('Failed to save config')
    }

    return response.json()
  },
}
```

#### 3.2.2 测试代码

```typescript
// src/services/badgeService.test.ts

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '../../tests/mocks/handlers'
import { badgeService } from './badgeService'

const server = setupServer(...handlers)

describe('badgeService Integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('getBadges', () => {
    it('should fetch badges successfully', async () => {
      const badges = await badgeService.getBadges()

      expect(badges).toHaveLength(2)
      expect(badges[0]).toMatchObject({
        id: '1',
        name: 'GitHub Stars',
        category: 'stats',
      })
    })

    it('should handle fetch errors', async () => {
      server.use(
        http.get('/api/badges', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      await expect(badgeService.getBadges()).rejects.toThrow(
        'Failed to fetch badges'
      )
    })
  })

  describe('generateBadge', () => {
    it('should generate badge successfully', async () => {
      const request = {
        label: 'test',
        message: 'passing',
        color: 'green',
      }

      const response = await badgeService.generateBadge(request)

      expect(response.badge).toMatchObject({
        id: '3',
        url: expect.stringContaining('test-passing-green'),
        markdown: expect.any(String),
        html: expect.any(String),
      })
    })

    it('should handle generation errors', async () => {
      server.use(
        http.post('/api/badges/generate', () => {
          return new HttpResponse(null, { status: 400 })
        })
      )

      const request = {
        label: '',
        message: '',
        color: '',
      }

      await expect(badgeService.generateBadge(request)).rejects.toThrow()
    })
  })

  describe('saveConfig', () => {
    it('should save config successfully', async () => {
      const config = {
        label: 'test',
        color: 'blue',
      }

      const response = await badgeService.saveConfig(config)

      expect(response).toMatchObject({
        success: true,
        configId: expect.any(String),
      })
    })
  })
})
```

---

## 4. 组件集成测试

### 4.1 复杂组件测试

#### 4.1.1 BadgeGenerator 组件

```typescript
// src/components/BadgeGenerator/BadgeGenerator.tsx

import React, { useState } from 'react'
import { Badge } from '../Badge'
import { useClipboard } from '../../hooks/useClipboard'
import { formatBadgeUrl, formatMarkdown } from '../../utils/formatters'
import { useBadgeStore } from '../../store/badgeStore'

export const BadgeGenerator: React.FC = () => {
  const { config, setLabel, setMessage, setColor, addToHistory } = useBadgeStore()
  const { copied, copy } = useClipboard()
  const [preview, setPreview] = useState<string>('')

  const handleGenerate = () => {
    if (!config.label) {
      return
    }

    const url = formatBadgeUrl(config.label, config.message, config.color)
    setPreview(url)
    addToHistory(config)
  }

  const handleCopy = async (format: 'url' | 'markdown') => {
    if (!preview) return

    const text =
      format === 'markdown' ? formatMarkdown(preview, config.label) : preview

    await copy(text)
  }

  return (
    <div className="badge-generator">
      <div className="form">
        <input
          type="text"
          placeholder="Label"
          value={config.label}
          onChange={(e) => setLabel(e.target.value)}
          data-testid="label-input"
        />

        <input
          type="text"
          placeholder="Message"
          value={config.message}
          onChange={(e) => setMessage(e.target.value)}
          data-testid="message-input"
        />

        <select
          value={config.color}
          onChange={(e) => setColor(e.target.value)}
          data-testid="color-select"
        >
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
        </select>

        <button onClick={handleGenerate} data-testid="generate-button">
          Generate
        </button>
      </div>

      {preview && (
        <div className="preview" data-testid="preview">
          <Badge label={config.label} message={config.message} color={config.color} />

          <div className="actions">
            <button onClick={() => handleCopy('url')} data-testid="copy-url-button">
              {copied ? 'Copied!' : 'Copy URL'}
            </button>

            <button
              onClick={() => handleCopy('markdown')}
              data-testid="copy-markdown-button"
            >
              Copy Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 4.1.2 集成测试

```typescript
// src/components/BadgeGenerator/BadgeGenerator.integration.test.tsx

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BadgeGenerator } from './BadgeGenerator'
import { useBadgeStore } from '../../store/badgeStore'

describe('BadgeGenerator Integration', () => {
  beforeEach(() => {
    // 重置 store
    useBadgeStore.getState().reset()
    useBadgeStore.getState().clearHistory()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Badge Generation Flow', () => {
    it('should complete full badge generation workflow', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      // 1. 输入 label
      const labelInput = screen.getByTestId('label-input')
      await user.type(labelInput, 'build')

      // 2. 输入 message
      const messageInput = screen.getByTestId('message-input')
      await user.type(messageInput, 'passing')

      // 3. 选择颜色
      const colorSelect = screen.getByTestId('color-select')
      await user.selectOptions(colorSelect, 'green')

      // 4. 点击生成
      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      // 5. 验证预览显示
      await waitFor(() => {
        expect(screen.getByTestId('preview')).toBeInTheDocument()
      })

      // 6. 验证徽章渲染
      const badge = screen.getByRole('img')
      expect(badge).toHaveAttribute('src', expect.stringContaining('build'))
      expect(badge).toHaveAttribute('src', expect.stringContaining('passing'))
      expect(badge).toHaveAttribute('src', expect.stringContaining('green'))

      // 7. 测试复制 URL
      const copyUrlButton = screen.getByTestId('copy-url-button')
      await user.click(copyUrlButton)

      // 8. 验证复制成功
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(copyUrlButton).toHaveTextContent('Copied!')
      })

      // 9. 验证历史记录
      const history = useBadgeStore.getState().history
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        label: 'build',
        message: 'passing',
        color: 'green',
      })
    })

    it('should handle empty label', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      // 预览不应该显示
      expect(screen.queryByTestId('preview')).not.toBeInTheDocument()
    })

    it('should update preview when config changes', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      // 第一次生成
      const labelInput = screen.getByTestId('label-input')
      await user.type(labelInput, 'test1')

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('preview')).toBeInTheDocument()
      })

      // 修改并重新生成
      await user.clear(labelInput)
      await user.type(labelInput, 'test2')
      await user.click(generateButton)

      // 验证预览更新
      const badge = screen.getByRole('img')
      expect(badge).toHaveAttribute('src', expect.stringContaining('test2'))

      // 验证历史记录有两条
      const history = useBadgeStore.getState().history
      expect(history).toHaveLength(2)
    })
  })

  describe('Copy Functionality Integration', () => {
    it('should copy URL format correctly', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      // 生成徽章
      await user.type(screen.getByTestId('label-input'), 'test')
      await user.click(screen.getByTestId('generate-button'))

      // 复制 URL
      await user.click(screen.getByTestId('copy-url-button'))

      await waitFor(() => {
        const calls = (navigator.clipboard.writeText as any).mock.calls
        expect(calls[0][0]).toMatch(/https:\/\/img\.shields\.io\/badge\/test-/)
      })
    })

    it('should copy Markdown format correctly', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      // 生成徽章
      await user.type(screen.getByTestId('label-input'), 'build')
      await user.type(screen.getByTestId('message-input'), 'passing')
      await user.click(screen.getByTestId('generate-button'))

      // 复制 Markdown
      await user.click(screen.getByTestId('copy-markdown-button'))

      await waitFor(() => {
        const calls = (navigator.clipboard.writeText as any).mock.calls
        const markdown = calls[calls.length - 1][0]
        expect(markdown).toMatch(/!\[build\]\(https:/)
      })
    })
  })

  describe('State Management Integration', () => {
    it('should sync with store correctly', async () => {
      const user = userEvent.setup()
      render(<BadgeGenerator />)

      // 通过 UI 更新
      await user.type(screen.getByTestId('label-input'), 'test')

      // 验证 store 更新
      const store = useBadgeStore.getState()
      expect(store.config.label).toBe('test')
    })

    it('should maintain history across re-renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<BadgeGenerator />)

      // 生成第一个徽章
      await user.type(screen.getByTestId('label-input'), 'badge1')
      await user.click(screen.getByTestId('generate-button'))

      // 重新渲染
      rerender(<BadgeGenerator />)

      // 历史记录应该保持
      const history = useBadgeStore.getState().history
      expect(history).toHaveLength(1)
      expect(history[0].label).toBe('badge1')
    })
  })
})
```

---

## 5. 路由集成测试

### 5.1 路由配置

```typescript
// src/router/index.tsx

import { createBrowserRouter } from 'react-router-dom'
import { Home } from '../pages/Home'
import { Badges } from '../pages/Badges'
import { Widgets } from '../pages/Widgets'
import { BadgeDetail } from '../pages/BadgeDetail'
import { NotFound } from '../pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/badges',
    element: <Badges />,
  },
  {
    path: '/badges/:id',
    element: <BadgeDetail />,
  },
  {
    path: '/widgets',
    element: <Widgets />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
```

### 5.2 路由测试

```typescript
// src/router/router.integration.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

const routes = [
  {
    path: '/',
    element: <div>Home Page</div>,
  },
  {
    path: '/badges',
    element: (
      <div>
        <h1>Badges</h1>
        <a href="/badges/1">Badge 1</a>
      </div>
    ),
  },
  {
    path: '/badges/:id',
    element: <div>Badge Detail</div>,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]

describe('Router Integration', () => {
  describe('Navigation', () => {
    it('should navigate to badges page', async () => {
      const router = createMemoryRouter(routes, {
        initialEntries: ['/'],
      })

      render(<RouterProvider router={router} />)

      expect(screen.getByText('Home Page')).toBeInTheDocument()

      // 编程式导航
      router.navigate('/badges')

      await waitFor(() => {
        expect(screen.getByText('Badges')).toBeInTheDocument()
      })
    })

    it('should navigate with link clicks', async () => {
      const user = userEvent.setup()
      const router = createMemoryRouter(routes, {
        initialEntries: ['/badges'],
      })

      render(<RouterProvider router={router} />)

      const link = screen.getByText('Badge 1')
      await user.click(link)

      await waitFor(() => {
        expect(screen.getByText('Badge Detail')).toBeInTheDocument()
      })
    })

    it('should show 404 for unknown routes', () => {
      const router = createMemoryRouter(routes, {
        initialEntries: ['/unknown'],
      })

      render(<RouterProvider router={router} />)

      expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })
  })

  describe('Route Parameters', () => {
    it('should pass route parameters correctly', () => {
      const BadgeDetailWithParam = () => {
        const params = useParams()
        return <div>Badge ID: {params.id}</div>
      }

      const router = createMemoryRouter(
        [
          {
            path: '/badges/:id',
            element: <BadgeDetailWithParam />,
          },
        ],
        {
          initialEntries: ['/badges/123'],
        }
      )

      render(<RouterProvider router={router} />)

      expect(screen.getByText('Badge ID: 123')).toBeInTheDocument()
    })
  })

  describe('Navigation History', () => {
    it('should support back navigation', async () => {
      const router = createMemoryRouter(routes, {
        initialEntries: ['/'],
      })

      render(<RouterProvider router={router} />)

      // 导航到 badges
      router.navigate('/badges')

      await waitFor(() => {
        expect(screen.getByText('Badges')).toBeInTheDocument()
      })

      // 返回
      router.navigate(-1)

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
    })
  })
})
```

---

## 6. 状态管理集成测试

### 6.1 多组件状态共享

```typescript
// tests/integration/state-sharing.test.tsx

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBadgeStore } from '../../src/store/badgeStore'

// 组件 A：编辑配置
const ConfigEditor = () => {
  const { config, setLabel, setColor } = useBadgeStore()

  return (
    <div>
      <input
        data-testid="editor-label"
        value={config.label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <select
        data-testid="editor-color"
        value={config.color}
        onChange={(e) => setColor(e.target.value)}
      >
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>
    </div>
  )
}

// 组件 B：显示配置
const ConfigDisplay = () => {
  const { config } = useBadgeStore()

  return (
    <div>
      <div data-testid="display-label">Label: {config.label}</div>
      <div data-testid="display-color">Color: {config.color}</div>
    </div>
  )
}

// 父组件
const App = () => {
  return (
    <div>
      <ConfigEditor />
      <ConfigDisplay />
    </div>
  )
}

describe('State Sharing Integration', () => {
  beforeEach(() => {
    useBadgeStore.getState().reset()
  })

  it('should share state between components', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 在编辑器中修改
    const labelInput = screen.getByTestId('editor-label')
    await user.type(labelInput, 'test')

    // 在显示器中验证
    expect(screen.getByTestId('display-label')).toHaveTextContent('Label: test')
  })

  it('should sync updates across components', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 修改 label
    await user.type(screen.getByTestId('editor-label'), 'build')
    expect(screen.getByTestId('display-label')).toHaveTextContent('build')

    // 修改 color
    await user.selectOptions(screen.getByTestId('editor-color'), 'green')
    expect(screen.getByTestId('display-color')).toHaveTextContent('green')
  })
})
```

---

## 7. 表单集成测试

### 7.1 复杂表单测试

```typescript
// src/components/BadgeForm/BadgeForm.integration.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BadgeForm } from './BadgeForm'

describe('BadgeForm Integration', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup()
      render(<BadgeForm onSubmit={mockOnSubmit} />)

      // 直接提交空表单
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // 验证错误消息
      await waitFor(() => {
        expect(screen.getByText(/label is required/i)).toBeInTheDocument()
      })

      // 验证未调用 onSubmit
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should validate field formats', async () => {
      const user = userEvent.setup()
      render(<BadgeForm onSubmit={mockOnSubmit} />)

      // 输入无效的 hex 颜色
      const colorInput = screen.getByLabelText(/custom color/i)
      await user.type(colorInput, 'invalid')

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid color format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      const user = userEvent.setup()
      render(<BadgeForm onSubmit={mockOnSubmit} />)

      // 填写表单
      await user.type(screen.getByLabelText(/label/i), 'build')
      await user.type(screen.getByLabelText(/message/i), 'passing')
      await user.selectOptions(screen.getByLabelText(/color/i), 'green')

      // 提交
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // 验证调用
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          label: 'build',
          message: 'passing',
          color: 'green',
          style: 'flat', // 默认值
        })
      })
    })

    it('should handle submission errors', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockRejectedValueOnce(new Error('API Error'))

      render(<BadgeForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/label/i), 'test')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to submit/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset form after submission', async () => {
      const user = userEvent.setup()
      render(<BadgeForm onSubmit={mockOnSubmit} resetAfterSubmit />)

      const labelInput = screen.getByLabelText(/label/i)
      await user.type(labelInput, 'test')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(labelInput).toHaveValue('')
      })
    })
  })
})
```

---

## 8. 最佳实践

### 8.1 测试组织

```typescript
describe('Feature Integration', () => {
  // 设置和清理
  beforeEach(() => {
    // 重置状态
  })

  describe('Happy Path', () => {
    it('should complete main workflow', () => {
      // 测试主要流程
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      // 测试错误场景
    })
  })

  describe('Edge Cases', () => {
    it('should handle boundary conditions', () => {
      // 测试边界情况
    })
  })
})
```

### 8.2 测试数据管理

```typescript
// tests/fixtures/badges.ts

export const mockBadges = {
  github: {
    id: '1',
    name: 'GitHub Stars',
    category: 'stats',
    url: 'https://img.shields.io/github/stars/user/repo',
  },
  build: {
    id: '2',
    name: 'Build Status',
    category: 'ci',
    url: 'https://img.shields.io/github/workflow/status/user/repo/CI',
  },
}

export const mockConfigs = {
  basic: {
    label: 'test',
    message: 'passing',
    color: 'green',
    style: 'flat' as const,
  },
  advanced: {
    label: 'coverage',
    message: '95%',
    color: 'brightgreen',
    style: 'flat-square' as const,
  },
}
```

### 8.3 异步测试

```typescript
describe('Async Operations', () => {
  it('should handle async updates', async () => {
    render(<Component />)

    // 触发异步操作
    fireEvent.click(screen.getByRole('button'))

    // 等待结果
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  it('should handle loading states', async () => {
    render(<Component />)

    fireEvent.click(screen.getByRole('button'))

    // 验证加载状态
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // 等待完成
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })
})
```

### 8.4 错误边界测试

```typescript
import { ErrorBoundary } from 'react-error-boundary'

describe('Error Boundary Integration', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const { container } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(container).toHaveTextContent('Error occurred')
  })
})
```

---

**文档结束**

最后更新: 2025-11-05
