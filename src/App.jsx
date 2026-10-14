import { useState, useEffect, useCallback, useRef } from 'react'
import Scene from './components/canvas/Scene'
import Loader from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'
import LiquidGlassOrb from './components/LiquidGlassOrb'
import Navbar from './components/layout/Navbar'
import MobileMenu from './components/layout/MobileMenu'
import DemoFormModal from './components/layout/DemoFormModal'
import AmbientBackdrop from './components/layout/AmbientBackdrop'
import PortalContainer from './components/portal/PortalContainer'
import DimensionalWarpOverlay from './components/portal/DimensionalWarpOverlay'

import { useMobile } from './hooks/useMobile'
import { useScrollChoreography } from './hooks/useScrollChoreography'
import { usePortalAnimation } from './hooks/usePortalAnimation'
import { MOBILE_MAX_WIDTH } from './constants/breakpoints'
import {
  TOTAL_SCROLL_PROGRESS,
  INITIAL_ZOOM_DISTANCE,
  OVERVIEW_ZOOM_OUT_START,
  WARP_APPROACH_START,
  getPortalSectionStart,
  getPortalTarget,
} from './sceneSequence'

export default function App() {
  const { isMobile, isMobileRef } = useMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const demoCameraRequest = useRef({ id: 0, open: false })
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSceneVisible, setIsSceneVisible] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const initialRevealProgress = useRef(0)
  const footerRef = useRef(null)
  const footerShownRef = useRef(false)
  const markModelReady = useCallback(() => setModelReady(true), [])
  const revealScene = useCallback(() => setIsSceneVisible(true), [])
  const revealLanding = useCallback(() => setIsInitialLoading(false), [])

  const openDemo = useCallback((event) => {
    event?.preventDefault()
    setMenuOpen(false)
    document.documentElement.dataset.demoOpen = 'true'
    demoCameraRequest.current = { id: demoCameraRequest.current.id + 1, open: true }
    setIsDemoOpen(true)
  }, [])

  const closeDemo = useCallback(() => {
    document.documentElement.dataset.demoOpen = 'false'
    demoCameraRequest.current = { id: demoCameraRequest.current.id + 1, open: false }
    setIsDemoOpen(false)
  }, [])

  const {
    progress,
    navigationAnimation,
    navigationTransition,
    activePortal,
    heroVisible,
    loginVisible,
    warpVisible,
    isRedirecting,
    isWarpingViaButton,
    scrollToProgress,
    handleStartWarp,
  } = useScrollChoreography(isMobileRef)

  usePortalAnimation(progress, isMobile, navigationAnimation)

  useEffect(() => {
    const footer = footerRef.current
    const root = document.documentElement
    if (!footer) return undefined

    const syncFooterVisibility = () => {
      const shouldShow = !isInitialLoading && !isDemoOpen && (
        heroVisible || root.dataset.modelOverview === 'true'
      )
      if (shouldShow === footerShownRef.current) return

      footerShownRef.current = shouldShow
      const current = getComputedStyle(footer)
      const from = {
        opacity: current.opacity,
        transform: current.transform === 'none' ? 'translate3d(0, 0, 0)' : current.transform,
      }
      footer.getAnimations().forEach((animation) => animation.cancel())

      footer.animate(
        shouldShow
          ? [from, { opacity: 1, transform: 'translate3d(0, 0, 0)' }]
          : [from, { opacity: 0, transform: 'translate3d(0, 12px, 0)' }],
        {
          duration: shouldShow ? 1200 : 500,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        },
      )
    }

    syncFooterVisibility()
    const overviewObserver = new MutationObserver(syncFooterVisibility)
    overviewObserver.observe(root, { attributes: true, attributeFilter: ['data-model-overview'] })

    return () => overviewObserver.disconnect()
  }, [heroVisible, isDemoOpen, isInitialLoading])

  const navigationTarget = isMobile
    ? getPortalSectionStart
    : getPortalTarget

  useEffect(() => {
    if (!menuOpen && !isDemoOpen) return
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevOverflow
    }
  }, [menuOpen, isDemoOpen])

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

  const navigateToProgress = (event, target, targetIndex = null) => {
    event.preventDefault()
    const currentProgress = progress.current
    const isSectionRoute = Number.isInteger(targetIndex)
    const returnToInitialModel = !isSectionRoute && !isMobile &&
      currentProgress > 0.15
    const fromFirstModelView = isSectionRoute && !isMobile && currentProgress < INITIAL_ZOOM_DISTANCE
    const betweenSections = isSectionRoute && !isMobile &&
      currentProgress >= INITIAL_ZOOM_DISTANCE &&
      currentProgress < OVERVIEW_ZOOM_OUT_START
    const fromOverview = isSectionRoute && !isMobile &&
      currentProgress >= OVERVIEW_ZOOM_OUT_START &&
      currentProgress < WARP_APPROACH_START
    scrollToProgress(
      returnToInitialModel ? 0 : target,
      'smooth',
      returnToInitialModel || fromFirstModelView || betweenSections || fromOverview,
      targetIndex ?? 0,
      returnToInitialModel
        ? 'to-home'
        : betweenSections
          ? 'between-sections'
          : fromFirstModelView
            ? 'from-initial'
            : 'to-section',
    )
  }

  const handleMenuNav = (event, target, targetIndex = null) => {
    event.preventDefault()
    const currentProgress = progress.current
    const isSectionRoute = Number.isInteger(targetIndex)
    const fromFirstModelView = isSectionRoute && !isMobile && currentProgress < INITIAL_ZOOM_DISTANCE
    const betweenSections = isSectionRoute && !isMobile &&
      currentProgress >= INITIAL_ZOOM_DISTANCE &&
      currentProgress < OVERVIEW_ZOOM_OUT_START
    const fromOverview = isSectionRoute && !isMobile &&
      currentProgress >= OVERVIEW_ZOOM_OUT_START &&
      currentProgress < WARP_APPROACH_START
    setMenuOpen(false)
    setTimeout(() => scrollToProgress(
      target,
      'smooth',
      fromFirstModelView || betweenSections || fromOverview,
      targetIndex ?? 0,
      betweenSections ? 'between-sections' : fromFirstModelView ? 'from-initial' : 'to-section',
    ), 80)
  }

  const handleStartClick = (event) => {
    setMenuOpen(false)
    handleStartWarp(event)
  }

  return (
    <>
      <main
        id="top"
        className={`model-view ${isInitialLoading ? 'model-view--initial-loading' : ''} ${isSceneVisible ? '' : 'model-view--scene-hidden'}`}
        style={{ '--scroll-height': `${(TOTAL_SCROLL_PROGRESS + 0.6) * 100}dvh` }}
      >
        <p className="visually-hidden">
          Evolut automates CI/CD deployment pipelines, secrets management, security scanning, observability, and auto-scaling for modern development teams.
        </p>

        <Navbar
          activePortal={activePortal}
          onNavigate={navigateToProgress}
          onStartClick={handleStartClick}
          onDemoClick={openDemo}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          portalTarget={navigationTarget}
        />

        <footer ref={footerRef} className="initial-watermark">
          <strong>Evolut</strong>
          <span><span className="initial-watermark__copyright-symbol">©</span> Soluciones Evolut Premium 2026</span>
          <p>Refinación de la infraestructura global</p>
          <p className="initial-watermark__right">Plataforma de infraestructura tecnológica automatizada</p>
        </footer>

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
            navigationAnimation={navigationAnimation}
            isMobile={isMobile}
            isWarpingViaButton={isWarpingViaButton}
            isInitialLoading={isInitialLoading}
            initialRevealProgress={initialRevealProgress}
            demoCameraRequest={demoCameraRequest}
            onModelReady={markModelReady}
          />
        </ErrorBoundary>

        <Loader
          modelReady={modelReady}
          initialRevealProgress={initialRevealProgress}
          onSceneReveal={revealScene}
          onReveal={revealLanding}
        />

        <div className="blackout" aria-hidden="true" />
        <div className="scroll-track" aria-hidden="true" />
      </main>

      <MobileMenu
        activePortal={activePortal}
        menuOpen={menuOpen}
        onMenuNav={handleMenuNav}
        onStartClick={handleStartClick}
        onDemoClick={openDemo}
        portalTarget={navigationTarget}
      />

      <PortalContainer
        activePortal={activePortal}
        isMobile={isMobile}
        navigationTransition={navigationTransition}
        onDemoClick={openDemo}
        isDemoOpen={isDemoOpen}
      />

      {isDemoOpen && <DemoFormModal onClose={closeDemo} />}

      <LiquidGlassOrb progress={progress} isVisible={loginVisible} />

      <DimensionalWarpOverlay isRedirecting={isRedirecting} isVisible={warpVisible} />
    </>
  )
}
