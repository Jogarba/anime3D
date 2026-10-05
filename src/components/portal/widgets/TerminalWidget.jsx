import TypewriterText from '../../common/TypewriterText'

export default function TerminalWidget({ terminal }) {
  if (!terminal) return null

  return (
    <div className="terminal-preview" role="region" aria-label="Example terminal output">
      <span className="portal-sample-label">Illustrative example</span>
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <span className="terminal-title">bash — deploy gitops</span>
        <span className="terminal-status">● Example</span>
      </div>
      <div className="terminal-body">
        <div className="terminal-prompt-line">
          <span className="terminal-prompt-sign">$</span>
          <span className="terminal-prompt-cmd">
            <TypewriterText text={terminal.command} speed={24} delay={180} showCursor={true} />
          </span>
        </div>
        <div className="terminal-steps-list">
          {terminal.steps.map((step, sIdx) => (
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
  )
}
