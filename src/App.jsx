import { Fragment, useEffect, useRef, useState } from 'react'
import { createTimeline, animate, stagger } from 'animejs'
import Scene from './components/Scene'
import Loader from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'
import KineticGrid from './components/KineticGrid'
import { landingSections } from './landingContent'
import LiquidGlassOrb from './components/LiquidGlassOrb'
import {
  SECTION_COUNT,
  INITIAL_ZOOM_DISTANCE,
  SECTION_HOLD_DISTANCE,
  SECTION_TRANSITION_DISTANCE,
  SECTION_CYCLE,
  TOTAL_SCROLL_PROGRESS,
  ZOOM_OUT_START,
  OVERVIEW_ZOOM_OUT_END,
  OVERVIEW_HOLD_END,
  LOGIN_ZOOM_START,
  LOGIN_ZOOM_END,
  getPortalTarget,
  getLoginTarget,
} from './sceneSequence'

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const easeInOut = (value) => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

const NAV_LINKS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'configure', label: 'Platform' },
  { id: 'releases', label: 'Delivery' },
  { id: 'security', label: 'Security' },
  { id: 'operations', label: 'Observability' },
  { id: 'business-case', label: 'Business Case' },
]

const IS_MOBILE = () => typeof window !== 'undefined' && window.innerWidth <= 900

const getScrollRange = () => {
  const doc = document.documentElement
  return Math.max(0, doc.scrollHeight - doc.clientHeight)
}

// ---------------------------------------------------------------------------
// Mobile timeline: sections live in the natural document flow. Each region
// (spacer or section) declares the 3D-progress span it covers, so the scene
// progress freezes while reading a section and advances through the spacer
// gaps between sections (where the model rotates).
// ---------------------------------------------------------------------------
function buildMobileRegions(container) {
  if (!container) return []
  const regions = []
  let top = container.getBoundingClientRect().top + window.scrollY
  for (const el of Array.from(container.children)) {
    if (!el.classList.contains('tl-spacer') && !el.classList.contains('portal-panel')) continue
    const from = parseFloat(el.dataset.pFrom ?? '0')
    const to = parseFloat(el.dataset.pTo ?? String(from))
    regions.push({ top, height: el.offsetHeight, from, to })
    top += el.offsetHeight
  }
  return regions
}

function progressFromRegions(scrollY, regions) {
  if (!regions.length) return 0
  if (scrollY <= regions[0].top) return regions[0].from
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]
    if (scrollY < r.top + r.height) {
      const f = r.height > 0 ? (scrollY - r.top) / r.height : 0
      return r.from + (r.to - r.from) * clamp01(f)
    }
  }
  return regions[regions.length - 1].to
}

function scrollYFromRegions(target, regions) {
  if (!regions.length) return 0
  if (target <= regions[0].from) return regions[0].top
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]
    const lo = Math.min(r.from, r.to)
    const hi = Math.max(r.from, r.to)
    if (target >= lo && target <= hi) {
      if (r.to === r.from) return r.top
      const f = (target - r.from) / (r.to - r.from)
      return r.top + r.height * clamp01(f)
    }
  }
  const last = regions[regions.length - 1]
  return last.top + last.height
}

