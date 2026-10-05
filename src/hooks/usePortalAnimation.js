import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { landingSections } from '../landingContent'

export function usePortalAnimation(activePortal, isMobile) {
  // Ambient background animation on mount
  useEffect(() => {
    // Continuous ambient glow pulse
    animate('.ambient-glow-orb', {
      scale: [1, 1.25, 1],
      opacity: [0.35, 0.6, 0.35],
      duration: 7000,
      loop: true,
      ease: 'inOutSine',
    })
  }, [])

  // Section crossfade entrance animation on PC
  const prevPortalIndexRef = useRef(-1)
  useEffect(() => {
    if (isMobile) return

    const prev = prevPortalIndexRef.current
    const current = activePortal
    prevPortalIndexRef.current = current

    const direction = current >= prev ? 1 : -1

    if (current >= 0 && current < landingSections.length) {
      const currSection = landingSections[current]
      const currEl = document.getElementById(currSection?.id)
      if (currEl) {
        const eyebrow = currEl.querySelector('.portal-panel__eyebrow')
        const title = currEl.querySelector('h2')
        const desc = currEl.querySelector('.portal-panel__description')
        const widgets = currEl.querySelectorAll(
          '.terminal-preview, .comparison-table-wrap'
        )
        const cards = currEl.querySelectorAll(
          '.portal-stats > div, .portal-details > div, .telemetry-card, .env-card, .portal-cta-group, .portal-cost-note'
        )
        const pills = currEl.querySelectorAll(
          '.pipeline-flow li, .portal-facts li'
        )
        const telemetryBars = currEl.querySelectorAll('.telemetry-card__bar-fill')
        const tableRows = currEl.querySelectorAll('.comparison-table tbody tr')

        if (eyebrow) {
          animate(eyebrow, {
            opacity: [0, 1],
            translateY: [direction * 18, 0],
            scale: [0.92, 1],
            duration: 500,
            ease: 'outBack',
          })
        }

        if (title) {
          animate(title, {
            opacity: [0, 1],
            translateY: [direction * 28, 0],
            duration: 650,
            delay: 50,
            ease: 'outExpo',
          })
        }

        if (desc) {
          animate(desc, {
            opacity: [0, 1],
            translateY: [direction * 20, 0],
            duration: 600,
            delay: 100,
            ease: 'outCubic',
          })
        }

        if (widgets.length > 0) {
          animate(widgets, {
            opacity: [0, 1],
            translateY: [direction * 24, 0],
            scale: [0.98, 1],
            duration: 700,
            delay: 150,
            ease: 'outExpo',
          })
        }

        if (cards.length > 0) {
          animate(cards, {
            opacity: [0, 1],
            translateY: [direction * 22, 0],
            scale: [0.95, 1],
            duration: 600,
            delay: stagger(55, { start: 180 }),
            ease: 'outExpo',
          })
        }

        if (pills.length > 0) {
          animate(pills, {
            opacity: [0, 1],
            translateY: [direction * 14, 0],
            scale: [0.92, 1],
            duration: 450,
            delay: stagger(40, { start: 220 }),
            ease: 'outBack',
          })
        }

        if (telemetryBars.length > 0) {
          animate(telemetryBars, {
            width: (el) => [0, el.getAttribute('data-fill') || '75%'],
            duration: 800,
            delay: stagger(70, { start: 220 }),
            ease: 'outQuart',
          })
        }

        if (tableRows.length > 0) {
          animate(tableRows, {
            opacity: [0, 1],
            translateX: [-14, 0],
            duration: 450,
            delay: stagger(50, { start: 160 }),
            ease: 'outQuad',
          })
        }
      }
    }
  }, [activePortal, isMobile])
}
