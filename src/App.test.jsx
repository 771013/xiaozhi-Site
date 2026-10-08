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

  it('用方向键切换车型标签，并把焦点移到新标签', () => {
    render(<App />)
    const luxuryTab = screen.getByRole('tab', { name: /豪华型/ })

    luxuryTab.focus()
    fireEvent.keyDown(luxuryTab, { key: 'ArrowRight' })

    const energyTabs = screen.getAllByRole('tab', { name: /新能源/ })
    expect(energyTabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(energyTabs[0]).toHaveFocus()
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
