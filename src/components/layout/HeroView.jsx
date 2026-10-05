import { useState } from 'react'
import { animate } from 'animejs'
import TypewriterText from '../common/TypewriterText'
import { EXTERNAL_LINKS } from '../../constants/navigation'

export default function HeroView({ onStartClick }) {
  const [copied, setCopied] = useState(false)

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(EXTERNAL_LINKS.INSTALL_CMD)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="hero-container">
      <div className="hero-left">
        <p className="hero-badge">
          <span className="hero-badge__dot" aria-hidden="true" />
          Kubernetes-native application platform
        </p>
        <h1 className="hero-title">
          <span className="hero-title-line">Production-grade</span>
          <span className="hero-title-line">
            Kubernetes<span className="anime-accent-dot">.</span>
          </span>
          <span className="hero-title-line">
            <span className="hero-title__highlight">Ship fast. Ship secure.</span>
          </span>
        </h1>
        <p className="hero-subtitle">
          <TypewriterText
            text="Your team writes code. Evolut handles pipelines, secrets, security, observability, and scaling — automatically, on every push."
            speed={14}
            delay={280}
            showCursor={false}
          />
        </p>
        <div className="hero-cta-wrap">
          <a
            className="hero-cta-btn liquid-glass-card"
            href={EXTERNAL_LINKS.LOGIN}
            onClick={onStartClick}
            onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
            onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
          >
            Start <span className="btn-arrow-icon" aria-hidden="true">→</span>
          </a>
          <a
            className="hero-cta-btn liquid-glass-card"
            href={EXTERNAL_LINKS.BOOK_DEMO}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
            onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
          >
            Book a demo <span className="btn-arrow-icon" aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="npm-install-pill liquid-glass-card"
            onClick={copyInstall}
            aria-label={`Copy ${EXTERNAL_LINKS.INSTALL_CMD}`}
          >
            <span className="npm-install-icon" aria-hidden="true">$</span>
            <span>{copied ? 'copied' : EXTERNAL_LINKS.INSTALL_CMD}</span>
          </button>
        </div>
        <div className="hero-stats-bar liquid-glass-card">
          <div className="hero-stat-item">
            <strong>Automated</strong>
            <span>Git-triggered</span>
          </div>
          <span className="hero-stats-sep" aria-hidden="true">|</span>
          <div className="hero-stat-item">
            <strong>Failover</strong>
            <span>Auto recovery</span>
          </div>
          <span className="hero-stats-sep" aria-hidden="true">|</span>
          <div className="hero-stat-item">
            <strong>Runtime</strong>
            <span>Secret injection</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-right-card hero-status-card liquid-glass-card">
          <span className="hero-status-pill">
            <span className="hero-status-pulse" aria-hidden="true" />
            Example deployment
          </span>
          <div className="hero-status-meta">
            <span>v2.4.1 sample</span>
          </div>
        </div>

        <div className="hero-right-card hero-terminal liquid-glass-card">
          <div className="hero-terminal__header">
            <div className="hero-terminal__dots" aria-hidden="true">
              <span className="t-dot t-dot--red" />
              <span className="t-dot t-dot--yellow" />
              <span className="t-dot t-dot--green" />
            </div>
            <span className="hero-terminal__title">evolut deploy</span>
            <span className="hero-terminal__badge">EXAMPLE</span>
          </div>
          <div className="hero-terminal__body">
            <p className="hero-terminal__cmd">
              <span className="cmd-prompt">$</span>
              git push origin main
            </p>
            <div className="hero-terminal__logs">
              <p className="t-log t-log--cyan">
                <span className="log-icon">▸</span>
                Example container build completed
              </p>
              <p className="t-log t-log--green">
                <span className="log-icon">✓</span>
                Example security scan completed
              </p>
              <p className="t-log t-log--green">
                <span className="log-icon">✓</span>
                Example GitOps deployment completed
              </p>
            </div>
          </div>
        </div>

        <div className="hero-right-card hero-metrics-card liquid-glass-card" role="region" aria-label="Illustrative telemetry metrics">
          <span className="hero-metrics-label">Illustrative metrics</span>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">14.2k</span>
            <span className="hero-metric-pod__lbl">req /s</span>
          </div>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">12ms</span>
            <span className="hero-metric-pod__lbl">p99</span>
          </div>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">4</span>
            <span className="hero-metric-pod__lbl">pods</span>
          </div>
        </div>
      </div>
    </div>
  )
}
