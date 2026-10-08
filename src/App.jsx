import React, { useEffect, useRef, useState } from 'react'
import { asset } from './assets.js'

const navItems = [
  ['首页', 'home'],
  ['关于小支', 'about'],
  ['车型介绍', 'cars'],
  ['小支比价', 'compare'],
  ['知心租', 'service'],
  ['联系我们', 'contact'],
]

const carCards = [
  { title: '新能源', image: '07bb9.png', teaser: true },
  { title: '豪华型', copy: '格调出众，尊享体验', image: '0fdb6.png' },
  { title: '新能源', image: 'f1fcb.png' },
  { title: '跑车', image: '4b2e0.png' },
  { title: '商务车', image: '54d20.png' },
  { title: '房车', image: 'd4595.png' },
]

const compareItems = [
  { title: '全网低价', copy: '聚合多家租车服务商报价，同一车型一键横向比价，自动为你标出性价比更优的方案。', icon: '0265e.svg' },
  { title: '安心护航', copy: '平台担保交易，芝麻信用免押金，订单全流程可查可追溯，用车更有底气。', icon: 'b35c9.svg' },
  { title: '费用清晰', copy: '租金、保障、服务费逐项列明，下单前一目了然，不藏隐形收费。', icon: '5d01d.svg' },
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
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  const compareButtonRef = useRef(null)

  useEffect(() => {
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

  const navigate = (id) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <main className="page">
      <section className="hero" id="home">
        <header className="site-header shell">
          <button className="brand" onClick={() => navigate('home')} aria-label="返回首页">
            <span className="brand-mark"><img src={asset('b086f.png')} alt="" /></span>
            <span>小支租车</span>
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
            <h2>比出好价格，租得更放心</h2>
            <p>在线汽车租赁服务平台 — 到店取还、送车上门、上门取车多种交车方式，<br className="desktop-only" />芝麻信用免押、平台担保交易、免费取消、知心租保障，全流程自助省心。</p>
            <div className="hero-actions">
              <button className="button primary" ref={compareButtonRef} onClick={() => setDialogOpen(true)}>立即去比价 <img src={asset('231fa.svg')} alt="" /></button>
              <button className="button ghost" onClick={() => navigate('service')}>了解知心租 <img src={asset('742af.svg')} alt="" /></button>
            </div>
          </div>
          <img
            className="hero-visual"
            src={asset('661cc.png')}
            alt="小支租车小程序界面和蓝色跑车"
          />
        </div>
      </section>

      <section className="about" id="about">
        <div className="shell about-grid">
          <div className="about-copy">
            <p className="section-kicker">覆盖多元车型与海量车源，服务全国出行需求</p>
            <p>小支租车是为用户提供在线汽车租赁服务的出行平台，聚合多家租车服务商的车辆资源与报价，通过比价能力帮助用户在同一车型下选出性价比更优的租车方案。小支租车支持自行到店取还车、送车上门、上门取车等多种交车方式，满足用户多场景的四轮自助出行需求，同时提供芝麻信用免押、平台担保交易、免费取消、知心租保障等多种安全可靠便捷的交易方式。用户可在应用内完成从选车、比价、下单、支付到订单查询的完整租车流程，并可实时查看服务商的服务信息，获得服务可视化的使用体验。</p>
          </div>
          <div className="scale-heading">
            <h2>业务规模</h2>
            <span>Business scale</span>
          </div>
          <div className="stats">
            <article><strong>50000<small>+</small></strong><h3>车型</h3><p>覆盖经济型到豪华型全系</p></article>
            <article><strong>70000<small>+</small></strong><h3>取车网点</h3><p>全国机场 / 火车站 / 市区门店</p></article>
            <article className="highlight"><strong>800000<small>+</small></strong><h3>车源</h3><p>聚合多家服务商车辆资源</p></article>
          </div>
        </div>
      </section>

      <section className="cars" id="cars" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),url(${asset('acb79.png')})` }}>
        <div className="shell cars-content">
          <div className="section-title light align-right">
            <h2>车型介绍</h2>
            <p>多样车型选择，满足不同出行场景</p>
          </div>
          <div className="car-rail">
            {carCards.map((car, index) => (
              car.teaser ? <div className="car-card teaser" key="teaser" aria-hidden="true"><img src={asset(car.image)} alt="" /></div> :
              <article
                className={`car-card ${index === 1 ? 'featured' : ''}`}
                key={`${car.title}-${car.image}`}
              >
                <img src={asset(car.image)} alt="" />
                <span className="car-caption"><strong>{car.title}</strong>{index === 1 && <small>{car.copy}</small>}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compare" id="compare">
        <div className="shell compare-inner">
          <div className="section-title">
            <h2>小支比价</h2>
            <p>透明价格，比出超高性价比</p>
          </div>
          <div className="compare-list">
            {compareItems.map((item, index) => (
              <article
                className={`compare-row ${index === 1 ? 'active' : ''}`}
                key={item.title}
              >
                <span className="compare-icon"><img src={asset(item.icon)} alt="" /></span>
                <strong>{item.title}</strong>
                <span className="compare-description">{item.copy}</span>
                {index === 1 && <img className="compare-decoration" src={asset('b9389.png')} alt="" />}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service" id="service" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url(${asset('fa5ca.png')})` }}>
        <div className="shell service-inner">
          <div className="section-title light">
            <h2>知心租</h2>
            <p>订取用还，全程保障</p>
          </div>
          <div className="service-groups">
            {serviceGroups.map((group, groupIndex) => (
              <article className={`service-group service-group-${groupIndex}`} key={group.title}>
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

      <section className="contact" id="contact">
        <div className="shell contact-inner">
          <img className="contact-texture" src={asset('63637.png')} alt="" />
          <img className="contact-mascot" src={asset('250d0.png')} alt="小支租车服务形象" />
          <div className="contact-copy">
            <h2>联系我们<br />随时为你解答租车问题</h2>
            <p>上支付宝搜索“小支租车”，访问小程序</p>
            <div className="contact-links">
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
      {dialogOpen && <MiniProgramDialog onClose={() => setDialogOpen(false)} returnFocusRef={compareButtonRef} />}
    </main>
  )
}

export default App
