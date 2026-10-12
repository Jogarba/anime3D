import { useEffect, useState } from 'react'
import TypewriterText from '../../common/TypewriterText'

export default function TerminalWidget({ terminal, isActive = false }) {
  const [typingRun, setTypingRun] = useState(0)
  const command = terminal?.command ?? ''
  const steps = terminal?.steps ?? []
  const commandDelay = 180
  const commandSpeed = 28
  const outputSpeed = 16
  let nextOutputDelay = commandDelay + command.length * commandSpeed + 260
  const outputDelays = steps.map((step) => {
    const delay = nextOutputDelay
    nextOutputDelay += (step.text?.length ?? 0) * outputSpeed + 180
    return delay
  })

  useEffect(() => {
    if (isActive) setTypingRun((run) => run + 1)
  }, [isActive])

  if (!terminal) return null

  return (
    <div className="terminal-preview" role="region" aria-label="Example terminal output" aria-live="off">
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
        <div
          key={`terminal-command-${typingRun}`}
          className="terminal-prompt-line terminal-output-line"
          style={{ animationDelay: `${commandDelay}ms` }}
        >
          <span className="terminal-prompt-sign">$</span>
          <span className="terminal-prompt-cmd">
            <TypewriterText
              className="terminal-typewriter"
              text={command}
              speed={commandSpeed}
              delay={commandDelay}
              enabled={typingRun > 0}
              restartKey={typingRun}
              showCursor
            />
          </span>
        </div>
        <div className="terminal-steps-list">
          {steps.map((step, sIdx) => (
            <div
              key={`terminal-step-${typingRun}-${step.label}`}
              className="terminal-step terminal-output-line"
              style={{ animationDelay: `${outputDelays[sIdx]}ms` }}
            >
              <span className={`terminal-badge terminal-badge--${step.status}`}>
                {step.label}
              </span>
              <span className="terminal-text">
                <TypewriterText
                  className="terminal-typewriter"
                  text={step.text}
                  speed={outputSpeed}
                  delay={outputDelays[sIdx]}
                  enabled={typingRun > 0}
                  restartKey={typingRun}
                  showCursor
                  cursorWhenDone={sIdx === steps.length - 1}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
