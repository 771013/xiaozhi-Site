import React, { useEffect, useRef, useState } from 'react'
import { asset } from './assets.js'
import { advanceLoopPhase, getLoopCarFocusX, getLoopCarIndex, getLoopCarPose, getTypewriterFrame, prefersReducedMotion, useCountUp } from './motion.js'

const navItems = [
  ['首页', 'home'],
  ['关于小支', 'about'],
  ['车型介绍', 'cars'],
  ['小支比价', 'compare'],
  ['知心租', 'service'],
  ['联系我们', 'contact'],
]

const heroTaglines = ['租车更省心', '选车更明白', '好车放心开']

const carCards = [
  { title: '舒适型', copy: '宽适均衡，轻松出行', image: 'car-comfort.png' },
  { title: '经济型', copy: '省心实用，灵活代步', image: 'car-economy.png' },
  { title: 'SUV', copy: '视野开阔，稳健随行', image: 'car-suv.png' },
  { title: '豪华型', copy: '格调出众，尊享体验', image: 'car-luxury.png' },
  { title: '新能源', copy: '安静高效，低碳智行', image: 'car-ev.png' },
  { title: '跑车', copy: '驾控随心，释放激情', image: 'car-sport.png' },
  { title: '商务车', copy: '宽适从容，体面出行', image: 'car-business.png' },
  { title: '房车', copy: '一路皆景，自在安居', image: 'car-rv.png' },
  { title: '小巴士', copy: '多人同行，从容装载', image: 'car-minibus.png' },
  { title: '皮卡', copy: '强悍多用，纵横随行', image: 'car-pickup.png' },
]

const compareItems = [
  { title: '全网低价', copy: '聚合多家租车服务商报价，同一车型一键横向比价，自动为你标出性价比更优的方案。', icon: '0265e.svg', activeIcon: 'compare-price-active.svg' },
  { title: '安心护航', copy: '平台担保交易，芝麻信用免押金，订单全流程可查可追溯，用车更有底气。', icon: 'compare-shield-inactive.svg', activeIcon: 'b35c9.svg' },
  { title: '费用清晰', copy: '租金、保障、服务费逐项列明，下单前一目了然，不藏隐形收费。', icon: '5d01d.svg', activeIcon: 'compare-list-active.svg' },
]

const serviceGroups = [
  {
    title: '订得省心',
    items: [
      ['芝麻免押金', '芝麻分大于550分即有机会享受免车辆押金和免违章押金', 'ce712.svg'],
      ['免费取消', '预定取车时间前均可免费取消（法定节假日除外）', '8a9f2.svg'],
    ],
  },
  {
    title: '取得放心',
    items: [
      ['有车保障', '保证下单车型与门店交付车辆一致，无车时免费更换或升级车型', 'bb329.svg'],
      ['三年内新车', '车龄在三年内', '4ce44.svg'],
    ],
  },
  {
    title: '开得舒心',
    items: [
      ['不限里程', '用车行驶里程不受限制（部分跑车除外）', '84dd4.svg'],
      ['可升级保障服务', '提供优享、尊享或无忧租等增值保障服务选择', '53b10.svg'],
      ['免费送取车', '无需支付送车上门服务费/上门取车服务费', 'efb75.svg'],
    ],
  },
]

function scrollToSection(id) {
  const section = document.getElementById(id)
  if (!section) return
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  section.scrollIntoView({ behavior: 'auto', block: 'start' })
  window.setTimeout(() => {
    root.style.scrollBehavior = previousBehavior
  }, 80)
}

function CountUp({ target }) {
  const valueRef = useCountUp(target)
  return <span ref={valueRef} data-count={target}>0</span>
}

function MiniProgramDialog({ onClose, returnFocusRef }) {
  const closeButton = useRef(null)

  useEffect(() => {
    closeButton.current?.focus()
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      returnFocusRef.current?.focus()
    }
  }, [onClose, returnFocusRef])

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="dialog-close" ref={closeButton} onClick={onClose} aria-label="关闭弹窗">×</button>
        <span className="dialog-brand"><span className="brand-mark"><img src={asset('b086f.png')} alt="" /></span>小支租车</span>
        <h2 id="dialog-title">开启你的比价之旅</h2>
        <p>打开支付宝，搜索“小支租车”小程序，即可按车型比较多家服务商报价，选择适合自己的出行方案。</p>
        <button className="dialog-action" onClick={() => { onClose(); scrollToSection('compare') }}>了解小支比价 <span aria-hidden="true">→</span></button>
      </section>
    </div>
  )
}

