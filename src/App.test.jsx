// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

const styles = readFileSync('src/styles.css', 'utf8')

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
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
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

  it('页头使用小支官网4的横版品牌标识', () => {
    const { container } = render(<App />)
    const brandImage = container.querySelector('.site-header .brand-logo')

    expect(brandImage).toHaveAttribute('src', '/assets/header-logo.svg')
    expect(container.querySelector('.site-header .brand-mark')).not.toBeInTheDocument()
  })

  it('小支比价蓝色区域的地球装饰水平镜像', () => {
    const { container } = render(<App />)
    const decoration = container.querySelector('#compare .compare-decoration')

    expect(decoration).toHaveStyle({ transform: 'scaleX(-1)' })
  })

  it('导航在页面顶部透明，滚动超过阈值后切换背景状态', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
    const { container } = render(<App />)
    const header = container.querySelector('.site-header')

    expect(header).toHaveClass('at-top')

    window.scrollY = 30
    fireEvent.scroll(window)
    expect(header).toHaveClass('is-scrolled')
  })

  it('按页面标注移除三个副标题中的逗号', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '比出好价格 租得更放心' })).toBeInTheDocument()
    expect(screen.getByText('透明价格 比出超高性价比')).toBeInTheDocument()
    expect(screen.getByText('订取用还 全程保障')).toBeInTheDocument()
  })

  it('观察器不可用时直接展示最终数据与内容', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(<App />)

    expect(container.querySelector('[data-count="50000"]')).toHaveTextContent('50000')
    expect(container.querySelector('[data-count="70000"]')).toHaveTextContent('70000')
    expect(container.querySelector('[data-count="800000"]')).toHaveTextContent('800000')
    expect(container.querySelector('[data-reveal]')).toHaveClass('is-visible')
  })

  it('系统减少动态效果时不等待观察器并直接展示最终数据', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const { container } = render(<App />)

    expect(container.querySelector('[data-count="50000"]')).toHaveTextContent('50000')
    expect(container.querySelector('[data-reveal]')).toHaveClass('is-visible')
  })

  it('五种车型都提供对应的场景文案', () => {
    render(<App />)

    ;[
      '格调出众，尊享体验',
      '安静高效，低碳智行',
      '驾控随心，释放激情',
      '宽适从容，体面出行',
      '一路皆景，自在安居',
    ].forEach((copy) => expect(screen.getByText(copy)).toBeInTheDocument())
  })

  it('比价高亮默认在安心护航，悬停项目时平滑切换并在离开后复位', () => {
    const { container } = render(<App />)
    const list = container.querySelector('#compare .compare-list')
    const rows = [...container.querySelectorAll('#compare .compare-row')]
    const highlight = container.querySelector('#compare .compare-highlight')

    expect(rows[1]).toHaveClass('active')
    expect(highlight.style.getPropertyValue('--active-index')).toBe('1')

    fireEvent.mouseEnter(rows[0])
    expect(rows[0]).toHaveClass('active')
    expect(highlight.style.getPropertyValue('--active-index')).toBe('0')

    fireEvent.mouseLeave(list)
    expect(rows[1]).toHaveClass('active')
    expect(highlight.style.getPropertyValue('--active-index')).toBe('1')
  })

  it('比价项目支持键盘焦点切换，焦点离开列表后恢复默认项', () => {
    const { container } = render(<App />)
    const list = container.querySelector('#compare .compare-list')
    const rows = [...container.querySelectorAll('#compare .compare-row')]

    fireEvent.focus(rows[2])
    expect(rows[2]).toHaveClass('active')

    fireEvent.blur(list, { relatedTarget: document.body })
    expect(rows[1]).toHaveClass('active')
  })

  it('桌面区块使用加高后的空间且联系我们保持原高度', () => {
    expect(styles).toMatch(/\.hero\{[^}]*height:828px/)
    expect(styles).toMatch(/\.about\{[^}]*height:858px/)
    expect(styles).toMatch(/\.cars\{[^}]*height:260vh/)
    expect(styles).toMatch(/\.compare\{[^}]*height:1026px/)
    expect(styles).toMatch(/\.service\{[^}]*height:1198px/)
    expect(styles).toMatch(/\.contact\{[^}]*height:708px/)
  })

  it('知心租背景保持封面比例，移动端车型使用横向吸附且减少动态效果可降级', () => {
    expect(styles).toMatch(/\.service\{[^}]*background-size:cover/)
    expect(styles).toMatch(/scroll-snap-type:x mandatory/)
    expect(styles).toMatch(/@media\(prefers-reduced-motion:reduce\)/)
  })
})
