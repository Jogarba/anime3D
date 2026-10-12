import { useEffect } from 'react'
import { animate } from 'animejs'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { landingSections } from '../landingContent'
import {
  INITIAL_ZOOM_DISTANCE,
  SECTION_CYCLE,
  SECTION_HOLD_DISTANCE,
} from '../sceneSequence'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = (value) => Math.min(1, Math.max(0, value))

function getEntranceTargets(panel) {
  const inner = panel.querySelector('.portal-panel__inner')
  if (!inner) return []

  const staggeredContainers = [
    '.portal-environments',
    '.portal-telemetry',
    '.portal-stats',
    '.portal-details',
    '.pipeline-flow',
    '.portal-facts',
    '.portal-cta-group',
  ].join(', ')
  const expandWidget = (element) => element.matches(staggeredContainers)
    ? Array.from(element.children)
    : [element]

  // Reveal blocks in their actual reading order. Business case columns are
  // flattened so the right-hand table follows the left-hand copy.
  const targets = inner.classList.contains('portal-panel__inner--hero')
    ? Array.from(inner.querySelector('.hero-container')?.children ?? [])
    : Array.from(inner.children).flatMap((child) => {
        if (child.matches('.portal-panel__left, .portal-panel__right')) {
          return Array.from(child.children).flatMap(expandWidget)
        }
        return expandWidget(child)
      })

  return targets
}

function addScrubbedEntrance(timeline, panel, targets) {
  if (!targets.length) return

  timeline.fromTo(
    targets,
    { autoAlpha: 0, y: 34, scale: 0.98 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.38,
      stagger: 0.07,
      ease: 'power3.out',
    },
    0,
  )
}

