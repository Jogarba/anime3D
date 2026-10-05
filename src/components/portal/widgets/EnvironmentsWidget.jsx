import { animate } from 'animejs'
import TypewriterText from '../../common/TypewriterText'

export default function EnvironmentsWidget({ environments }) {
  if (!environments) return null

  return (
    <div className="portal-environments" role="region" aria-label="Example environment data">
      <span className="portal-sample-label">Example environment data</span>
      {environments.map((env, eIdx) => (
        <div
          key={env.name}
          className="env-card"
          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -3, scale: 1.02, duration: 220, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, scale: 1, duration: 300, ease: 'outQuad' })}
        >
          <div className="env-card__header">
            <span className="env-card__name">{env.name}</span>
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
  )
}
