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

  it('页头使用带白色描边圆角图标的小支官网4品牌标识', () => {
    const { container } = render(<App />)
    const brandImage = container.querySelector('.site-header .brand-logo')
    const brandIcon = container.querySelector('.site-header .brand-app-icon img')

    expect(brandImage).toHaveAttribute('src', '/assets/header-logo.svg')
    expect(brandIcon).toHaveAttribute('src', '/assets/brand-logo.png')
    expect(styles).toMatch(/\.brand-app-icon\{[^}]*border:1px solid #fff[^}]*border-radius:10px/)
  })

  it('首屏使用小支官网4的新主视觉和无箭头胶囊按钮', () => {
    const { container } = render(<App />)
    const primaryButton = screen.getByRole('button', { name: '立即去比价' })
    const secondaryButton = screen.getByRole('button', { name: '了解知心租' })

    expect(container.querySelector('.hero-visual')).toHaveAttribute('src', '/assets/hero-visual-figma4.png')
    expect(primaryButton.querySelector('img')).not.toBeInTheDocument()
    expect(secondaryButton.querySelector('img')).not.toBeInTheDocument()
    expect(styles).toMatch(/\.button\{[^}]*width:160px[^}]*height:50px[^}]*border-radius:25px/)
    expect(styles).toMatch(/\.button\.primary:hover,[^}]*\.button\.primary:focus-visible\{[^}]*color:#fff[^}]*background:#0056d6/)
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
    expect(screen.getByText('多样车型选择 满足不同出行场景')).toBeInTheDocument()
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

  it('十种车型按 Figma 分类循环展示，场景文案由连续焦点值控制显隐', () => {
    render(<App />)

    ;['舒适型', '经济型', 'SUV', '豪华型', '新能源', '跑车', '商务车', '房车', '小巴士', '皮卡']
      .forEach((title) => expect(screen.getByLabelText(title)).toBeInTheDocument())
    expect(document.querySelectorAll('#cars .car-card')).toHaveLength(10)
    expect(document.querySelectorAll('#cars .car-card .car-caption small')).toHaveLength(10)
    expect(styles).toMatch(/\.car-caption small\{[^}]*opacity:var\(--car-focus\)[^}]*transform:/)
    expect(styles).toMatch(/\.car-card::after\{[^}]*opacity:var\(--car-outline\)[^}]*transition:opacity/)
  })

  it('车型轨道脱离版心容器并直接铺满舞台宽度', () => {
    const { container } = render(<App />)

    expect(container.querySelector('#cars .cars-stage > .car-rail')).toBeInTheDocument()
    expect(container.querySelector('#cars .cars-content .car-rail')).not.toBeInTheDocument()
    expect(styles).toMatch(/\.car-rail\{[^}]*top:clamp\(210px,25vh,270px\)[^}]*right:0[^}]*bottom:auto[^}]*left:0/)
  })

  it('业务规模标题与数据区域使用相同的底部对齐偏移', () => {
    expect(styles).toMatch(/\.scale-heading\{[^}]*position:relative[^}]*top:-78px/)
    expect(styles).toMatch(/\.stats\{[^}]*transform:translate\(-8px,-78px\)/)
  })

  it('关于小支的两段介绍整体下移 50px', () => {
    expect(styles).toMatch(/\.about-copy\{[^}]*transform:translateY\(50px\)/)
  })

  it('联系我们为人物和左右交错文案提供独立揭示且人物入场后保持静止', () => {
    const { container } = render(<App />)

    expect(container.querySelector('#contact [data-contact-reveal="mascot"] .contact-mascot')).toBeInTheDocument()
    expect(container.querySelectorAll('#contact [data-contact-reveal="left"]')).toHaveLength(2)
    expect(container.querySelectorAll('#contact [data-contact-reveal="right"]')).toHaveLength(2)
    expect(styles).toMatch(/\[data-contact-reveal="mascot"\]\{[^}]*filter:none/)
    expect(styles).not.toMatch(/contactMascotFloat/)
    expect(styles).not.toMatch(/\.contact-mascot-wrap\.is-visible \.contact-mascot\{[^}]*animation:/)
  })

  it('整屏吸附下导航仍可直接抵达目标模块', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '联系我们' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
  })

  it('小支比价和联系我们白色板块顶部不保留圆角', () => {
    expect(styles).toMatch(/\.compare\{[^}]*border-radius:0/)
    expect(styles).toMatch(/\.contact\{[^}]*border-radius:0/)
  })

  it('比价高亮默认位于安心护航并跟随鼠标悬停切换', () => {
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
    expect(rows[0]).toHaveClass('active')
    expect(highlight.style.getPropertyValue('--active-index')).toBe('0')
  })

  it('比价项目不再提供可聚焦的切换状态', () => {
    const { container } = render(<App />)
    const rows = [...container.querySelectorAll('#compare .compare-row')]

    expect(rows.every((row) => !row.hasAttribute('tabindex'))).toBe(true)
    expect(rows[1]).toHaveClass('active')
  })

  it('首页文字静态展示，其他区块内容按段落和卡片渐进揭示', () => {
    const { container } = render(<App />)

    expect(container.querySelector('.hero-copy')).not.toHaveAttribute('data-reveal')
    expect(container.querySelectorAll('#about .about-copy > [data-reveal]')).toHaveLength(2)
    expect(container.querySelectorAll('#cars .section-title > [data-reveal]')).toHaveLength(2)
    expect(container.querySelectorAll('#compare .compare-row[data-reveal]')).toHaveLength(3)
    expect(container.querySelectorAll('#service .service-group[data-reveal]')).toHaveLength(3)
  })

  it('桌面端每个模块强制整屏吸附，联系我们与页脚共用最后一个吸附单元', () => {
    const { container } = render(<App />)
    const contactSnap = container.querySelector('.contact-snap')

    expect(contactSnap?.querySelector('#contact')).toBeInTheDocument()
    expect(contactSnap?.querySelector('.footer')).toBeInTheDocument()
    expect(styles).toMatch(/@media\(min-width:901px\)\{[^}]*html\{[^}]*scroll-snap-type:y mandatory/)
    expect(styles).toMatch(/\.hero,\.about,\.cars,\.compare,\.service,\.contact-snap\{[^}]*scroll-snap-align:start[^}]*scroll-snap-stop:always/)
    expect(styles).toMatch(/\.contact-snap\{[^}]*height:100svh/)
  })

  it('桌面主要区块各占满一屏，联系我们连同页脚刚好收束在一屏内', () => {
    expect(styles).toMatch(/\.hero\{[^}]*height:100svh/)
    expect(styles).toMatch(/\.about\{[^}]*height:100svh/)
    expect(styles).toMatch(/\.cars\{[^}]*height:100svh/)
    expect(styles).toMatch(/\.compare\{[^}]*height:100svh/)
    expect(styles).toMatch(/\.service\{[^}]*height:100svh/)
    expect(styles).toMatch(/\.contact\{[^}]*height:calc\(100svh - 114px\)[^}]*max-height:calc\(100svh - 114px\)/)
    expect(styles).toMatch(/\.footer\{[^}]*height:114px/)
  })

  it('联系我们恢复上一版宽度并按人物外扩高度垂直居中', () => {
    expect(styles).toMatch(/\.contact\{[^}]*display:flex[^}]*align-items:center[^}]*padding-top:114px/)
    expect(styles).toMatch(/\.contact-inner\{[^}]*width:min\(1200px,calc\(100% - 48px\)\)/)
  })

  it('知心租背景保持封面比例，移动端车型使用横向吸附且减少动态效果可降级', () => {
    expect(styles).toMatch(/\.service\{[^}]*background-size:cover/)
    expect(styles).toMatch(/scroll-snap-type:x mandatory/)
    expect(styles).toMatch(/@media\(prefers-reduced-motion:reduce\)/)
  })

  it('文字保留透明度与位移动效但不再使用模糊渐显', () => {
    expect(styles).not.toMatch(/\[data-reveal="title"\]\{[^}]*clip-path:inset\(0 0 100% 0\)/)
    expect(styles).toMatch(/\[data-reveal\]\{[^}]*opacity:0[^}]*filter:none[^}]*transition:opacity/)
    expect(styles).not.toMatch(/\[data-reveal\]\{[^}]*filter:blur\(/)
    expect(styles).not.toMatch(/\[data-contact-reveal\]\{[^}]*filter:blur\(/)
    expect(styles).not.toMatch(/\[data-contact-reveal="mascot"\]\{[^}]*filter:blur\(/)
    expect(styles).toMatch(/\[data-contact-reveal\]\{[^}]*opacity:0[^}]*filter:none[^}]*transition:opacity/)
  })
})
