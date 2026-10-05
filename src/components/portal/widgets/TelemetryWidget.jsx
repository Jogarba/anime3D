import { animate } from 'animejs'
import TypewriterText from '../../common/TypewriterText'

export default function TelemetryWidget({ telemetry }) {
  if (!telemetry) return null

  return (
    <div className="portal-telemetry" role="region" aria-label="Illustrative telemetry metrics">
      <span className="portal-sample-label">Illustrative metrics</span>
      {telemetry.map((item, tIdx) => (
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
  )
}
