import { useEffect, useRef, useState, useCallback } from 'react'
import { clamp01, easeInOut } from '../utils/math'
import {
  getScrollRange,
  buildMobileRegions,
  progressFromRegions,
  scrollYFromRegions,
} from '../utils/mobileRegions'
import {
  SECTION_COUNT,
  INITIAL_ZOOM_DISTANCE,
  SECTION_HOLD_DISTANCE,
  SECTION_TRANSITION_DISTANCE,
  SECTION_CYCLE,
  TOTAL_SCROLL_PROGRESS,
  ZOOM_OUT_START,
  WARP_APPROACH_START,
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
  WARP_EXIT_TRAVEL,
  WARP_TRIGGER_PROGRESS,
} from '../sceneSequence'
import { EXTERNAL_LINKS } from '../constants/navigation'

const WARP_SESSION_KEY = 'evolut_warp_redirected'
const REDIRECT_TRANSITION_MS = 180

function getWarpRedirected() {
  try {
    return window.sessionStorage.getItem(WARP_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function setWarpRedirected(value) {
  try {
    if (value) window.sessionStorage.setItem(WARP_SESSION_KEY, '1')
    else window.sessionStorage.removeItem(WARP_SESSION_KEY)
  } catch {
    // The transition still works if session storage is unavailable.
  }
}

export function portalAtProgress(progress) {
  // During hero banner (progress 0 to 0.15), hide section text
  if (progress < 0.15) {
    return { index: -1, opacity: 0 }
  }

  // During first zoom (0.15 to INITIAL_ZOOM_DISTANCE):
  // Section 0 fades in as camera arrives at the first hexagon
  if (progress < INITIAL_ZOOM_DISTANCE) {
    const zoomProgress = (progress - 0.15) / (INITIAL_ZOOM_DISTANCE - 0.15)
    return {
      index: 0,
      opacity: clamp01(easeInOut(zoomProgress)),
    }
  }

  // Once zoomed in: 6 sections (0 to 5)
  const offset = progress - INITIAL_ZOOM_DISTANCE
  const rawCycle = offset / SECTION_CYCLE
  const sectionIndex = Math.min(SECTION_COUNT - 1, Math.floor(rawCycle))
  const inCycle = offset - sectionIndex * SECTION_CYCLE

  // Past the end of section cycle (zoom out / login / footer area): completely hidden
  if (progress >= ZOOM_OUT_START) {
    return { index: -1, opacity: 0 }
  }

  // Last section (Section 06 Business Case)
  if (sectionIndex >= SECTION_COUNT - 1) {
    if (inCycle <= SECTION_HOLD_DISTANCE) {
      return { index: SECTION_COUNT - 1, opacity: 1 }
    }
    const exitT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
    if (exitT >= 1) {
      return { index: -1, opacity: 0 }
    }
    return {
      index: SECTION_COUNT - 1,
      opacity: clamp01(1 - easeInOut(exitT)),
    }
  }

  // Section hold period: Hexagon is centered and section is 100% visible!
  if (inCycle <= SECTION_HOLD_DISTANCE) {
    return {
      index: sectionIndex,
      opacity: 1,
    }
  }

  // Transition period between hexagons: smooth crossfade
  const transT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
  if (transT < 0.5) {
    return {
      index: sectionIndex,
      opacity: clamp01(1 - easeInOut(transT * 2)),
    }
  } else {
    return {
      index: sectionIndex + 1,
      opacity: clamp01(easeInOut((transT - 0.5) * 2)),
    }
  }
}

export function useScrollChoreography(isMobileRef) {
  const progress = useRef(0)
  const activePortalRef = useRef(-1)
  const heroVisibleRef = useRef(true)
  const loginVisibleRef = useRef(false)
  const warpVisibleRef = useRef(false)
  const [activePortal, setActivePortal] = useState(-1)
  const [heroVisible, setHeroVisible] = useState(true)
  const [loginVisible, setLoginVisible] = useState(false)
  const [warpVisible, setWarpVisible] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isWarpingViaButton, setIsWarpingViaButton] = useState(false)
  const isRedirectingRef = useRef(false)
  const isWarpingViaButtonRef = useRef(false)
  const redirectTriggeredRef = useRef(false)
  const redirectTimerRef = useRef(null)
  const mobileRegionsRef = useRef(null)
  const warpFrameRef = useRef(0)

  const updateWarpVisibility = useCallback((visible) => {
    if (warpVisibleRef.current === visible) return
    warpVisibleRef.current = visible
    setWarpVisible(visible)
  }, [])

  // Keep the camera moving through the exit shutter during the short redirect
  // transition instead of stopping at the last scroll position.
  const beginRedirect = useCallback(() => {
    if (isRedirectingRef.current) return
    isRedirectingRef.current = true
    redirectTriggeredRef.current = true
    setIsRedirecting(true)
    setWarpRedirected(true)

    const startProgress = Math.max(progress.current, WARP_TRIGGER_PROGRESS)
    const startedAt = performance.now()
    const advanceThroughExit = (now) => {
      const t = clamp01((now - startedAt) / REDIRECT_TRANSITION_MS)
      // Constant progress keeps the camera moving without easing into a pause.
      progress.current = startProgress + WARP_EXIT_TRAVEL * t

      if (t < 1) {
        warpFrameRef.current = requestAnimationFrame(advanceThroughExit)
      } else {
        window.location.href = EXTERNAL_LINKS.LOGIN
      }
    }

    warpFrameRef.current = requestAnimationFrame(advanceThroughExit)
  }, [])

  // Reset to initial hero view on browser back button / history popstate
  const resetToHomeHero = useCallback(() => {
    progress.current = 0
    redirectTriggeredRef.current = false
    isWarpingViaButtonRef.current = false
    isRedirectingRef.current = false
    if (warpFrameRef.current) {
      cancelAnimationFrame(warpFrameRef.current)
      warpFrameRef.current = 0
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      window.scrollTo(0, 0)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    setIsRedirecting(false)
    setIsWarpingViaButton(false)
    updateWarpVisibility(false)
    setLoginVisible(false)
    loginVisibleRef.current = false
    setHeroVisible(true)
    heroVisibleRef.current = true
    setActivePortal(-1)
    activePortalRef.current = -1
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = null
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.dataset.cameraCrossedCore = 'false'
      root.style.setProperty('--hero-opacity', '1')
      root.style.setProperty('--portal-content-opacity', '0')
      root.style.setProperty('--blackout-opacity', '0')
      root.style.setProperty('--warp-opacity', '0')
      root.style.setProperty('--login-opacity', '0')
      root.style.setProperty('--scroll-percent', '0%')
    }
    setWarpRedirected(false)
  }, [updateWarpVisibility])

  // Page lifecycle and interaction listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const onPageShow = (event) => {
      const cameFromWarp = getWarpRedirected()
      if (event.persisted || cameFromWarp) {
        resetToHomeHero()
      }
    }

    const onPopState = () => {
      resetToHomeHero()
    }

    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('popstate', onPopState)
    }
  }, [resetToHomeHero])

  // Track mobile regions
  useEffect(() => {
    let ro = null

    const rebuild = () => {
      const container = document.querySelector('.portal-content')
      mobileRegionsRef.current = buildMobileRegions(container)
    }

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => rebuild())
    }
    const container = document.querySelector('.portal-content')
    if (ro && container) ro.observe(container)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rebuild)
    }

    window.addEventListener('resize', rebuild)
    rebuild()

    return () => {
      window.removeEventListener('resize', rebuild)
      if (ro) ro.disconnect()
    }
  }, [])

  // Smooth scroll helper
  const scrollToProgress = useCallback((target, behavior = 'smooth') => {
    let top
    const regions = mobileRegionsRef.current
    if (isMobileRef.current && regions && regions.length) {
      top = scrollYFromRegions(target, regions)
    } else {
      const max = getScrollRange()
      top = max > 0 ? (target / TOTAL_SCROLL_PROGRESS) * max : 0
    }
    window.scrollTo({ top, behavior })
  }, [isMobileRef])

  // Scroll loop and choreography execution (stable mount, no teardown on redirect)
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--blackout-opacity', '0')
    root.style.setProperty('--warp-opacity', '0')
    root.style.setProperty('--login-opacity', '0')
    root.style.setProperty('--scroll-percent', '0%')
    root.dataset.cameraCrossedCore = 'false'

    let raw = 0
    let frame = 0
    let last = 0

    const apply = () => {
      if (isRedirectingRef.current) return

      const currentProgress = Math.min(progress.current, TOTAL_SCROLL_PROGRESS)

      if (isMobileRef.current) {
        root.style.setProperty('--portal-content-opacity', '1')
      } else {
        const active = portalAtProgress(currentProgress)
        if (activePortalRef.current !== active.index) {
          activePortalRef.current = active.index
          setActivePortal(active.index)
        }
        root.style.setProperty(
          '--portal-content-opacity',
          String(active.opacity),
        )
      }

      root.dataset.navScrolled = window.scrollY > 24 ? '1' : '0'
      const scrollPercent = Math.min(100, (progress.current / TOTAL_SCROLL_PROGRESS) * 100)
      root.style.setProperty('--scroll-percent', `${scrollPercent}%`)

      const heroOpacity = clamp01(1 - progress.current / 0.22)
      root.style.setProperty('--hero-opacity', String(heroOpacity))
      const isHeroVisible = heroOpacity > 0.01
      if (isHeroVisible !== heroVisibleRef.current) {
        heroVisibleRef.current = isHeroVisible
        setHeroVisible(isHeroVisible)
      }

      // Keep tunnel effects hidden until the camera has crossed the model core.
      let curWarpOpacity = 0
      const cameraCrossedCore = root.dataset.cameraCrossedCore === 'true'
      if (progress.current >= WARP_TRAVERSE_START && cameraCrossedCore) {
        curWarpOpacity = clamp01(
          (progress.current - WARP_TRAVERSE_START) /
          (WARP_TRAVERSE_END - WARP_TRAVERSE_START),
        ) * 0.75
      }
      root.style.setProperty('--warp-opacity', String(curWarpOpacity))
      updateWarpVisibility(curWarpOpacity > 0.02)

      // Breakthrough trigger: once the camera traverses through the 3D model core into portal
      if (progress.current >= WARP_TRIGGER_PROGRESS) {
        if (!redirectTriggeredRef.current) {
          redirectTriggeredRef.current = true
          beginRedirect()

          // Permanently lock hero and portal content out
          root.style.setProperty('--hero-opacity', '0')
          root.style.setProperty('--portal-content-opacity', '0')
          setHeroVisible(false)
          heroVisibleRef.current = false

        }
      } else if (progress.current < WARP_TRAVERSE_START) {
        if (!isRedirectingRef.current && redirectTriggeredRef.current) {
          redirectTriggeredRef.current = false
          setIsRedirecting(false)
          setWarpRedirected(false)
          if (redirectTimerRef.current) {
            clearTimeout(redirectTimerRef.current)
            redirectTimerRef.current = null
          }
        }
      }

      // Avatar orb opacity
      let curLoginOpacity = 0
      if (progress.current >= WARP_TRAVERSE_START && cameraCrossedCore) {
        curLoginOpacity = clamp01(
          easeInOut(
            (progress.current - WARP_TRAVERSE_START) /
            (WARP_TRAVERSE_END - WARP_TRAVERSE_START),
          ),
        )
      }
      root.style.setProperty('--login-opacity', String(curLoginOpacity))
      const isLoginVis = curLoginOpacity > 0.01
      if (isLoginVis !== loginVisibleRef.current) {
        loginVisibleRef.current = isLoginVis
        setLoginVisible(isLoginVis)
      }
    }

    const loop = (now) => {
      if (isWarpingViaButtonRef.current || isRedirectingRef.current || redirectTriggeredRef.current) {
        frame = 0
        return
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const speed = isMobileRef.current ? 12 : 7
      const k = 1 - Math.exp(-speed * dt)
      progress.current += (raw - progress.current) * k
      if (Math.abs(raw - progress.current) > 0.0005) {
        apply()
        frame = requestAnimationFrame(loop)
      } else {
        progress.current = raw
        apply()
        frame = 0
      }
    }

    const onScroll = () => {
      if (isRedirectingRef.current || redirectTriggeredRef.current) return
      const regions = mobileRegionsRef.current
      if (isMobileRef.current && regions && regions.length) {
        raw = progressFromRegions(window.scrollY, regions)
      } else {
        const max = getScrollRange()
        const scrollRatio = max > 0 ? clamp01(window.scrollY / max) : 0
        raw = scrollRatio >= 0.995 ? TOTAL_SCROLL_PROGRESS : scrollRatio * TOTAL_SCROLL_PROGRESS
      }
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }

    onScroll()
    progress.current = raw
    apply()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty('--blackout-opacity')
      root.style.removeProperty('--portal-content-opacity')
      root.style.removeProperty('--hero-opacity')
      root.style.removeProperty('--warp-opacity')
      root.style.removeProperty('--login-opacity')
      root.style.removeProperty('--scroll-percent')
    }
  }, [beginRedirect, isMobileRef, updateWarpVisibility])

  useEffect(() => {
    return () => {
      if (warpFrameRef.current) cancelAnimationFrame(warpFrameRef.current)
    }
  }, [])

  // Handle Start Button click (cinematic warp flythrough)
  const handleStartWarp = useCallback((event) => {
    if (event) event.preventDefault()
    isWarpingViaButtonRef.current = true
    setIsWarpingViaButton(true)

    const root = document.documentElement
    root.style.setProperty('--portal-content-opacity', '0')
    root.style.setProperty('--hero-opacity', '0')
    setHeroVisible(false)
    setActivePortal(-1)

    progress.current = WARP_APPROACH_START
    const startP = WARP_APPROACH_START
    const targetP = TOTAL_SCROLL_PROGRESS

    setWarpRedirected(true)
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    if (warpFrameRef.current) cancelAnimationFrame(warpFrameRef.current)

    const animDuration = 2400 // ms
    const animStart = performance.now()

    const stepWarp = (now) => {
      const elapsed = now - animStart
      const t = clamp01(elapsed / animDuration)

      const ease =
        t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2

      progress.current = startP + (targetP - startP) * ease

      const tunnelProgress = clamp01(
        (progress.current - WARP_TRAVERSE_START) /
        (WARP_TRAVERSE_END - WARP_TRAVERSE_START),
      )
      const cameraCrossedCore = document.documentElement.dataset.cameraCrossedCore === 'true'
      const tunnelWarpOpacity = cameraCrossedCore ? tunnelProgress * 0.75 : 0
      document.documentElement.style.setProperty('--warp-opacity', String(tunnelWarpOpacity))
      updateWarpVisibility(tunnelWarpOpacity > 0.02)

      const curLoginOpacity = cameraCrossedCore ? tunnelProgress : 0
      document.documentElement.style.setProperty('--login-opacity', String(curLoginOpacity))
      const nextLoginVisible = curLoginOpacity > 0.01
      if (loginVisibleRef.current !== nextLoginVisible) {
        loginVisibleRef.current = nextLoginVisible
        setLoginVisible(nextLoginVisible)
      }

      const scrollPercent = Math.min(100, (progress.current / TOTAL_SCROLL_PROGRESS) * 100)
      document.documentElement.style.setProperty('--scroll-percent', `${scrollPercent}%`)

      if (t < 1) {
        warpFrameRef.current = requestAnimationFrame(stepWarp)
      } else {
        progress.current = targetP
        beginRedirect()
      }
    }

    warpFrameRef.current = requestAnimationFrame(stepWarp)
  }, [beginRedirect, updateWarpVisibility])

  return {
    progress,
    activePortal,
    heroVisible,
    loginVisible,
    warpVisible,
    isRedirecting,
    isWarpingViaButton,
    scrollToProgress,
    handleStartWarp,
  }
}
