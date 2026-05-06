/**
 * Panel sizing constants for the Antigravity-style panel system.
 * All values are in pixels unless otherwise noted.
 */

// Activity bar (always visible, never resizes)
export const ACTIVITY_BAR_WIDTH = 48

// Left sidebar
export const LEFT_SIDEBAR_MIN_WIDTH = 180
export const LEFT_SIDEBAR_DEFAULT_WIDTH = 260
export const LEFT_SIDEBAR_MAX_WIDTH_PADDING = 200
// Max = window.innerWidth - LEFT_SIDEBAR_MAX_WIDTH_PADDING (computed at runtime)

// Right sidebar
export const RIGHT_SIDEBAR_MIN_WIDTH = 220
export const RIGHT_SIDEBAR_DEFAULT_WIDTH = 320
export const RIGHT_SIDEBAR_MAX_WIDTH_PADDING = 200

// Auto-collapse thresholds (as ratio of window.innerWidth)
// When the LEFT sidebar's right edge crosses this fraction of window width,
// the RIGHT sidebar auto-collapses.
export const LEFT_PANEL_COLLAPSE_RIGHT_THRESHOLD = 0.6
// When the LEFT sidebar's right edge falls back below this fraction,
// the RIGHT sidebar auto-restores.
export const LEFT_PANEL_RESTORE_RIGHT_THRESHOLD = 0.5

// When the RIGHT sidebar's left edge crosses BELOW this fraction,
// the LEFT sidebar auto-collapses.
export const RIGHT_PANEL_COLLAPSE_LEFT_THRESHOLD = 0.4
// When it returns above this fraction, the LEFT sidebar auto-restores.
export const RIGHT_PANEL_RESTORE_LEFT_THRESHOLD = 0.5

// Bottom panel
export const BOTTOM_PANEL_MIN_HEIGHT = 100
export const BOTTOM_PANEL_DEFAULT_HEIGHT = 200
export const BOTTOM_PANEL_MAX_HEIGHT_PADDING = 200

// Drag resize handle
export const RESIZE_HANDLE_WIDTH = 4 // visual width
export const RESIZE_HANDLE_HIT_AREA = 8 // invisible hit area

// Animation
export const PANEL_TRANSITION_MS = 200

// During an active drag, transitions are disabled to allow the panel to track
// the cursor exactly (no animation lag).
export const DRAG_TRANSITION_NONE = 'none'
export const PANEL_TRANSITION = `width ${PANEL_TRANSITION_MS}ms ease-out, transform ${PANEL_TRANSITION_MS}ms ease-out, opacity ${PANEL_TRANSITION_MS}ms ease-out`
