import { useEffect, useRef, useState } from 'react'
import { createTimeline, animate, stagger } from 'animejs'
import Scene from './components/Scene'
import Loader from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'
import { landingSections } from './landingContent'
import {
  ALIGN_DURATION,
  BLACK_FADE_DURATION,
  FIRST_CROSS_END,
  FIRST_PASSAGE_END,
  FIRST_ALIGN_END,
  HOME_DURATION,
  HOME_HOLD_DURATION,
  PORTAL_APPROACH_DURATION,
  PORTAL_CONTENT_HOLD_DURATION,
  PORTALS,
  RETURN_DURATION,
  TOTAL_SCROLL_PROGRESS,
  CYCLE_DURATION,
} from './sceneSequence'

const SCROLL_UNIT_MS = 1000
const clamp01 = (value) => Math.min(1, Math.max(0, value))
const easeInOut = (value) => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function portalAtProgress(progress) {
  if (progress >= FIRST_CROSS_END && progress < FIRST_PASSAGE_END) {
    return {
      index: 0,
      opacity: easeInOut((progress - FIRST_CROSS_END) / 0.14),
    }
  }

  if (progress < FIRST_PASSAGE_END) return { index: -1, opacity: 0 }

  const cycleIndex = Math.floor((progress - FIRST_PASSAGE_END) / CYCLE_DURATION)
  if (cycleIndex < 0 || cycleIndex >= PORTALS.length) return { index: -1, opacity: 0 }

  const cycleStart = FIRST_PASSAGE_END + cycleIndex * CYCLE_DURATION
  const cycleProgress = progress - cycleStart
  const returnEnd = RETURN_DURATION + HOME_DURATION
  const nextPageStart = cycleStart + CYCLE_DURATION - PORTAL_CONTENT_HOLD_DURATION

  if (cycleProgress < returnEnd) {
    return {
      index: cycleIndex,
      opacity: 1 - easeInOut(cycleProgress / 0.22),
    }
  }

  if (progress < nextPageStart) return { index: -1, opacity: 0 }

  return {
    index: cycleIndex + 1,
    opacity: easeInOut((progress - nextPageStart) / 0.14),
  }
}

