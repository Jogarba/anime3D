import { Fragment } from 'react'
import PortalPanel from './PortalPanel'
import { landingSections } from '../../landingContent'
import {
  INITIAL_ZOOM_DISTANCE,
  SECTION_CYCLE,
  SECTION_HOLD_DISTANCE,
  SECTION_TRANSITION_DISTANCE,
  ZOOM_OUT_START,
  OVERVIEW_ZOOM_OUT_END,
  OVERVIEW_HOLD_END,
  WARP_APPROACH_START,
  WARP_APPROACH_END,
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
  TOTAL_SCROLL_PROGRESS,
} from '../../sceneSequence'

export default function PortalContainer({ activePortal, isMobile }) {
  return (
    <div className="portal-content" aria-live="polite">
      {/* Initial Hero Spacer */}
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${INITIAL_ZOOM_DISTANCE * 100}svh` }}
        data-p-from="0"
        data-p-to={String(INITIAL_ZOOM_DISTANCE)}
      />

      {landingSections.map((section, index) => {
        const active = activePortal === index
        const sectionProgress =
          INITIAL_ZOOM_DISTANCE + index * SECTION_CYCLE + SECTION_HOLD_DISTANCE

        return (
          <Fragment key={section.id}>
            <PortalPanel
              section={section}
              active={active}
              isMobile={isMobile}
              sectionProgress={sectionProgress}
            />

            {/* Mobile-only: short gap where the 3D model rotates to the next section */}
            <div
              className="tl-spacer"
              aria-hidden="true"
              style={{ height: `${SECTION_TRANSITION_DISTANCE * 100}svh` }}
              data-p-from={String(sectionProgress)}
              data-p-to={String(sectionProgress + SECTION_TRANSITION_DISTANCE)}
            />
          </Fragment>
        )
      })}

      {/* Phase 1: Overview zoom-out & hold spacers (Camera pulls back to full 3D model overview) */}
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(OVERVIEW_ZOOM_OUT_END - ZOOM_OUT_START) * 100}svh` }}
        data-p-from={String(ZOOM_OUT_START)}
        data-p-to={String(OVERVIEW_ZOOM_OUT_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(OVERVIEW_HOLD_END - OVERVIEW_ZOOM_OUT_END) * 100}svh` }}
        data-p-from={String(OVERVIEW_ZOOM_OUT_END)}
        data-p-to={String(OVERVIEW_HOLD_END)}
      />

      {/* Phase 2: Dramatic camera plunge into model aperture & hyperspace traversal */}
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(WARP_APPROACH_END - WARP_APPROACH_START) * 100}svh` }}
        data-p-from={String(WARP_APPROACH_START)}
        data-p-to={String(WARP_APPROACH_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: `${(WARP_TRAVERSE_END - WARP_TRAVERSE_START) * 100}svh` }}
        data-p-from={String(WARP_TRAVERSE_START)}
        data-p-to={String(WARP_TRAVERSE_END)}
      />
      <div
        className="tl-spacer"
        aria-hidden="true"
        style={{ height: '70svh' }}
        data-p-from={String(TOTAL_SCROLL_PROGRESS)}
        data-p-to={String(TOTAL_SCROLL_PROGRESS)}
      />
    </div>
  )
}
