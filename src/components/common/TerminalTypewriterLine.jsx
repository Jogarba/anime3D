export default function TerminalTypewriterLine({ icon = '✓', text, colorClass = '', timeText = '' }) {
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