export default function App() {
  const progress = useRef(0)
  const activePortalRef = useRef(-1)
  const heroVisibleRef = useRef(true)
  const [activePortal, setActivePortal] = useState(-1)
  const [heroVisible, setHeroVisible] = useState(true)
  const [scrollPercent, setScrollPercent] = useState(0)

  const navigateToProgress = (event, target) => {
    event.preventDefault()
    window.scrollTo({ top: target * window.innerHeight, behavior: 'smooth' })
  }
  const portalTarget = (index) => {
    if (index === 0) return FIRST_CROSS_END + 0.18
    const cycleStart = FIRST_PASSAGE_END + (index - 1) * CYCLE_DURATION
    return cycleStart + CYCLE_DURATION - PORTAL_CONTENT_HOLD_DURATION + 0.18
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
    .add('.hero-title-line', {
      opacity: [0, 1],
      translateY: [32, 0],
      duration: 750,
      delay: stagger(100),
    }, '-=350')
    .add('.hero-subtitle', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 650,
    }, '-=400')
    .add('.hero-cta-wrap', {
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 600,
    }, '-=350')
    .add('.hero-stats-bar > *', {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 500,
      delay: stagger(60),
    }, '-=300')
    .add('.hero-terminal', {
      opacity: [0, 1],
      translateY: [28, 0],
      scale: [0.96, 1],
      duration: 800,
    }, '-=650')
    .add('.hero-terminal__body .t-log', {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 400,
      delay: stagger(90),
    }, '-=400')
    .add('.scroll-indicator', {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
    }, '-=200')

    // Continuous ambient glow pulse
    animate('.ambient-glow-orb', {
      scale: [1, 1.25, 1],
      opacity: [0.35, 0.6, 0.35],
      duration: 7000,
      loop: true,
      ease: 'inOutSine',
    })

    // Scroll indicator floating bounce
    animate('.scroll-indicator__chevron', {
      translateY: [0, 7, 0],
      duration: 1800,
      loop: true,
      ease: 'inOutQuad',
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
    const blackout = { opacity: 0 }
    const applyBlackout = () => root.style.setProperty('--blackout-opacity', blackout.opacity)

    const timeline = createTimeline({ autoplay: false, onUpdate: applyBlackout })
    timeline.add(blackout, {
      opacity: 0,
      duration: (FIRST_CROSS_END - BLACK_FADE_DURATION) * SCROLL_UNIT_MS,
    })
    timeline.add(blackout, {
      opacity: [0, 1],
      duration: BLACK_FADE_DURATION * SCROLL_UNIT_MS,
      ease: 'inOutSine',
    })
    timeline.add(blackout, {
      opacity: 1,
      duration: PORTAL_CONTENT_HOLD_DURATION * SCROLL_UNIT_MS,
    })

    const returnToHomeMs = (RETURN_DURATION + HOME_DURATION) * SCROLL_UNIT_MS
    const modelTravelMs =
      (HOME_HOLD_DURATION + ALIGN_DURATION + PORTAL_APPROACH_DURATION) * SCROLL_UNIT_MS

    for (let i = 0; i < PORTALS.length; i++) {
      timeline.add(blackout, {
        opacity: [1, 0],
        duration: returnToHomeMs,
        ease: 'inOutSine',
      })
      timeline.add(blackout, { opacity: 0, duration: modelTravelMs })
      timeline.add(blackout, {
        opacity: [0, 1],
        duration: BLACK_FADE_DURATION * SCROLL_UNIT_MS,
        ease: 'inOutSine',
      })
      timeline.add(blackout, {
        opacity: 1,
        duration: PORTAL_CONTENT_HOLD_DURATION * SCROLL_UNIT_MS,
      })
    }

    timeline.pause()

    let raw = 0
    let frame = 0
    let last = 0

    const apply = () => {
      const currentProgress = Math.min(progress.current, TOTAL_SCROLL_PROGRESS)
      timeline.seek(currentProgress * SCROLL_UNIT_MS)
      applyBlackout()
      const active = portalAtProgress(currentProgress)
      if (activePortalRef.current !== active.index) {
        activePortalRef.current = active.index
        setActivePortal(active.index)
      }
      root.style.setProperty(
        '--portal-content-opacity',
        String(active.opacity),
      )
      
      setScrollPercent(Math.min(100, Math.round((progress.current / (TOTAL_SCROLL_PROGRESS + 1.2)) * 100)))

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

      // Footer only starts fading in after reaching the dedicated end of the scroll
      const footerProgress = (progress.current - TOTAL_SCROLL_PROGRESS - 0.2) / 0.45
      root.style.setProperty(
        '--footer-opacity',
        String(clamp01(footerProgress)),
      )
    }

    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const k = 1 - Math.exp(-7 * dt)
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
      raw = window.scrollY / Math.max(window.innerHeight, 1)
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
      timeline.revert()
      root.style.removeProperty('--blackout-opacity')
      root.style.removeProperty('--portal-content-opacity')
      root.style.removeProperty('--hero-opacity')
      root.style.removeProperty('--footer-opacity')
    }
  }, [])

  return (
    <main
      id="top"
      className="model-view"
      style={{ '--scroll-height': `${(TOTAL_SCROLL_PROGRESS + 1.85) * 100}dvh` }}
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
          EVOLUT<span>®</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#pipeline" onClick={(event) => navigateToProgress(event, portalTarget(0))}>Pipeline</a>
          <a href="#configure" onClick={(event) => navigateToProgress(event, portalTarget(1))}>Platform</a>
          <a href="#releases" onClick={(event) => navigateToProgress(event, portalTarget(2))}>Delivery</a>
          <a href="#security" onClick={(event) => navigateToProgress(event, portalTarget(3))}>Security</a>
          <a href="#operations" onClick={(event) => navigateToProgress(event, portalTarget(4))}>Observability</a>
          <a href="#business-case" onClick={(event) => navigateToProgress(event, portalTarget(5))}>Business Case</a>
        </nav>
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
      </header>

      {/* Ambient background glow orb */}
      <div className="ambient-glow-orb" aria-hidden="true" />

      {/* Hero Initial Screen — Completely removed as soon as scroll begins */}
      <div
        className={`hero-view${!heroVisible ? ' hero-view--hidden' : ''}`}
        hidden={!heroVisible}
        aria-hidden={!heroVisible}
        aria-label="Hero banner"
      >
        <div className="hero-hex-grid" aria-hidden="true" />
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge__dot" />
              AUTOMATED INFRASTRUCTURE PLATFORM
            </div>

            <h1 className="hero-title">
              <span className="hero-title-line">Ship fast.</span>
              <span className="hero-title-line">Ship secure.</span>
              <span className="hero-title-line hero-title__highlight">Ship always.</span>
            </h1>

            <p className="hero-subtitle">
              Your team writes code. We handle everything from deployment pipelines to secrets, monitoring, and scaling — automatically, on every push.
            </p>

            <div className="hero-cta-wrap">
              <a
                className="hero-cta-btn"
                href="https://evolut.cloud/"
                target="_blank"
                rel="noreferrer"
                onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.05, translateY: -2, duration: 220, ease: 'outBack' })}
                onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, translateY: 0, duration: 300, ease: 'outQuad' })}
              >
                BOOK A FREE DEMO
              </a>
            </div>

            <div className="hero-stats-bar">
              <span><strong>&lt; 60s</strong> to first deploy</span>
              <span className="hero-stats-sep">·</span>
              <span><strong>99.99%</strong> uptime SLA</span>
              <span className="hero-stats-sep">·</span>
              <span><strong>40%</strong> cost reduction</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-terminal">
              <div className="hero-terminal__header">
                <div className="hero-terminal__dots">
                  <span className="t-dot t-dot--red" />
                  <span className="t-dot t-dot--yellow" />
                  <span className="t-dot t-dot--green" />
                </div>
                <span className="hero-terminal__title">evolut — deployment pipeline</span>
              </div>
              <div className="hero-terminal__body">
                <p className="hero-terminal__cmd">$ git push origin main</p>
                <div className="hero-terminal__logs">
                  <p className="t-log t-log--green">✓ Build passed (42s)</p>
                  <p className="t-log t-log--green">✓ Image pushed to registry</p>
                  <p className="t-log t-log--cyan">✓ Dev environment synced</p>
                  <p className="t-log t-log--cyan">✓ QA ready › qa.yourapp.com</p>
                  <p className="t-log t-log--green">✓ Certificates renewed</p>
                  <p className="t-log t-log--green">✓ Secrets rotated automatically</p>
                  <p className="t-log t-log--live">● Live 99.99% uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Floating Scroll Indicator */}
        <div
          className="scroll-indicator"
          onClick={(e) => navigateToProgress(e, portalTarget(0))}
          role="button"
          tabIndex={0}
          aria-label="Scroll to explore architecture"
        >
          <span className="scroll-indicator__text">SCROLL TO EXPLORE ARCHITECTURE</span>
          <div className="scroll-indicator__track">
            <span className="scroll-indicator__chevron">↓</span>
          </div>
        </div>
      </div>


      <div className="portal-content" aria-live="polite">

        {landingSections.map((section, index) => {
          const active = activePortal === index
          const isBusinessCase = section.id === 'business-case'

          return (
            <section
              key={section.id}
              id={section.id}
              className={`portal-panel${active ? ' portal-panel--active' : ''}${isBusinessCase ? ' portal-panel--wide' : ''}`}
              aria-labelledby={`${section.id}-title`}
              aria-hidden={!active}
              hidden={!active}
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
                          {section.stats.map((stat) => (
                            <div key={stat.label}>
                              <dt>{stat.value}</dt>
                              <dd>{stat.label}</dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      {section.costNote && <p className="portal-cost-note">{section.costNote}</p>}

                      {section.cta && (
                        <div className="portal-cta-group">
                          <a className="portal-cta" href="https://evolut.cloud/" target="_blank" rel="noreferrer">
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
                            <span className="terminal-prompt-cmd">{section.terminal.command}</span>
                          </div>
                          <div className="terminal-steps-list">
                            {section.terminal.steps.map((step) => (
                              <div key={step.label} className="terminal-step">
                                <span className={`terminal-badge terminal-badge--${step.status}`}>
                                  {step.label}
                                </span>
                                <span className="terminal-text">{step.text}</span>
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
                          <li key={step}>
                            {step}
                            {stepIndex < section.flow.length - 1 && <span aria-hidden="true">›</span>}
                          </li>
                        ))}
                      </ol>
                    )}

                    {/* Environments Staging Cards */}
                    {section.environments && (
                      <div className="portal-environments" aria-label="Isolated Environments">
                        {section.environments.map((env) => (
                          <div key={env.name} className="env-card">
                            <div className="env-card__header">
                              <span className="env-card__name">{env.name}</span>
                              <span className="env-card__ping">⚡ {env.ping}</span>
                            </div>
                            <div className="env-card__url">{env.url}</div>
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
                        {section.telemetry.map((item) => (
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
                            <div className="telemetry-card__value">{item.value}</div>
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
                        {section.facts.map((fact) => <li key={fact}>{fact}</li>)}
                      </ul>
                    )}

                    {/* Feature Cards Grid */}
                    {section.details && (
                      <dl className="portal-details">
                        {section.details.map((detail) => (
                          <div key={detail.label}>
                            <dt>{detail.label}</dt>
                            <dd>{detail.text}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </>
                )}
              </div>
            </section>
          )
        })}
      </div>


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

      {/* Enlarged, Comprehensive Footer */}
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
    </main>
  )
}

