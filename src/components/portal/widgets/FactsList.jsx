import { animate } from 'animejs'

export default function FactsList({ facts }) {
  if (!facts) return null

  return (
    <ul className="portal-facts">
      {facts.map((fact) => (
        <li
          key={fact}
          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -2, duration: 200, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, duration: 250, ease: 'outQuad' })}
        >
          {fact}
        </li>
      ))}
    </ul>
  )
}
