export const SECTION_COUNT = 6
export const INITIAL_ZOOM_DISTANCE = 1.2
export const SECTION_HOLD_DISTANCE = 1.3
export const SECTION_TRANSITION_DISTANCE = 0.7
export const SECTION_CYCLE = SECTION_HOLD_DISTANCE + SECTION_TRANSITION_DISTANCE

// End of the 6 hexagon sections hold period (1.2 + 5 * 2.0 + 1.3 = 12.5)
export const SECTIONS_END =
  INITIAL_ZOOM_DISTANCE + (SECTION_COUNT - 1) * SECTION_CYCLE + SECTION_HOLD_DISTANCE

// Section 6 finishes its exit fade-out at SECTIONS_EXIT_END (12.5 + 0.7 = 13.2)
export const SECTIONS_EXIT_END = SECTIONS_END + SECTION_TRANSITION_DISTANCE

// Phase 1: Camera pulls back smoothly to full 3D model overview (identical to Hero start)
export const OVERVIEW_ZOOM_OUT_START = SECTIONS_EXIT_END // 13.2
export const OVERVIEW_ZOOM_OUT_END = OVERVIEW_ZOOM_OUT_START + 0.85 // Pull back briskly to show the full model before the final dive
export const OVERVIEW_HOLD_END = OVERVIEW_ZOOM_OUT_END + 0.25 // Brief overview, then immediately begin the tunnel approach

// Phase 2: Dramatic camera plunge from full distance (homeZ) straight into the 3D model center aperture & hyperspace
export const WARP_APPROACH_START = OVERVIEW_HOLD_END // 15.8 (Camera begins plunge from 6.0 down into center core)
export const WARP_APPROACH_END = WARP_APPROACH_START + 1.6 // 17.4 (Camera reaches the model core)
export const WARP_TRAVERSE_START = WARP_APPROACH_END // 17.4 (Camera shoots through core into wormhole tunnel)
export const WARP_TRAVERSE_END = WARP_TRAVERSE_START + 1.8 // 19.2 (Singularity breakthrough)
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

export function getPortalTarget(index) {
  if (index <= 0) return INITIAL_ZOOM_DISTANCE
  return INITIAL_ZOOM_DISTANCE + Math.min(SECTION_COUNT - 1, index) * SECTION_CYCLE
}

export function getLoginTarget() {
  return WARP_TRAVERSE_START
}
