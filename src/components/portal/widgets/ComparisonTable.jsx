import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

export default function ComparisonTable({ comparisons, isActive = false }) {
  const tableRef = useRef(null)

  useEffect(() => {
    if (!isActive || !tableRef.current) return

    const rows = Array.from(tableRef.current.querySelectorAll('tbody tr'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    rows.forEach((row, index) => {
      animate(row, {
        opacity: [0, 1],
        translateY: [18, 0],
        delay: index * 90,
        duration: 680,
        ease: 'outCubic',
      })
    })
  }, [isActive])

  if (!comparisons) return null

  return (
    <div className="comparison-table-wrap">
      <table ref={tableRef} className="comparison-table">
        <thead>
          <tr>
            <th>Capability</th>
            <th>Without Evolut</th>
            <th>With Evolut</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map(([name, without, withEvolut]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{without}</td>
              <td>{withEvolut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