function portalAtProgress(progress) {
  // During hero banner (progress 0 to 0.15), hide section text
  if (progress < 0.15) {
    return { index: -1, opacity: 0 }
  }

  // During first zoom (0.15 to INITIAL_ZOOM_DISTANCE):
  // Section 0 fades in as camera arrives at the first hexagon
  if (progress < INITIAL_ZOOM_DISTANCE) {
    const zoomProgress = (progress - 0.15) / (INITIAL_ZOOM_DISTANCE - 0.15)
    return {
      index: 0,
      opacity: clamp01(easeInOut(zoomProgress)),
    }
  }

  // Once zoomed in: 6 sections (0 to 5)
  const offset = progress - INITIAL_ZOOM_DISTANCE
  const rawCycle = offset / SECTION_CYCLE
  const sectionIndex = Math.min(SECTION_COUNT - 1, Math.floor(rawCycle))
  const inCycle = offset - sectionIndex * SECTION_CYCLE

  // Past the end of section cycle (zoom out / login / footer area): completely hidden
  if (progress >= ZOOM_OUT_START) {
    return { index: -1, opacity: 0 }
  }

  // Last section (Section 06 Business Case)
  if (sectionIndex >= SECTION_COUNT - 1) {
    if (inCycle <= SECTION_HOLD_DISTANCE) {
      return { index: SECTION_COUNT - 1, opacity: 1 }
    }
    const exitT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
    if (exitT >= 1) {
      return { index: -1, opacity: 0 }
    }
    return {
      index: SECTION_COUNT - 1,
      opacity: clamp01(1 - easeInOut(exitT)),
    }
  }

  // Section hold period: Hexagon is centered and section is 100% visible!
  if (inCycle <= SECTION_HOLD_DISTANCE) {
    return {
      index: sectionIndex,
      opacity: 1,
    }
  }

  // Transition period between hexagons: smooth crossfade
  const transT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
  if (transT < 0.5) {
    return {
      index: sectionIndex,
      opacity: clamp01(1 - easeInOut(transT * 2)),
    }
  } else {
    return {
      index: sectionIndex + 1,
      opacity: clamp01(easeInOut((transT - 0.5) * 2)),
    }
  }
}

function TypewriterText({ text, className = '' }) {
  return <span className={className}>{text}</span>
}

function TerminalTypewriterLine({ icon = '✓', text, colorClass = '', timeText = '' }) {
  return (
    <div className={`t-log ${colorClass}`}>
      <span className="log-icon">{icon}</span>
      <span>
        {text}
        {timeText && <span className="log-time"> {timeText}</span>}
      </span>
    </div>
  )
}

