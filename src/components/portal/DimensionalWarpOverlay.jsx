export default function DimensionalWarpOverlay({ isRedirecting, isVisible }) {

  return (
    <div
      className={`dimensional-warp-portal ${isRedirecting ? 'dimensional-warp-portal--active' : ''}`}
      style={{
        opacity: isRedirecting ? 1 : 'var(--warp-opacity, 0)',
        pointerEvents: 'none',
      }}
      aria-hidden={!isVisible}
    >
      <div className="portal-event-horizon" aria-hidden="true" />
      <div className="dimensional-speed-lines" aria-hidden="true" />
      <div className="dimensional-radial-vortex" aria-hidden="true" />
      <div className="portal-shockwave-ring" aria-hidden="true" />
      <div className="dimensional-core-burst" aria-hidden="true" />
      <div className="portal-breakthrough-flash" aria-hidden="true" />
    </div>
  )
}
