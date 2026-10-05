import { useState, useEffect } from 'react'
import Scene from './components/canvas/Scene'
import Loader from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'
import LiquidGlassOrb from './components/LiquidGlassOrb'
import Navbar from './components/layout/Navbar'
import MobileMenu from './components/layout/MobileMenu'
import AmbientBackdrop from './components/layout/AmbientBackdrop'
import PortalContainer from './components/portal/PortalContainer'
import DimensionalWarpOverlay from './components/portal/DimensionalWarpOverlay'

import { useMobile } from './hooks/useMobile'
import { useScrollChoreography } from './hooks/useScrollChoreography'
import { usePortalAnimation } from './hooks/usePortalAnimation'
import { MOBILE_MAX_WIDTH } from './constants/breakpoints'
import { TOTAL_SCROLL_PROGRESS, getPortalTarget } from './sceneSequence'

export default function App() {
  const { isMobile, isMobileRef } = useMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    progress,
    activePortal,
    heroVisible,
    loginVisible,
    warpVisible,
    isRedirecting,
    isWarpingViaButton,
    scrollToProgress,
    handleStartWarp,
  } = useScrollChoreography(isMobileRef)

  usePortalAnimation(activePortal, isMobile)

  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > MOBILE_MAX_WIDTH) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const navigateToProgress = (event, target) => {
    event.preventDefault()
    scrollToProgress(target, 'smooth')
  }

  const handleMenuNav = (event, target) => {
    event.preventDefault()
    setMenuOpen(false)
    setTimeout(() => scrollToProgress(target, 'smooth'), 80)
  }

  const handleStartClick = (event) => {
    setMenuOpen(false)
    handleStartWarp(event)
  }

  return (
    <>
      <main
        id="top"
        className="model-view"
        style={{ '--scroll-height': `${(TOTAL_SCROLL_PROGRESS + 0.6) * 100}dvh` }}
      >
        <p className="visually-hidden">
          Evolut automates CI/CD deployment pipelines, secrets management, security scanning, observability, and auto-scaling for modern development teams.
        </p>

        <Navbar
          activePortal={activePortal}
          onNavigate={navigateToProgress}
          onStartClick={handleStartClick}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          portalTarget={getPortalTarget}
        />

        <AmbientBackdrop isMobile={isMobile} />

        <ErrorBoundary
          fallback={
            <div className="fallback" role="alert">
              <p>Could not load the 3D experience. Please check your connection and refresh.</p>
            </div>
          }
        >
          <Scene
            progress={progress}
            isMobile={isMobile}
            isWarpingViaButton={isWarpingViaButton}
          />
        </ErrorBoundary>

        <Loader />

        <div className="blackout" aria-hidden="true" />
        <div className="scroll-track" aria-hidden="true" />
      </main>

      <MobileMenu
        menuOpen={menuOpen}
        onMenuNav={handleMenuNav}
        onStartClick={handleStartClick}
        portalTarget={getPortalTarget}
      />

      <PortalContainer activePortal={activePortal} isMobile={isMobile} />

      <LiquidGlassOrb progress={progress} isVisible={loginVisible} />

      <DimensionalWarpOverlay isRedirecting={isRedirecting} isVisible={warpVisible} />
    </>
  )
}
