import KineticGrid from '../KineticGrid'

export default function AmbientBackdrop({ isMobile = false }) {
  return (
    <>
      {/* Permanent Fixed Background Hex Pattern for ALL pages */}
      <div className="site-hex-grid" aria-hidden="true" />

      {/* Kinetic Wave Matrix Canvas for ALL pages */}
      <KineticGrid isMobile={isMobile} />

      {/* Ambient background glow orb */}
      <div className="ambient-glow-orb" aria-hidden="true" />
    </>
  )
}
