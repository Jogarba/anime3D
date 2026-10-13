import useKineticGridCanvas from '../hooks/useKineticGridCanvas'

export default function KineticGrid({ isMobile = false }) {
  const canvasRef = useKineticGridCanvas(isMobile)
  return <canvas ref={canvasRef} className="kinetic-grid-canvas" aria-hidden="true" />
}
