import { AVATAR_MOODS } from '../constants/avatarMoods'
import useLiquidGlassOrb from '../hooks/useLiquidGlassOrb'

export default function LiquidGlassOrb({ progress, isVisible = true }) {
  const {
    containerRef,
    mood,
    isHovered,
    orbIsInteractive,
    glowRingRef,
    rippleRingRef,
    avatarWrapperRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleOrbClick,
  } = useLiquidGlassOrb({ progress, isVisible })

  return (
    <button
      ref={containerRef}
      type="button"
      className={`liquid-orb-container bloub-avatar-root ${isHovered ? 'bloub-avatar--hovered' : ''}`}
      style={{ opacity: 'var(--login-opacity, 0)', pointerEvents: 'none', '--orb-scale': '0.95' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOrbClick}
      aria-label="Evolut AI Assistant Avatar"
      title="Interactive Evolut avatar"
      aria-hidden={!orbIsInteractive}
      tabIndex={orbIsInteractive ? 0 : -1}
    >
      <div ref={glowRingRef} className="siri-glow-ring bloub-aura-glow" aria-hidden="true" />
      <div ref={rippleRingRef} className="bloub-click-ripple" aria-hidden="true" />
      <div ref={avatarWrapperRef} className="bloub-avatar-wrapper">
        {Object.entries(AVATAR_MOODS).map(([moodKey, svgSrc]) => {
          const isActive = mood === moodKey
          return (
            <img
              key={moodKey}
              src={svgSrc}
              alt={`Evolut Avatar (${moodKey})`}
              className={`bloub-avatar-svg ${isActive ? 'bloub-avatar-svg--active' : 'bloub-avatar-svg--inactive'}`}
              draggable="false"
              aria-hidden={!isActive}
            />
          )
        })}
      </div>
    </button>
  )
}
