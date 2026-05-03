import Store from 'electron-store'
import { BrowserWindow, screen } from 'electron'

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

interface StoreSchema {
  windowState: WindowState
}

const DEFAULT_STATE: WindowState = {
  width: 1280,
  height: 800,
  isMaximized: false
}

const store = new Store<StoreSchema>({
  name: 'window-state',
  defaults: {
    windowState: DEFAULT_STATE
  }
})

/**
 * Validates a saved window state to ensure it's still valid.
 * More lenient: just checks if the window's top-left corner is somewhat reachable.
 */
function isValidState(state: WindowState): boolean {
  if (state.x === undefined || state.y === undefined) {
    return true
  }

  const displays = screen.getAllDisplays()
  const isOnAnyDisplay = displays.some((display) => {
    const { x, y, width, height } = display.bounds
    // Check if the top-left corner is within any display's bounds (with 50px leeway)
    return state.x! >= x - 50 && state.y! >= y - 50 && state.x! < x + width && state.y! < y + height
  })

  return isOnAnyDisplay
}

/**
 * Returns the saved window state or defaults if invalid
 */
export function getSavedState(): WindowState {
  try {
    const saved = store.get('windowState')
    if (saved && isValidState(saved)) {
      return saved
    }
  } catch (error) {
    console.error('Failed to load window state:', error)
  }
  return DEFAULT_STATE
}

/**
 * Attaches state-saving listeners to a window
 */
export function trackWindowState(window: BrowserWindow): void {
  const saveState = (): void => {
    if (window.isDestroyed()) return

    const isMaximized = window.isMaximized()
    const bounds = window.getBounds()

    const newState: WindowState = {
      isMaximized,
      width: bounds.width,
      height: bounds.height
    }

    if (!isMaximized) {
      newState.x = bounds.x
      newState.y = bounds.y
    }

    store.set('windowState', newState)
  }

  // Use a debounced save for moving/resizing
  let saveTimer: NodeJS.Timeout | null = null
  const debouncedSave = (): void => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(saveState, 500)
  }

  window.on('resize', debouncedSave)
  window.on('move', debouncedSave)
  window.on('maximize', saveState)
  window.on('unmaximize', saveState)

  // Save immediately on close
  window.on('close', () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveState()
  })
}