export function usePortalAnimation(progress, isMobile, navigationAnimation) {
  // Keep the ambient background pulse independent from scroll-scrubbed content.
  useEffect(() => {
    const ambientAnimation = animate('.ambient-glow-orb', {
      scale: [1, 1.25, 1],
      opacity: [0.35, 0.6, 0.35],
      duration: 7000,
      loop: true,
      ease: 'inOutSine',
    })

    return () => ambientAnimation.pause()
  }, [])

  useEffect(() => {
    const root = document.querySelector('.portal-content')
    if (!root) return undefined

    const timelines = []
    const context = gsap.context(() => {
      const portalEntries = [
        { id: 'landing-hero', portalIndex: 0 },
        ...landingSections.map((section, index) => ({
          id: section.id,
          portalIndex: index + 1,
        })),
      ]

      portalEntries.forEach(({ id, portalIndex }) => {
        const panel = root.querySelector(`#${id}`)
        if (!panel) return

        const timeline = gsap.timeline({
          paused: !isMobile,
          ...(isMobile
            ? {
                scrollTrigger: {
                  trigger: panel,
                  start: 'top 72%',
                  end: 'bottom 30%',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            : {}),
        })
        const targets = getEntranceTargets(panel)
        addScrubbedEntrance(timeline, panel, targets)

        const sectionStart = INITIAL_ZOOM_DISTANCE + portalIndex * SECTION_CYCLE
        const revealStart = portalIndex === 0
          ? INITIAL_ZOOM_DISTANCE - 0.38
          : sectionStart + 0.02
        const revealEnd = sectionStart + SECTION_HOLD_DISTANCE * 0.94
        timelines.push({
          timeline,
          panel,
          targets,
          portalIndex,
          revealStart,
          revealEnd,
          readingMode: false,
        })
      })
    }, root)

    let preparedNavigationId = null
    const syncTimelinesToScroll = () => {
      if (isMobile) return
      const navigation = navigationAnimation?.current
      if (navigation?.active) {
        return
      }
      if (navigation?.phase === 'entering') {
        if (preparedNavigationId !== navigation.id) {
          preparedNavigationId = navigation.id
          const destination = timelines.find(({ portalIndex }) => portalIndex === navigation.targetIndex)
          if (destination) {
            // Put GSAP at the exact destination state before the route class
            // fades in. Releasing CSS animation then cannot reveal a stale
            // scroll-scrub frame underneath it.
            const destinationProgress = clamp01(
              ((progress?.current ?? 0) - destination.revealStart) /
              (destination.revealEnd - destination.revealStart),
            )
            destination.timeline.pause().progress(destinationProgress)
            if (destinationProgress >= 1) {
              gsap.set(destination.targets, { clearProps: 'opacity,visibility' })
              destination.readingMode = true
            } else {
              destination.readingMode = false
            }
          }
        }
        return
      }
      preparedNavigationId = null
      const currentProgress = progress?.current ?? 0
      timelines.forEach((entry) => {
        const localProgress = clamp01(
          (currentProgress - entry.revealStart) /
          (entry.revealEnd - entry.revealStart),
        )
        if (localProgress >= 1) {
          if (!entry.readingMode) {
            entry.timeline.progress(1)
            gsap.set(entry.targets, { clearProps: 'opacity,visibility' })
            entry.readingMode = true
          }
          return
        }

        entry.readingMode = false
        entry.timeline.progress(localProgress)
      })
    }

    if (!isMobile) {
      gsap.ticker.add(syncTimelinesToScroll)
      syncTimelinesToScroll()
    } else {
      ScrollTrigger.refresh()
    }

    return () => {
      gsap.ticker.remove(syncTimelinesToScroll)
      context.revert()
    }
  }, [progress, isMobile, navigationAnimation])

  // Add a local light response to content and a subtle magnetic pull to controls.
  useEffect(() => {
    const portal = document.querySelector('.portal-content')
    const interactiveSelector = [
      '.site-nav a',
      '.site-nav button',
      '.mobile-menu__btn',
      '.portal-panel a',
      '.portal-panel button',
    ].join(',')
    const cardSelector = [
      '.liquid-glass-card',
      '.hero-stat-item',
      '.hero-metric-pod',
      '.terminal-preview',
      '.comparison-table-wrap',
      '.portal-stats > div',
      '.portal-details > div',
      '.telemetry-card',
      '.env-card',
      '.portal-facts li',
      '.pipeline-flow li',
    ].join(',')
    const activeCards = new Set()

    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse') return
      const control = event.target.closest?.(interactiveSelector)
      if (control) {
        const bounds = control.getBoundingClientRect()
        const offsetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width / 2, 1)))
        const offsetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height / 2, 1)))
        control.style.setProperty('--magnet-x', `${offsetX * 9}px`)
        control.style.setProperty('--magnet-y', `${offsetY * 7}px`)
        control.style.setProperty('--control-pointer-x', `${event.clientX - bounds.left}px`)
        control.style.setProperty('--control-pointer-y', `${event.clientY - bounds.top}px`)
        control.style.setProperty('--control-glow', '1')
      }

      const card = event.target.closest?.(cardSelector)
      activeCards.forEach((activeCard) => {
        if (activeCard !== card) {
          activeCard.style.setProperty('--pointer-glow', '0')
          activeCards.delete(activeCard)
        }
      })
      if (card) {
        const bounds = card.getBoundingClientRect()
        const offsetX = (event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width / 2, 1)
        const offsetY = (event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height / 2, 1)
        card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
        card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
        card.style.setProperty('--pointer-glow', '1')
        activeCards.add(card)
      }
    }

    const onPointerOut = (event) => {
      const control = event.target.closest?.(interactiveSelector)
      if (control && !control.contains(event.relatedTarget)) {
        control.style.setProperty('--magnet-x', '0px')
        control.style.setProperty('--magnet-y', '0px')
        control.style.setProperty('--control-glow', '0')
      }
      const card = event.target.closest?.(cardSelector)
      if (card && !card.contains(event.relatedTarget)) {
        card.style.setProperty('--pointer-glow', '0')
        activeCards.delete(card)
      }
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      activeCards.forEach((card) => card.style.removeProperty('--pointer-glow'))
      document.querySelectorAll(interactiveSelector).forEach((control) => {
        control.style.removeProperty('--magnet-x')
        control.style.removeProperty('--magnet-y')
        control.style.removeProperty('--control-pointer-x')
        control.style.removeProperty('--control-pointer-y')
        control.style.removeProperty('--control-glow')
      })
      portal?.querySelectorAll(cardSelector).forEach((card) => {
        card.style.removeProperty('--pointer-x')
        card.style.removeProperty('--pointer-y')
        card.style.removeProperty('--pointer-glow')
      })
    }
  }, [])
}
