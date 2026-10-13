import { useEffect, useState } from 'react'
import { EXTERNAL_LINKS } from '../../constants/navigation'
import TypewriterText from '../common/TypewriterText'
import TechHeading from '../common/TechHeading'

export default function HeroView({ isActive = false }) {
  const [copied, setCopied] = useState(false)
  const [typingRun, setTypingRun] = useState(0)
  const command = 'git push origin main'
  const commandDelay = 180
  const commandSpeed = 30
  const logSpeed = 16
  const deploymentLogs = [
    { text: 'Build passed (42s)', className: 't-log--green', icon: '✓' },
    { text: 'Image pushed to registry', className: 't-log--cyan', icon: '✓' },
    { text: 'Dev environment synced', className: 't-log--cyan', icon: '✓' },
    { text: 'QA ready → qa.yourapp.com', className: 't-log--cyan', icon: '✓' },
    { text: 'Certificates renewed', className: 't-log--green', icon: '✓' },
    { text: 'Secrets rotated automatically', className: 't-log--green', icon: '✓' },
    { text: 'Live · 99.99% uptime SLA', className: 't-log--green', icon: '●' },
  ]
  let nextLogDelay = commandDelay + command.length * commandSpeed + 260

  const logs = deploymentLogs.map((log) => {
    const delay = nextLogDelay
    nextLogDelay += log.text.length * logSpeed + 180
    return { ...log, delay }
  })

  useEffect(() => {
    if (isActive) setTypingRun((run) => run + 1)
  }, [isActive])

  const copyInstallCommand = async () => {
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
        <p className="portal-panel__eyebrow hero-badge">
          <span className="hero-badge__dot" aria-hidden="true" />
          Automated infrastructure platform
        </p>
        <TechHeading
          as="h1"
          id="landing-hero-title"
          className="hero-title tech-heading--hero"
          text="Ship it. Evolut handles the rest."
          lines={['Ship it.', 'Evolut handles', 'the rest.']}
          colors={['#ffffff', '#ffffff', '#7dd3fc']}
          fontSize={88}
          active={isActive}
        />
        <p className="portal-panel__description hero-subtitle">
          <TypewriterText
            text="Your team writes code. We handle everything from deployment pipelines to secrets, monitoring, and scaling — automatically, on every push."
            speed={14}
            delay={280}
            showCursor={false}
          />
        </p>
        <div className="hero-install" aria-label="Install command">
          <code className="hero-install__command">{EXTERNAL_LINKS.INSTALL_CMD}</code>
          <button
            className={`hero-install__button${copied ? ' is-copied' : ''}`}
            type="button"
            onClick={copyInstallCommand}
            aria-label={copied ? 'Install command copied' : `Copy install command: ${EXTERNAL_LINKS.INSTALL_CMD}`}
            aria-live="polite"
          >
            <span className="hero-install__button-label hero-install__button-label--default">Copy command</span>
            <span className="hero-install__button-label hero-install__button-label--copied" aria-hidden="true">
              <span className="hero-install__check">✓</span> Copied
            </span>
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-right-card hero-status-card liquid-glass-card">
          <span className="hero-status-pill">
            <span className="hero-status-pulse" aria-hidden="true" />
            Deployment pipeline
          </span>
          <div className="hero-status-meta">
            <span>Automated on every push</span>
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
          <div className="hero-terminal__body" aria-live="off">
            <p
              key={`hero-command-${typingRun}`}
              className="hero-terminal__cmd terminal-output-line"
              style={{ animationDelay: `${commandDelay}ms` }}
            >
              <span className="cmd-prompt">$</span>
              <TypewriterText
                className="terminal-typewriter"
                text={command}
                speed={commandSpeed}
                delay={commandDelay}
                enabled={typingRun > 0}
                restartKey={typingRun}
                showCursor
              />
            </p>
            <div className="hero-terminal__logs">
              {logs.map((log, index) => (
                <p
                  key={`hero-log-${typingRun}-${log.text}`}
                  className={`t-log ${log.className} terminal-output-line`}
                  style={{ animationDelay: `${log.delay}ms` }}
                >
                  <span className="log-icon" aria-hidden="true">{log.icon}</span>
                  <TypewriterText
                    className="terminal-typewriter"
                    text={log.text}
                    speed={logSpeed}
                    delay={log.delay}
                    enabled={typingRun > 0}
                    restartKey={typingRun}
                    showCursor
                    cursorWhenDone={index === logs.length - 1}
                  />
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-right-card hero-metrics-card liquid-glass-card" role="region" aria-label="Platform performance claims">
          <span className="hero-metrics-label">Platform at a glance</span>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">&lt;60s</span>
            <span className="hero-metric-pod__lbl">first deploy</span>
          </div>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">99.99%</span>
            <span className="hero-metric-pod__lbl">uptime SLA</span>
          </div>
          <div className="hero-metric-pod">
            <span className="hero-metric-pod__val">40%</span>
            <span className="hero-metric-pod__lbl">cost reduction</span>
          </div>
        </div>
      </div>

      <div className="hero-stats-bar">
        <div className="hero-stat-item">
          <strong>0 secrets</strong>
          <span>in source code</span>
        </div>
        <div className="hero-stat-item">
          <strong>14 hours / week</strong>
          <span>infrastructure toil reclaimed</span>
        </div>
        <div className="hero-stat-item">
          <strong>$140k+ / year</strong>
          <span>median DevOps engineer salary</span>
        </div>
      </div>
    </div>
  )
}
