import { animate } from 'animejs'
import TypewriterText from '../../common/TypewriterText'

export default function FeatureDetails({ details }) {
  if (!details) return null

  return (
    <dl className="portal-details">
      {details.map((detail, dIdx) => (
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
  )
}