export default function App() {
  const progress = useRef(0)
  const activePortalRef = useRef(-1)
  const heroVisibleRef = useRef(true)
  const loginVisibleRef = useRef(false)
  const [activePortal, setActivePortal] = useState(-1)
  const [heroVisible, setHeroVisible] = useState(true)
  const [loginOpacity, setLoginOpacity] = useState(0)
  const [loginVisible, setLoginVisible] = useState(false)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(IS_MOBILE)
  const isMobileRef = useRef(IS_MOBILE())
  const mobileRegionsRef = useRef(null)

  const copyInstallCommand = () => {
    navigator.clipboard?.writeText('npm i -g @evolut/cli')
    setCopied(true)
    setTimeout(() => setCopied(false), 2400)
  }

  // Track viewport mode and keep the mobile region map (spacers + sections) fresh
  useEffect(() => {
    let ro = null

    const rebuild = () => {
      const container = document.querySelector('.portal-content')
      mobileRegionsRef.current = buildMobileRegions(container)
    }

    const onResize = () => {
      const mobile = IS_MOBILE()
      isMobileRef.current = mobile
      setIsMobile(mobile)
      setTimeout(rebuild, 30)
    }

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => rebuild())
    }
    const container = document.querySelector('.portal-content')
    if (ro && container) ro.observe(container)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rebuild)
    }

    window.addEventListener('resize', onResize)
    rebuild()

    return () => {
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
    }
  }, [])

  const scrollToProgress = (target, behavior = 'smooth') => {
    let top
    const regions = mobileRegionsRef.current
    if (isMobileRef.current && regions && regions.length) {
      top = scrollYFromRegions(target, regions)
    } else {
      const max = getScrollRange()
      top = max > 0 ? (target / TOTAL_SCROLL_PROGRESS) * max : 0
    }
    window.scrollTo({ top, behavior })
  }

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevOverflow
    }
  }, [menuOpen])

  // Close the mobile menu with Escape or when resizing back to desktop
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (!IS_MOBILE()) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const navigateToProgress = (event, target) => {
    event.preventDefault()
    scrollToProgress(target, 'smooth')
  }

  const handleMenuNav = (event, target) => {
    event.preventDefault()
    setMenuOpen(false)
    setTimeout(() => scrollToProgress(target, 'smooth'), 80)
  }
  const portalTarget = (index) => {
    return getPortalTarget(index)
  }

  // Anime.js initial hero entrance animation on page load
  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: 'outCubic' } })

    tl.add('.site-nav', {
      opacity: [0, 1],
      translateY: [-16, 0],
      duration: 650,
    })
    .add('.hero-badge', {
      opacity: [0, 1],
      translateY: [-18, 0],
      duration: 600,
    }, '-=400')
    .add('.hero-cta-wrap > *', {
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 600,
      delay: stagger(80),
    }, '+=400')
    .add('.hero-stats-bar > *', {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 500,
      delay: stagger(60),
    }, '-=300')
    .add('.hero-right-card', {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.96, 1],
      duration: 700,
      delay: stagger(140),
    }, '-=600')

    // Continuous ambient glow pulse
    animate('.ambient-glow-orb', {
      scale: [1, 1.25, 1],
      opacity: [0.35, 0.6, 0.35],
      duration: 7000,
      loop: true,
      ease: 'inOutSine',
    })
  }, [])

  // Anime.js entrance animation on portal change + interactive telemetry trigger
  useEffect(() => {
    if (activePortal >= 0 && landingSections[activePortal]) {
      const panel = document.getElementById(landingSections[activePortal].id)
      if (panel) {
        const targets = panel.querySelectorAll(
          '.portal-panel__eyebrow, h2, .portal-panel__description, .terminal-preview, .pipeline-flow li, .portal-facts li, .env-card, .telemetry-card, .portal-details > div, .portal-stats > div, .comparison-table-wrap, .portal-cost-note, .portal-cta-group'
        )
        if (targets && targets.length > 0) {
          animate(targets, {
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 580,
            delay: stagger(42, { start: 50 }),
            ease: 'outCubic',
          })
        }

        // Animate telemetry bars and metric cards
        const telemetryBars = panel.querySelectorAll('.telemetry-card__bar-fill')
        if (telemetryBars.length > 0) {
          animate(telemetryBars, {
            width: (el) => [0, el.getAttribute('data-fill') || '75%'],
            duration: 850,
            delay: stagger(80, { start: 200 }),
            ease: 'outQuart',
          })
        }

        // Animate comparison table rows
        const tableRows = panel.querySelectorAll('.comparison-table tbody tr')
        if (tableRows.length > 0) {
          animate(tableRows, {
            opacity: [0, 1],
            translateX: [-16, 0],
            duration: 500,
            delay: stagger(60, { start: 150 }),
            ease: 'outQuad',
          })
        }
      }
    }
  }, [activePortal])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--blackout-opacity', '0')

    let raw = 0
    let frame = 0
    let last = 0

    const apply = () => {
      const currentProgress = Math.min(progress.current, TOTAL_SCROLL_PROGRESS)

      if (isMobileRef.current) {
        // Mobile: sections are in normal flow and always fully visible — no crossfade
        root.style.setProperty('--portal-content-opacity', '1')
      } else {
        const active = portalAtProgress(currentProgress)
        if (activePortalRef.current !== active.index) {
          activePortalRef.current = active.index
          setActivePortal(active.index)
        }
        root.style.setProperty(
          '--portal-content-opacity',
          String(active.opacity),
        )
      }

      // Solid navbar backdrop once scrolled past the hero (mobile readability)
      root.dataset.navScrolled = window.scrollY > 24 ? '1' : '0'

      setScrollPercent(Math.min(100, Math.round((progress.current / TOTAL_SCROLL_PROGRESS) * 100)))

      // Hero view disappears immediately as soon as user starts scrolling
      const heroOpacity = clamp01(1 - progress.current / 0.22)
      root.style.setProperty(
        '--hero-opacity',
        String(heroOpacity),
      )
      const isHeroVisible = heroOpacity > 0.01
      if (isHeroVisible !== heroVisibleRef.current) {
        heroVisibleRef.current = isHeroVisible
        setHeroVisible(isHeroVisible)
      }

      // Login form fades in as camera zooms into the center of the 3D model
      let curLoginOpacity = 0
      if (progress.current >= LOGIN_ZOOM_START) {
        if (progress.current < LOGIN_ZOOM_END) {
          curLoginOpacity = clamp01(easeInOut((progress.current - LOGIN_ZOOM_START) / (LOGIN_ZOOM_END - LOGIN_ZOOM_START)))
        } else {
          curLoginOpacity = 1
        }
      }
      setLoginOpacity(curLoginOpacity)
      const isLoginVis = curLoginOpacity > 0.01
      if (isLoginVis !== loginVisibleRef.current) {
        loginVisibleRef.current = isLoginVis
        setLoginVisible(isLoginVis)
      }
    }

    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const isMobile = window.innerWidth <= 768
      const speed = isMobile ? 12 : 7
      const k = 1 - Math.exp(-speed * dt)
      progress.current += (raw - progress.current) * k
      if (Math.abs(raw - progress.current) > 0.0005) {
        apply()
        frame = requestAnimationFrame(loop)
      } else {
        progress.current = raw
        apply()
        frame = 0
      }
    }

    const onScroll = () => {
      const regions = mobileRegionsRef.current
      if (isMobileRef.current && regions && regions.length) {
        // Mobile: piecewise mapping over the in-flow sections + spacers
        raw = progressFromRegions(window.scrollY, regions)
      } else {
        // Desktop: linear over the real scrollable range, so mobile URL-bar
        // collapse/resize never makes the 3D timeline jump.
        const max = getScrollRange()
        raw = max > 0 ? (window.scrollY / max) * TOTAL_SCROLL_PROGRESS : 0
      }
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }

    onScroll()
    progress.current = raw
    apply()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty('--blackout-opacity')
      root.style.removeProperty('--portal-content-opacity')
      root.style.removeProperty('--hero-opacity')
      root.style.removeProperty('--footer-opacity')
    }
  }, [])

  return (
    <>
    <main
      id="top"
      className="model-view"
      style={{ '--scroll-height': `${(TOTAL_SCROLL_PROGRESS + 0.6) * 100}dvh` }}
    >
      <h1 className="visually-hidden">Evolut — Kubernetes Application Platform</h1>
      <p className="visually-hidden">
        Evolut automates CI/CD deployment pipelines, secrets management, security scanning, observability, and auto-scaling for modern development teams.
      </p>
      
      {/* Seamless Navbar with glowing dynamic scroll progress */}
      <header className="site-nav">
        <div className="site-nav__progress" style={{ width: `${scrollPercent}%` }} />
        <a
          className="site-brand"
          href="#top"
          onClick={(event) => navigateToProgress(event, 0)}
          aria-label="Evolut, home"
        >
          <img src="/assets/logo-white.png" alt="Evolut Logo" className="site-brand__logo" />
          <span>EVOLUT</span>
        </a>
        <nav aria-label="Main navigation">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={activePortal === index ? 'site-nav__link--active' : ''}
              aria-current={activePortal === index ? 'true' : undefined}
              onClick={(event) => navigateToProgress(event, portalTarget(index))}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="site-nav__actions">
          <a
            className="site-nav__start-btn"
            href="#login"
            onClick={(event) => navigateToProgress(event, getLoginTarget())}
            onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
            onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
          >
            Start
          </a>
          <a
            className="site-nav__cta"
            href="https://evolut.cloud/"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
            onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
          >
            Book a demo <span aria-hidden="true">↗</span>
          </a>
        </div>
        <button
          type="button"
          className={`site-nav__burger${menuOpen ? ' site-nav__burger--open' : ''}`}
          aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Permanent Fixed Background Hex Pattern for ALL pages */}
      <div className="site-hex-grid" aria-hidden="true" />

      {/* Kinetic Wave Matrix Canvas for ALL pages */}
      <KineticGrid />

      {/* Ambient background glow orb */}
      <div className="ambient-glow-orb" aria-hidden="true" />

      {/* Hero Initial Screen — Clean view with only the 3D Model and Space Background */}
      <div
        className={`hero-view${!heroVisible ? ' hero-view--hidden' : ''}`}
        hidden={!heroVisible}
        aria-hidden={!heroVisible}
        aria-label="Hero banner"
      />


      <ErrorBoundary
        fallback={
          <div className="fallback" role="alert">
            <p>Could not load the 3D experience. Please check your connection and refresh.</p>
          </div>
        }
      >
        <Scene progress={progress} />
      </ErrorBoundary>
      <Loader />
      <div className="blackout" aria-hidden="true" />
      <div className="scroll-track" aria-hidden="true" />

      {/* Footer preserved for later use:
      <footer className="site-footer">
        <div className="site-footer__main">
          <div className="site-footer__brand-col">
            <a className="site-footer__brand" href="#top" onClick={(event) => navigateToProgress(event, 0)}>
              EVOLUT<span>®</span>
            </a>
            <p className="site-footer__tagline">
              Refining Global Infrastructure. One-click Kubernetes platform automating CI/CD, secrets, observability, and scaling.
            </p>
            <div className="site-footer__status">
              <span className="status-dot"></span> All systems operational · 99.99% SLA
            </div>
          </div>
          <div className="site-footer__cols">
            <div className="site-footer__col">
              <span className="site-footer__heading">Platform</span>
              <a href="#pipeline" onClick={(event) => navigateToProgress(event, portalTarget(0))}>Pipeline Flow</a>
              <a href="#configure" onClick={(event) => navigateToProgress(event, portalTarget(1))}>Unified Setup</a>
              <a href="#releases" onClick={(event) => navigateToProgress(event, portalTarget(2))}>Continuous Delivery</a>
            </div>
            <div className="site-footer__col">
              <span className="site-footer__heading">Security & Ops</span>
              <a href="#security" onClick={(event) => navigateToProgress(event, portalTarget(3))}>Secrets & Quality Gates</a>
              <a href="#operations" onClick={(event) => navigateToProgress(event, portalTarget(4))}>Observability & Telemetry</a>
              <a href="#business-case" onClick={(event) => navigateToProgress(event, portalTarget(5))}>Business Case & ROI</a>
            </div>
            <div className="site-footer__col">
              <span className="site-footer__heading">Trust & Enterprise</span>
              <span>Enterprise SLA</span>
              <span>SOC2 & Compliance</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 Evolut Premium Solutions Inc. All rights reserved.</span>
          <span>Global Edge Kubernetes Mesh · Automated Cloud Infrastructure</span>
        </div>
      </footer>
      */}
    </main>

    {/* Mobile fullscreen navigation menu — mirrors the desktop navbar */}
    <div
      id="mobile-menu"
      className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}
      aria-hidden={!menuOpen}
      aria-label="Menú de navegación móvil"
    >
      <nav aria-label="Secciones">
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="mobile-menu__link"
            tabIndex={menuOpen ? 0 : -1}
            onClick={(event) => handleMenuNav(event, portalTarget(index))}
          >
            <span className="mobile-menu__link-title">{link.label}</span>
            <span className="mobile-menu__link-num">{String(index + 1).padStart(2, '0')}</span>
          </a>
        ))}
      </nav>
      <div className="mobile-menu__actions">
        <a
          className="mobile-menu__btn mobile-menu__btn--primary"
          href="#login"
          tabIndex={menuOpen ? 0 : -1}
          onClick={(event) => handleMenuNav(event, getLoginTarget())}
        >
          Start <span aria-hidden="true">→</span>
        </a>
        <a
          className="mobile-menu__btn mobile-menu__btn--ghost"
          href="https://evolut.cloud/"
          target="_blank"
          rel="noreferrer"
          tabIndex={menuOpen ? 0 : -1}
        >
          Book a demo <span aria-hidden="true">↗</span>
        </a>
      </div>
      <p className="mobile-menu__foot">© 2026 Evolut Premium Solutions Inc.</p>
    </div>

    {/* Portal section content — OUTSIDE main to avoid overflow:clip clipping.
        Desktop: fixed overlay with crossfade. Mobile: normal page flow with
        spacers that drive the 3D transitions between sections. */}
    <div className="portal-content" aria-live="polite">
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${INITIAL_ZOOM_DISTANCE * 100}svh` }}
        data-p-from="0"
        data-p-to={String(INITIAL_ZOOM_DISTANCE)}
      />

      {landingSections.map((section, index) => {
        const active = activePortal === index
        const isBusinessCase = section.id === 'business-case'
        // Freeze the scene at the END of the hold so the rotation spacer starts
        // exactly when the section content ends (no dead scroll in between).
        const sectionProgress =
          INITIAL_ZOOM_DISTANCE + index * SECTION_CYCLE + SECTION_HOLD_DISTANCE

        return (
          <Fragment key={section.id}>
            <section
              id={section.id}
              className={`portal-panel${active ? ' portal-panel--active' : ''}${isBusinessCase ? ' portal-panel--wide' : ''}`}
              aria-labelledby={`${section.id}-title`}
              aria-hidden={!isMobile && !active}
              hidden={!isMobile && !active}
              data-p-from={String(sectionProgress)}
              data-p-to={String(sectionProgress)}
            >
            <div className={`portal-panel__inner${isBusinessCase ? ' portal-panel__inner--2col' : ''}`}>
              {isBusinessCase ? (
                <>
                  <div className="portal-panel__left">
                    <p className="portal-panel__eyebrow">
                      <span>{section.number}</span> / {section.eyebrow}
                    </p>
                    <h2 id={`${section.id}-title`}>{section.title}</h2>
                    <p className="portal-panel__description">{section.description}</p>

                    {section.stats && (
                      <dl className="portal-stats portal-stats--2x2">
                        {section.stats.map((stat, sIdx) => (
                          <div
                            key={stat.label}
                            onMouseEnter={(e) => animate(e.currentTarget, { translateY: -3, scale: 1.02, duration: 220, ease: 'outQuad' })}
                            onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, scale: 1, duration: 300, ease: 'outQuad' })}
                          >
                            <dt>
                              <TypewriterText text={stat.value} speed={28} delay={180 + sIdx * 100} showCursor={false} />
                            </dt>
                            <dd>{stat.label}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {section.costNote && <p className="portal-cost-note">{section.costNote}</p>}

                    {section.cta && (
                      <div className="portal-cta-group">
                        <a
                          className="portal-cta"
                          href="https://evolut.cloud/"
                          target="_blank"
                          rel="noreferrer"
                          onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
                        >
                          {section.cta}<span aria-hidden="true">↗</span>
                        </a>
                        <span>{section.ctaNote}</span>
                      </div>
                    )}
                  </div>

                  <div className="portal-panel__right">
                    {section.comparisons && (
                      <div className="comparison-table-wrap">
                        <table className="comparison-table">
                          <thead>
                            <tr><th>Capability</th><th>Without Evolut</th><th>With Evolut</th></tr>
                          </thead>
                          <tbody>
                            {section.comparisons.map(([name, without, withEvolut]) => (
                              <tr key={name}>
                                <th scope="row">{name}</th>
                                <td>{without}</td>
                                <td>{withEvolut}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="portal-panel__eyebrow">
                    <span>{section.number}</span> / {section.eyebrow}
                  </p>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  <p className="portal-panel__description">{section.description}</p>

                  {/* Interactive Terminal Widget */}
                  {section.terminal && (
                    <div className="terminal-preview" aria-label="Terminal Preview">
                      <div className="terminal-header">
                        <div className="terminal-dots">
                          <span className="dot dot--red" />
                          <span className="dot dot--yellow" />
                          <span className="dot dot--green" />
                        </div>
                        <span className="terminal-title">bash — deploy gitops</span>
                        <span className="terminal-status">● Live</span>
                      </div>
                      <div className="terminal-body">
                        <div className="terminal-prompt-line">
                          <span className="terminal-prompt-sign">$</span>
                          <span className="terminal-prompt-cmd">
                            <TypewriterText text={section.terminal.command} speed={24} delay={180} showCursor={true} />
                          </span>
                        </div>
                        <div className="terminal-steps-list">
                          {section.terminal.steps.map((step, sIdx) => (
                            <div key={step.label} className="terminal-step">
                              <span className={`terminal-badge terminal-badge--${step.status}`}>
                                {step.label}
                              </span>
                              <span className="terminal-text">
                                <TypewriterText text={step.text} speed={16} delay={320 + sIdx * 150} showCursor={false} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pipeline Flow Steps */}
                  {section.flow && (
                    <ol className="pipeline-flow" aria-label="Pipeline stages">
                      {section.flow.map((step, stepIndex) => (
                        <li
                          key={step}
                          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -2, duration: 200, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, duration: 250, ease: 'outQuad' })}
                        >
                          {step}
                          {stepIndex < section.flow.length - 1 && <span aria-hidden="true">›</span>}
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Environments Staging Cards */}
                  {section.environments && (
                    <div className="portal-environments" aria-label="Isolated Environments">
                      {section.environments.map((env, eIdx) => (
                        <div
                          key={env.name}
                          className="env-card"
                          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -3, scale: 1.02, duration: 220, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, scale: 1, duration: 300, ease: 'outQuad' })}
                        >
                          <div className="env-card__header">
                            <span className="env-card__name">{env.name}</span>
                            <span className="env-card__ping">⚡ {env.ping}</span>
                          </div>
                          <div className="env-card__url">
                            <TypewriterText text={env.url} speed={18} delay={150 + eIdx * 100} showCursor={false} />
                          </div>
                          <div className="env-card__footer">
                            <span className="env-card__status">● {env.status}</span>
                            <span className="env-card__version">{env.version}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Telemetry Metrics Widget */}
                  {section.telemetry && (
                    <div className="portal-telemetry" aria-label="Live Telemetry Signals">
                      {section.telemetry.map((item, tIdx) => (
                        <div
                          key={item.metric}
                          className="telemetry-card"
                          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -3, scale: 1.02, duration: 220, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, scale: 1, duration: 300, ease: 'outQuad' })}
                        >
                          <div className="telemetry-card__top">
                            <span className="telemetry-card__metric">{item.metric}</span>
                            <span className="telemetry-card__badge">{item.badge}</span>
                          </div>
                          <div className="telemetry-card__value">
                            <TypewriterText text={item.value} speed={28} delay={180 + tIdx * 100} showCursor={false} />
                          </div>
                          <div className="telemetry-card__sub">{item.sub}</div>
                          <div className="telemetry-card__bar-wrap">
                            <div className="telemetry-card__bar-fill" data-fill={item.bar || '75%'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Key Facts Pill Badges */}
                  {section.facts && (
                    <ul className="portal-facts">
                      {section.facts.map((fact) => (
                        <li
                          key={fact}
                          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -2, duration: 200, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, duration: 250, ease: 'outQuad' })}
                        >
                          {fact}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Feature Cards Grid */}
                  {section.details && (
                    <dl className="portal-details">
                      {section.details.map((detail, dIdx) => (
                        <div
                          key={detail.label}
                          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -3, scale: 1.02, duration: 220, ease: 'outQuad' })}
                          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, scale: 1, duration: 300, ease: 'outQuad' })}
                        >
                          <dt>{detail.label}</dt>
                          <dd>
                            <TypewriterText text={detail.text} speed={14} delay={150 + dIdx * 80} showCursor={false} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </>
              )}
            </div>
          </section>

            {/* Mobile-only: short gap where the 3D model rotates to the next section */}
            <div
              className="tl-spacer"
              aria-hidden="true"
              style={{ height: `${SECTION_TRANSITION_DISTANCE * 100}svh` }}
              data-p-from={String(sectionProgress)}
              data-p-to={String(sectionProgress + SECTION_TRANSITION_DISTANCE)}
            />
          </Fragment>
        )
      })}

      {/* Mobile-only: post-sections choreography (zoom out → overview → login) */}
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(OVERVIEW_ZOOM_OUT_END - ZOOM_OUT_START) * 100}svh` }}
        data-p-from={String(ZOOM_OUT_START)}
        data-p-to={String(OVERVIEW_ZOOM_OUT_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(OVERVIEW_HOLD_END - OVERVIEW_ZOOM_OUT_END) * 100}svh` }}
        data-p-from={String(OVERVIEW_ZOOM_OUT_END)}
        data-p-to={String(OVERVIEW_HOLD_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(LOGIN_ZOOM_END - LOGIN_ZOOM_START) * 100}svh` }}
        data-p-from={String(LOGIN_ZOOM_START)}
        data-p-to={String(LOGIN_ZOOM_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(TOTAL_SCROLL_PROGRESS - LOGIN_ZOOM_END) * 100}svh` }}
        data-p-from={String(LOGIN_ZOOM_END)}
        data-p-to={String(TOTAL_SCROLL_PROGRESS)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: '60svh' }}
        data-p-from={String(TOTAL_SCROLL_PROGRESS)}
        data-p-to={String(TOTAL_SCROLL_PROGRESS)}
      />
    </div>

    {/* Interactive Liquid Glass Orb based on LerSent001/orb */}
    <LiquidGlassOrb opacity={loginOpacity} isVisible={loginVisible} />
    </>
  )
}

