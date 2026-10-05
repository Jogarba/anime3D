import { animate } from 'animejs'

export default function PipelineFlow({ flow }) {
  if (!flow) return null

  return (
    <ol className="pipeline-flow" aria-label="Pipeline stages">
      {flow.map((step, stepIndex) => (
        <li
          key={step}
          onMouseEnter={(e) => animate(e.currentTarget, { translateY: -2, duration: 200, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { translateY: 0, duration: 250, ease: 'outQuad' })}
        >
          {step}
          {stepIndex < flow.length - 1 && <span aria-hidden="true">›</span>}
        </li>
      ))}
    </ol>
  )
}
