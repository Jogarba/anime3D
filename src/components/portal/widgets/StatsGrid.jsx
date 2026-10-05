import { animate } from 'animejs'
import TypewriterText from '../../common/TypewriterText'

export default function StatsGrid({ stats }) {
  if (!stats) return null

  return (
    <dl className="portal-stats portal-stats--2x2">
      {stats.map((stat, sIdx) => (
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
  )
}
