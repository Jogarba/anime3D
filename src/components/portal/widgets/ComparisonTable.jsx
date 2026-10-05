export default function ComparisonTable({ comparisons }) {
  if (!comparisons) return null

  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table">
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
