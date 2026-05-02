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
 * Validates a saved window state to ensure it's still valid
 * (e.g., monitor was disconnected, resolution changed)
 */
function isValidState(state: WindowState): boolean {
  if (state.x === undefined || state.y === undefined) {
    return true
  }

  const displays = screen.getAllDisplays()
  const isOnAnyDisplay = displays.some((display) => {
    const { x, y, width, height } = display.bounds
    return (
      state.x! >= x &&
      state.y! >= y &&
      state.x! + state.width <= x + width &&
      state.y! + state.height <= y + height
    )
  })

  return isOnAnyDisplay
}

/**
 * Returns the saved window state or defaults if invalid
 */
export function getSavedState(): WindowState {
  const saved = store.get('windowState')

  if (!isValidState(saved)) {
    return DEFAULT_STATE
  }

  return saved
}

/**
 * Attaches state-saving listeners to a window
 */
export function trackWindowState(window: BrowserWindow): void {
  let saveTimer: NodeJS.Timeout | null = null

  const saveState = (): void => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      if (window.isDestroyed()) {
        return
      }

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
    }, 500)
  }

  window.on('resize', saveState)
  window.on('move', saveState)
  window.on('maximize', saveState)
  window.on('unmaximize', saveState)
  window.on('close', () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
  })
}
