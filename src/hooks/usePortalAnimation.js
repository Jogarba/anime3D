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

function addScrubbedEntrance(timeline, panel) {
  const inner = panel.querySelector('.portal-panel__inner')
  if (!inner) return

  // Reveal blocks in their actual reading order. Business case columns are
  // flattened so the right-hand table follows the left-hand copy.
  const targets = Array.from(inner.children).flatMap((child) => {
    if (child.matches('.portal-panel__left, .portal-panel__right')) {
      return Array.from(child.children)
    }
    return [child]
  })

  if (!targets.length) return

  timeline.fromTo(
    targets,
    { autoAlpha: 0, y: 34, scale: 0.98 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.22,
      stagger: 0.07,
      ease: 'none',
    },
    0,
  )
}

export function usePortalAnimation(progress, isMobile) {
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
      landingSections.forEach((section, index) => {
        const panel = root.querySelector(`#${section.id}`)
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
        addScrubbedEntrance(timeline, panel)

        const sectionStart = INITIAL_ZOOM_DISTANCE + index * SECTION_CYCLE
        const revealStart = index === 0
          ? INITIAL_ZOOM_DISTANCE - 0.38
          : sectionStart + 0.02
        const revealEnd = sectionStart + SECTION_HOLD_DISTANCE * 0.94
        timelines.push({ timeline, revealStart, revealEnd })
      })
    }, root)

    const syncTimelinesToScroll = () => {
      if (isMobile) return
      const currentProgress = progress?.current ?? 0
      timelines.forEach(({ timeline, revealStart, revealEnd }) => {
        const localProgress = clamp01(
          (currentProgress - revealStart) / (revealEnd - revealStart),
        )
        timeline.progress(localProgress)
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
  }, [progress, isMobile])

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
        const offsetX = (event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width / 2, 1)
        const offsetY = (event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height / 2, 1)
        control.style.setProperty('--magnet-x', `${offsetX * 5}px`)
        control.style.setProperty('--magnet-y', `${offsetY * 4}px`)
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
      })
      portal?.querySelectorAll(cardSelector).forEach((card) => {
        card.style.removeProperty('--pointer-x')
        card.style.removeProperty('--pointer-y')
        card.style.removeProperty('--pointer-glow')
      })
    }
  }, [])
}