function App() {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(() => window.scrollY >= 24)
  const [activeCar, setActiveCar] = useState(3)
  const [heroTypewriter, setHeroTypewriter] = useState(() => getTypewriterFrame(0, heroTaglines))
  const activeBenefit = 1
  const compareButtonRef = useRef(null)
  const carsSectionRef = useRef(null)
  const carRefs = useRef([])
  const activeCarRef = useRef(0)

  const activateBenefit = (index, row) => {
    const list = row.closest('.compare-list')
    if (!list) return
    list.querySelectorAll('.compare-row').forEach((item, itemIndex) => {
      item.classList.toggle('active', itemIndex === index)
      if (itemIndex === index) item.setAttribute('aria-current', 'true')
      else item.removeAttribute('aria-current')
    })
    const highlight = list.querySelector('.compare-highlight')
    highlight?.style.setProperty('--active-index', String(index))
  }

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY >= 24)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) {
      setHeroTypewriter({ text: heroTaglines[0], phraseIndex: 0, caretVisible: false })
      return undefined
    }

    let frame = 0
    let startTime
    const tick = (time) => {
      startTime ??= time
      const next = getTypewriterFrame(time - startTime, heroTaglines)
      setHeroTypewriter((previous) => (
        previous.text === next.text && previous.phraseIndex === next.phraseIndex ? previous : next
      ))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 901px)')
    const motionDisabled = prefersReducedMotion()
    let frame = 0
    let lastTime = 0
    let phase = 3 * 276

    const renderCars = (time = performance.now()) => {
      frame = 0
      const section = carsSectionRef.current
      if (!section) return
      if (section.getBoundingClientRect().top < window.innerHeight * 0.82) {
        section.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-visible'))
      }

      if (!media?.matches) {
        carRefs.current.forEach((card) => {
          if (!card) return
          card.style.transform = ''
          card.style.opacity = ''
          card.style.zIndex = ''
          card.style.removeProperty('--car-focus')
          card.style.removeProperty('--car-outline')
        })
        return
      }

      if (!motionDisabled) {
        if (!lastTime) lastTime = time
        phase = advanceLoopPhase(phase, time - lastTime)
        lastTime = time
      }

      carRefs.current.forEach((card, index) => {
        if (!card) return
        const pose = getLoopCarPose(index, phase, carCards.length, getLoopCarFocusX(window.innerWidth))
        card.style.transform = `translate3d(${pose.x}px,0,0) scale(${pose.scale})`
        card.style.opacity = String(pose.opacity)
        card.style.zIndex = String(pose.zIndex)
        card.style.setProperty('--car-focus', pose.focus.toFixed(4))
        card.style.setProperty('--car-outline', pose.outline.toFixed(4))
      })

      const nextActive = getLoopCarIndex(phase, carCards.length)
      if (nextActive !== activeCarRef.current) {
        activeCarRef.current = nextActive
        setActiveCar(nextActive)
      }

      if (!motionDisabled) frame = requestAnimationFrame(renderCars)
    }

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(renderCars)
    }

    renderCars()
    if (motionDisabled) return undefined
    window.addEventListener('resize', scheduleRender)
    media?.addEventListener?.('change', scheduleRender)
    return () => {
      window.removeEventListener('resize', scheduleRender)
      media?.removeEventListener?.('change', scheduleRender)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-20% 0px -65%', threshold: [0, 0.15, 0.4] },
    )

    navItems.forEach(([, id]) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const revealNodes = [...document.querySelectorAll('[data-reveal],[data-contact-reveal]')]
    const revealAll = () => revealNodes.forEach((node) => node.classList.add('is-visible'))

    if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
      revealAll()
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve?.(entry.target)
      })
    }, { rootMargin: '0px 0px -12%', threshold: 0.12 })

    revealNodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const navigate = (id) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <main className="page">
      <section className="hero" id="home">
        <header className={`site-header shell ${headerScrolled ? 'is-scrolled' : 'at-top'}`}>
          <button className="brand" onClick={() => navigate('home')} aria-label="返回首页">
            <img className="brand-logo" src={asset('b7255.svg')} alt="" />
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="主导航">
            {navItems.map(([label, id]) => (
              <button key={id} className={active === id ? 'active' : ''} onClick={() => navigate(id)}>
                {label}
              </button>
            ))}
          </nav>
          <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'} aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
        </header>

        <div className="hero-content shell">
          <div className="hero-copy">
            <span className="eyebrow">聚合多家服务商 · 同车型智能比价</span>
            <h1>小支租车</h1>
            <h2 className="hero-rotating-line">
              <span className="sr-only">比出好价格，租车更省心；比出好价格，选车更明白；比出好价格，好车放心开</span>
              <span className="hero-typewriter-visual" aria-hidden="true">
                比出好价格，<span className="hero-typewriter-copy">{heroTypewriter.text}</span><span className="hero-typewriter-caret">_</span>
              </span>
            </h2>
            <p>在线汽车租赁服务平台 — 到店取还、送车上门、上门取车多种交车方式，<br className="desktop-only" />芝麻信用免押、平台担保交易、免费取消、知心租保障，全流程自助省心。</p>
            <div className="hero-actions">
              <button className="button primary" ref={compareButtonRef} onClick={() => setDialogOpen(true)}>立即去比价</button>
              <button className="button ghost" onClick={() => navigate('service')}>了解知心租</button>
            </div>
          </div>
          <img
            className="hero-visual"
            data-reveal="image"
            src={asset('bd5f5.png')}
            alt="小支租车小程序界面和蓝色跑车"
          />
        </div>
      </section>

      <section className="about" id="about">
        <div className="shell about-grid">
          <div className="about-copy">
            <p className="section-kicker" data-reveal="copy">覆盖多元车型与海量车源，服务全国出行需求</p>
            <p data-reveal="copy" style={{ '--reveal-delay': '140ms' }}>小支租车是为用户提供在线汽车租赁服务的出行平台，聚合多家租车服务商的车辆资源与报价，通过比价能力帮助用户在同一车型下选出性价比更优的租车方案。小支租车支持自行到店取还车、送车上门、上门取车等多种交车方式，满足用户多场景的四轮自助出行需求，同时提供芝麻信用免押、平台担保交易、免费取消、知心租保障等多种安全可靠便捷的交易方式。用户可在应用内完成从选车、比价、下单、支付到订单查询的完整租车流程，并可实时查看服务商的服务信息，获得服务可视化的使用体验。</p>
          </div>
          <div className="scale-heading">
            <h2 data-reveal="title">业务规模</h2>
            <span data-reveal="copy" style={{ '--reveal-delay': '120ms' }}>Business scale</span>
          </div>
          <div className="stats">
            <article data-reveal="card" style={{ '--reveal-delay': '80ms' }}><strong><CountUp target={50000} /><small>+</small></strong><h3>车型</h3><p>覆盖经济型到豪华型全系</p></article>
            <article data-reveal="card" style={{ '--reveal-delay': '180ms' }}><strong><CountUp target={70000} /><small>+</small></strong><h3>取车网点</h3><p>全国机场 / 火车站 / 市区门店</p></article>
            <article className="highlight" data-reveal="card" style={{ '--reveal-delay': '280ms' }}><strong><CountUp target={800000} /><small>+</small></strong><h3>车源</h3><p>聚合多家服务商车辆资源</p></article>
          </div>
        </div>
      </section>

      <section className="cars" id="cars" ref={carsSectionRef}>
        <div className="cars-stage" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),url(${asset('acb79.png')})` }}>
          <div className="shell cars-content">
            <div className="section-title light align-right">
              <h2 data-reveal="title">车型介绍</h2>
              <p data-reveal="copy" style={{ '--reveal-delay': '120ms' }}>多样车型选择 满足不同出行场景</p>
            </div>
          </div>
          <div className="car-rail" aria-label="车型循环展示">
            {carCards.map((car, index) => (
              <article
                className={`car-card ${index === activeCar ? 'featured' : ''}`}
                key={`${car.title}-${car.image}`}
                ref={(node) => { carRefs.current[index] = node }}
                aria-label={car.title}
                aria-current={index === activeCar ? 'true' : undefined}
              >
                <img src={asset(car.image)} alt="" />
                <span className="car-caption"><strong>{car.title}</strong><small>{car.copy}</small></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compare" id="compare">
        <div className="shell compare-inner">
          <div className="section-title">
            <h2 data-reveal="title">小支比价</h2>
            <p data-reveal="copy" style={{ '--reveal-delay': '120ms' }}>透明价格 比出超高性价比</p>
          </div>
          <div
            className="compare-list"
          >
            <div className="compare-highlight" aria-hidden="true" style={{ '--active-index': String(activeBenefit) }}>
              <img className="compare-decoration" src={asset('b9389.png')} alt="" style={{ transform: 'scaleX(-1)' }} />
            </div>
            {compareItems.map((item, index) => (
              <article
                className={`compare-row ${index === activeBenefit ? 'active' : ''}`}
                key={item.title}
                data-reveal="copy"
                style={{ '--reveal-delay': `${100 + index * 120}ms` }}
                onMouseEnter={(event) => activateBenefit(index, event.currentTarget)}
                aria-current={index === activeBenefit ? 'true' : undefined}
              >
                <span className="compare-icon">
                  <img className="compare-icon-inactive" src={asset(item.icon)} alt="" />
                  <img className="compare-icon-active" src={asset(item.activeIcon)} alt="" />
                </span>
                <strong>{item.title}</strong>
                <span className="compare-description">{item.copy}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service" id="service" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url(${asset('fa5ca.png')})` }}>
        <div className="shell service-inner">
          <div className="section-title light">
            <h2 data-reveal="title">知心租</h2>
            <p data-reveal="copy" style={{ '--reveal-delay': '120ms' }}>订取用还 全程保障</p>
          </div>
          <div className="service-groups">
            {serviceGroups.map((group, groupIndex) => (
              <article className={`service-group service-group-${groupIndex}`} key={group.title} data-reveal="card" style={{ '--reveal-delay': `${100 + groupIndex * 140}ms` }}>
                <h3>{group.title}</h3>
                <div className="service-items">
                  {group.items.map(([title, copy, icon]) => (
                    <div className="service-entry" key={title}>
                      {title === '免费送取车' && <h3 className="service-subheading">还得轻松</h3>}
                      <div className="service-item">
                        <span className={`service-icon service-icon-${icon.replace('.svg', '')}`}>
                          <img src={asset(icon)} alt="" />
                        </span>
                        <div><h4>{title}</h4><p>{copy}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="contact-snap">
        <section className="contact" id="contact">
          <div className="shell contact-inner">
            <img className="contact-texture" src={asset('63637.png')} alt="" />
            <div className="contact-mascot-wrap" data-contact-reveal="mascot">
              <img className="contact-mascot" src={asset('250d0.png')} alt="小支租车服务形象" />
            </div>
            <div className="contact-copy">
              <h2>
                <span data-contact-reveal="left" style={{ '--contact-delay': '140ms' }}>联系我们</span>
                <span data-contact-reveal="right" style={{ '--contact-delay': '260ms' }}>随时为你解答租车问题</span>
              </h2>
              <p data-contact-reveal="left" style={{ '--contact-delay': '390ms' }}>上支付宝搜索“小支租车”，访问小程序</p>
              <div className="contact-links" data-contact-reveal="right" style={{ '--contact-delay': '520ms' }}>
                <a className="contact-chip" href="tel:4009030845"><span>客服热线</span><b />4009030845</a>
                <a className="contact-chip email" href="mailto:xiaozhizuche@163.com"><span>官方邮箱</span><b />xiaozhizuche@163.com</a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer shell">
          <span>©2026 小支租车版权所有</span>
          <span>聚合多家服务商 · 同车型智能比价</span>
        </footer>
      </div>
      {dialogOpen && <MiniProgramDialog onClose={() => setDialogOpen(false)} returnFocusRef={compareButtonRef} />}
    </main>
  )
}

export default App
