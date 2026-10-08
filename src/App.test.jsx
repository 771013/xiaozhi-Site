// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

class IntersectionObserverStub {
  observe() {}
  disconnect() {}
}

describe('小支租车官网交互', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('车型介绍和小支比价保持静态展示，不提供卡片点击切换', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('#cars button')).toHaveLength(0)
    expect(container.querySelectorAll('#compare button')).toHaveLength(0)
    expect(container.querySelector('#cars .car-card.featured')).toHaveTextContent('豪华型')
    expect(container.querySelector('#compare .compare-row.active')).toHaveTextContent('安心护航')
  })

  it('打开比价弹窗后可按 Escape 关闭并恢复按钮焦点', () => {
    render(<App />)
    const openButton = screen.getByRole('button', { name: /立即去比价/ })

    fireEvent.click(openButton)
    expect(screen.getByRole('dialog')).toBeVisible()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(openButton).toHaveFocus()
  })

  it('页头使用完整品牌标识素材', () => {
    const { container } = render(<App />)
    const brandImage = container.querySelector('.site-header .brand-mark img')

    expect(brandImage).toHaveAttribute('src', '/assets/brand-logo.png')
  })
})
