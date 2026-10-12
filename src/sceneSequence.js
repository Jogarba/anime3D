export const SECTION_COUNT = 6
export const INITIAL_ZOOM_DISTANCE = 1.2
export const SECTION_HOLD_DISTANCE = 0.9
export const SECTION_TRANSITION_DISTANCE = 0.45
export const SECTION_CYCLE = SECTION_HOLD_DISTANCE + SECTION_TRANSITION_DISTANCE
export const SECTION_CONTENT_GAP = 0.06

// End of the last section's full visibility window.
export const SECTIONS_END =
  INITIAL_ZOOM_DISTANCE + (SECTION_COUNT - 1) * SECTION_CYCLE + SECTION_HOLD_DISTANCE

// Final section transition completes here.
export const SECTIONS_EXIT_END = SECTIONS_END + SECTION_TRANSITION_DISTANCE

// Phase 1: Camera pulls back smoothly to full 3D model overview (identical to Hero start)
export const OVERVIEW_ZOOM_OUT_START = SECTIONS_EXIT_END
export const OVERVIEW_ZOOM_OUT_END = OVERVIEW_ZOOM_OUT_START + 0.85 // Pull back briskly to show the full model before the final dive
export const OVERVIEW_HOLD_END = OVERVIEW_ZOOM_OUT_END + 0.25 // Brief overview, then immediately begin the tunnel approach

// Phase 2: Dramatic camera plunge from full distance (homeZ) straight into the 3D model center aperture & hyperspace
export const WARP_APPROACH_START = OVERVIEW_HOLD_END
export const WARP_APPROACH_END = WARP_APPROACH_START + 1.6
export const WARP_TRAVERSE_START = WARP_APPROACH_END
export const WARP_TRAVERSE_END = WARP_TRAVERSE_START + 1.8
export const WARP_EXIT_TRAVEL = 0.75 // Final continuous camera movement through the shutter before redirect
export const WARP_TRIGGER_PROGRESS = WARP_TRAVERSE_END - 0.02 // Catch the final scroll position reliably

// Legacy aliases for compatibility
export const LOGIN_ZOOM_START = WARP_APPROACH_START
export const LOGIN_ZOOM_END = WARP_APPROACH_END
export const LOGIN_HOLD_DISTANCE = 1.8
export const LOGIN_END = WARP_TRAVERSE_END
export const ZOOM_OUT_START = OVERVIEW_ZOOM_OUT_START

// Total progress
export const TOTAL_SCROLL_PROGRESS = WARP_TRAVERSE_END

export function getPortalSectionStart(index) {
  const sectionIndex = Math.max(0, Math.min(SECTION_COUNT - 1, index))
  return INITIAL_ZOOM_DISTANCE + sectionIndex * SECTION_CYCLE
}

export function getPortalTarget(index) {
  return getPortalSectionStart(index) + SECTION_HOLD_DISTANCE - SECTION_CONTENT_GAP
}

export function getLoginTarget() {
  return WARP_TRAVERSE_START
}
