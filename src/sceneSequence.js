export const FIRST_PORTAL = { x: 0, y: 1.35 }

export const PORTALS = [
  { x: 1.21, y: 0.72 },
  { x: 1.21, y: -0.67 },
  { x: 0, y: -1.32 },
  { x: -1.2, y: -0.67 },
  { x: -1.2, y: 0.72 },
]

export const SECTION_COUNT = 6
export const INITIAL_ZOOM_DISTANCE = 1.2
export const SECTION_HOLD_DISTANCE = 1.3
export const SECTION_TRANSITION_DISTANCE = 0.7
export const SECTION_CYCLE = SECTION_HOLD_DISTANCE + SECTION_TRANSITION_DISTANCE

// End of the 6 hexagon sections hold period
export const SECTIONS_END =
  INITIAL_ZOOM_DISTANCE + (SECTION_COUNT - 1) * SECTION_CYCLE + SECTION_HOLD_DISTANCE

// Section 6 finishes its exit fade-out at SECTIONS_EXIT_END:
export const SECTIONS_EXIT_END = SECTIONS_END + SECTION_TRANSITION_DISTANCE

// Phase 1: Camera pulls back to full model overview (as at the start)
export const OVERVIEW_ZOOM_OUT_START = SECTIONS_EXIT_END // 13.2
export const OVERVIEW_ZOOM_OUT_END = OVERVIEW_ZOOM_OUT_START + 1.4 // 14.6
export const OVERVIEW_HOLD_END = OVERVIEW_ZOOM_OUT_END + 0.8 // 15.4

// Phase 2: Camera zooms into the center of the 3D model and presents the login form
export const LOGIN_ZOOM_START = OVERVIEW_HOLD_END // 15.4
export const LOGIN_ZOOM_END = LOGIN_ZOOM_START + 1.2 // 16.6
export const LOGIN_HOLD_DISTANCE = 2.4
export const LOGIN_END = LOGIN_ZOOM_END + LOGIN_HOLD_DISTANCE // 19.0

// Backwards compatibility aliases
export const ZOOM_OUT_START = OVERVIEW_ZOOM_OUT_START
export const ZOOM_OUT_END = OVERVIEW_ZOOM_OUT_END
export const LOGIN_START = LOGIN_ZOOM_START

// Total progress including all phases
export const TOTAL_SCROLL_PROGRESS = LOGIN_END

export const PASSAGE_ENTRY_Z = 2.45
export const PORTAL_APPROACH_Z = 3.2

export function getPortalTarget(index) {
  if (index <= 0) return INITIAL_ZOOM_DISTANCE
  return INITIAL_ZOOM_DISTANCE + Math.min(SECTION_COUNT - 1, index) * SECTION_CYCLE
}

export function getLoginTarget() {
  return LOGIN_ZOOM_END
}

