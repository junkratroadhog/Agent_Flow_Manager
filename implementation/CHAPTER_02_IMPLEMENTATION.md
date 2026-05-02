# 📘 Chapter 2 Implementation Plan: Application Shell & Window Management

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 2 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only (not yarn or pnpm) unless the user explicitly says otherwise.
> 6. Run all commands from the project root directory unless specified otherwise.
> 7. After completing this chapter, run the FINAL VERIFICATION at the bottom.
> 8. The chapter is ONLY complete when ALL final verification checks pass.
> 9. **PREREQUISITE:** Chapter 1 must be fully complete with all 10 verification checks passing.

---

## 🎯 Chapter 2 Goal

Transform the basic Electron window from Chapter 1 into a properly configured application shell with:

- Persistent window state (size, position remembered between launches)
- Frameless window with custom Antigravity-style title bar
- Single-instance enforcement (no duplicate apps)
- Graceful application lifecycle (proper startup, shutdown, platform behavior)
- Window controls (minimize, maximize, close) with keyboard support

## 📋 What Will Exist When This Chapter Is Done

- Window remembers its size and position between app launches
- App has no native title bar - uses a custom React-based one instead
- Custom title bar shows app name, drag region, and window controls (− ☐ ✕)
- Trying to open the app twice focuses the existing window instead
- App quits properly on Windows/Linux when last window closes
- App stays in dock on macOS when window closes (proper macOS behavior)
- Double-clicking title bar maximizes/restores window
- Window controls follow OS conventions (right on Windows, left on macOS)
- All Chapter 1 functionality still works perfectly

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Chapter 1 is Complete

**Command to run:**

```bash
npm run typecheck
```

**Expected output:** Exits with code 0, no errors.

**If errors occur:** STOP. Chapter 1 was not completed properly. Go back and fix Chapter 1 issues first.

## Task 1.2: Verify Project Structure

**Command to run:**

```bash
ls src/main/index.ts src/preload/index.ts src/renderer/src/App.tsx
```

**Expected output:** All 3 files listed without "No such file" errors.

**If files missing:** STOP. Chapter 1 was not completed. Do not proceed.

## Task 1.3: Verify Dev Mode Still Works

**Command to run:**

```bash
npm run dev
```

**Expected behavior:** App window opens showing "Chapter 1 Complete" status card.

**Action:** Close the window after confirming it works. Then proceed.

**If it doesn't work:** STOP. Fix Chapter 1 before continuing.

---

# 📦 SECTION 2: Install New Dependencies

## Task 2.1: Install Required Packages

**Command to run:**

```bash
npm install electron-store
```

**Expected output:** Package installs successfully without errors.

**Verification:**

```bash
npm list electron-store
```

Should show `electron-store@x.x.x`.

## Task 2.2: Install Icon Library for Window Controls

**Command to run:**

```bash
npm install lucide-react
```

**Expected output:** Package installs successfully.

**Why we need this:** We'll use Lucide icons for the minimize/maximize/close buttons in the custom title bar.

---

# 📦 SECTION 3: Window State Persistence

## Task 3.1: Create Window State Manager

**File path:** `src/main/windowState.ts`

**Action:** Create this NEW file with the exact content below.

**Exact content:**

```typescript
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
```

## Task 3.2: Verify File Was Created

**Command to run:**

```bash
ls src/main/windowState.ts
```

**Expected:** File listed without errors.

---

# 📦 SECTION 4: Window Manager Module

## Task 4.1: Create the Window Manager

**File path:** `src/main/window.ts`

**Action:** Create this NEW file with the exact content below.

**Exact content:**

```typescript
import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { getSavedState, trackWindowState } from './windowState'

let mainWindow: BrowserWindow | null = null

export function createMainWindow(): BrowserWindow {
  const savedState = getSavedState()

  mainWindow = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: savedState.width,
    height: savedState.height,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    backgroundColor: '#0a0a0a',
    title: 'Agent Flow Manager',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  trackWindowState(mainWindow)

  if (savedState.isMaximized) {
    mainWindow.maximize()
  }

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function focusMainWindow(): void {
  if (!mainWindow) {
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.focus()
}

export function quitApp(): void {
  app.quit()
}
```

## Task 4.2: Verify File Created

**Command to run:**

```bash
ls src/main/window.ts
```

**Expected:** File listed.

---

# 📦 SECTION 5: Window Control IPC Handlers

## Task 5.1: Create Window Control Handlers

**File path:** `src/main/ipcHandlers.ts`

**Action:** Create this NEW file with the exact content below.

**Exact content:**

```typescript
import { ipcMain, BrowserWindow } from 'electron'

export function registerWindowHandlers(): void {
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.minimize()
    }
  })

  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.close()
    }
  })

  ipcMain.handle('window:isMaximized', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return window?.isMaximized() ?? false
  })

  ipcMain.handle('app:platform', () => {
    return process.platform
  })

  ipcMain.handle('app:version', () => {
    return process.env['npm_package_version'] || '0.1.0'
  })
}

/**
 * Sends window state events to renderer when window is maximized/unmaximized.
 * This lets the UI update the maximize button icon.
 */
export function attachWindowStateEvents(window: BrowserWindow): void {
  window.on('maximize', () => {
    window.webContents.send('window:maximized', true)
  })

  window.on('unmaximize', () => {
    window.webContents.send('window:maximized', false)
  })
}
```

## Task 5.2: Verify File Created

**Command to run:**

```bash
ls src/main/ipcHandlers.ts
```

**Expected:** File listed.

---

# 📦 SECTION 6: Update Main Process Entry

## Task 6.1: Replace Main Process Entry File

**File path:** `src/main/index.ts`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```typescript
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, focusMainWindow } from './window'
import { registerWindowHandlers, attachWindowStateEvents } from './ipcHandlers'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.agentflow.manager')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerWindowHandlers()

    const mainWindow = createMainWindow()
    attachWindowStateEvents(mainWindow)

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        const newWindow = createMainWindow()
        attachWindowStateEvents(newWindow)
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    // Cleanup hook for future chapters (DB close, etc.)
  })
}
```

## Task 6.2: Verify Type Check Passes

**Command to run:**

```bash
npm run typecheck
```

**Expected output:** Exits with code 0, no errors.

**If errors occur:**

- Read errors carefully
- Verify all files in Sections 3, 4, 5 exist with exact content
- Common issue: Missing import. Check spelling carefully.

**STOP HERE if typecheck fails. Fix all errors before proceeding.**

---

# 📦 SECTION 7: Update Preload Script

## Task 7.1: Replace Preload Script

**File path:** `src/preload/index.ts`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```typescript
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

const windowControls = {
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  close: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized)
    }
    ipcRenderer.on('window:maximized', handler)
    return () => {
      ipcRenderer.removeListener('window:maximized', handler)
    }
  }
}

const platform = {
  get: (): Promise<string> => ipcRenderer.invoke('app:platform'),
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('windowControls', windowControls)
    contextBridge.exposeInMainWorld('platform', platform)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.windowControls = windowControls
  // @ts-ignore (define in dts)
  window.platform = platform
}
```

## Task 7.2: Update Preload Type Declarations

**File path:** `src/preload/index.d.ts`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```typescript
import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowControls {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
}

export interface PlatformAPI {
  get: () => Promise<string>
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      appName: string
      appVersion: string
    }
    windowControls: WindowControls
    platform: PlatformAPI
  }
}
```

## Task 7.3: Verify Type Check Passes Again

**Command to run:**

```bash
npm run typecheck
```

**Expected output:** Exits with code 0, no errors.

**If errors occur:** Read carefully. Verify exact match of preload files.

---

# 📦 SECTION 8: Custom Title Bar Component

## Task 8.1: Create Components Folder

**Command to run:**

```bash
mkdir -p src/renderer/src/components/TitleBar
```

## Task 8.2: Create Title Bar Component

**File path:** `src/renderer/src/components/TitleBar/TitleBar.tsx`

**Action:** Create this NEW file with the exact content below.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import './TitleBar.css'

interface TitleBarProps {
  title?: string
}

function TitleBar({ title = 'Agent Flow Manager' }: TitleBarProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState<string>('win32')

  useEffect(() => {
    const init = async (): Promise<void> => {
      if (window.platform) {
        const detectedPlatform = await window.platform.get()
        setPlatform(detectedPlatform)
      }

      if (window.windowControls) {
        const initialState = await window.windowControls.isMaximized()
        setIsMaximized(initialState)
      }
    }

    init()

    if (window.windowControls) {
      const unsubscribe = window.windowControls.onMaximizedChange((maximized) => {
        setIsMaximized(maximized)
      })
      return unsubscribe
    }

    return undefined
  }, [])

  const handleMinimize = (): void => {
    window.windowControls?.minimize()
  }

  const handleMaximize = (): void => {
    window.windowControls?.maximize()
  }

  const handleClose = (): void => {
    window.windowControls?.close()
  }

  const handleDoubleClick = (): void => {
    handleMaximize()
  }

  const isMac = platform === 'darwin'

  return (
    <div className={`title-bar ${isMac ? 'title-bar--mac' : 'title-bar--win'}`}>
      <div className="title-bar__drag-region" onDoubleClick={handleDoubleClick}>
        <div className="title-bar__title">
          <span className="title-bar__app-name">{title}</span>
        </div>
      </div>

      {!isMac && (
        <div className="title-bar__controls">
          <button
            className="title-bar__button title-bar__button--minimize"
            onClick={handleMinimize}
            aria-label="Minimize"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            className="title-bar__button title-bar__button--maximize"
            onClick={handleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            className="title-bar__button title-bar__button--close"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TitleBar
```

## Task 8.3: Create Title Bar Styles

**File path:** `src/renderer/src/components/TitleBar/TitleBar.css`

**Action:** Create this NEW file with the exact content below.

**Exact content:**

```css
.title-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background-color: #0a0a0a;
  border-bottom: 1px solid #1f1f1f;
  user-select: none;
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
}

.title-bar--mac {
  padding-left: 80px;
}

.title-bar__drag-region {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
  padding: 0 12px;
}

.title-bar__title {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.title-bar__app-name {
  font-size: 12px;
  font-weight: 500;
  color: #d1d5db;
  letter-spacing: 0.2px;
}

.title-bar__controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.title-bar__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 100%;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
  outline: none;
  padding: 0;
}

.title-bar__button:hover {
  background-color: #1f1f1f;
  color: #ffffff;
}

.title-bar__button:active {
  background-color: #262626;
}

.title-bar__button--close:hover {
  background-color: #e81123;
  color: #ffffff;
}

.title-bar__button--close:active {
  background-color: #c50f1f;
}

.title-bar__button:focus-visible {
  outline: 1px solid #3b82f6;
  outline-offset: -2px;
}
```

## Task 8.4: Verify Files Created

**Command to run:**

```bash
ls src/renderer/src/components/TitleBar/
```

**Expected output:** Two files listed: `TitleBar.tsx` and `TitleBar.css`

---

# 📦 SECTION 9: Update App Component

## Task 9.1: Update App.tsx to Use Title Bar

**File path:** `src/renderer/src/App.tsx`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')
  const [appVersion, setAppVersion] = useState<string>('0.1.0')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    if (window.api) {
      setAppName(window.api.appName)
      setAppVersion(window.api.appVersion)
    }

    if (window.platform) {
      window.platform.get().then((p) => setPlatform(p))
    }
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <main className="app-main">
        <div className="status-card">
          <h2>✅ Chapter 2 Complete</h2>
          <p>Application shell and window management working.</p>
          <ul>
            <li>✓ Frameless window with custom title bar</li>
            <li>✓ Window state persists across launches</li>
            <li>✓ Single-instance enforcement active</li>
            <li>✓ Window controls (minimize/maximize/close)</li>
            <li>✓ Platform detected: {platform || 'detecting...'}</li>
            <li>✓ App version: {appVersion}</li>
          </ul>
          <p className="hint">Try: resize window, close and reopen — it remembers.</p>
        </div>
      </main>
      <footer className="app-footer">
        <p>Ready for Chapter 3</p>
      </footer>
    </div>
  )
}

export default App
```

## Task 9.2: Update Global CSS

**File path:** `src/renderer/src/styles/globals.css`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #0a0a0a;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: auto;
}

.status-card {
  background-color: #141414;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
}

.status-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
}

.status-card p {
  color: #9ca3af;
  margin-bottom: 16px;
}

.status-card ul {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
}

.status-card li {
  padding: 6px 0;
  color: #d1d5db;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.status-card .hint {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 0;
}

.app-footer {
  padding: 12px 32px;
  border-top: 1px solid #1f1f1f;
  text-align: center;
  font-size: 11px;
  color: #6b7280;
}

button {
  font-family: inherit;
}
```

---

# 📦 SECTION 10: Update Tests

## Task 10.1: Update App Test File

**File path:** `tests/unit/App.test.tsx`

**Action:** OVERWRITE the entire existing file with this exact content.

**Exact content:**

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'api', {
      value: {
        appName: 'Agent Flow Manager',
        appVersion: '0.1.0'
      },
      writable: true,
      configurable: true
    })

    Object.defineProperty(window, 'platform', {
      value: {
        get: vi.fn().mockResolvedValue('win32'),
        getVersion: vi.fn().mockResolvedValue('0.1.0')
      },
      writable: true,
      configurable: true
    })

    Object.defineProperty(window, 'windowControls', {
      value: {
        minimize: vi.fn().mockResolvedValue(undefined),
        maximize: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        isMaximized: vi.fn().mockResolvedValue(false),
        onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    const titles = screen.getAllByText(/Agent Flow Manager/i)
    expect(titles.length).toBeGreaterThan(0)
  })

  it('displays the chapter 2 status card', () => {
    render(<App />)
    expect(screen.getByText(/Chapter 2 Complete/i)).toBeInTheDocument()
  })

  it('displays the version', () => {
    render(<App />)
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument()
  })

  it('renders the title bar', () => {
    render(<App />)
    expect(screen.getByLabelText(/Minimize/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Close/i)).toBeInTheDocument()
  })
})
```

## Task 10.2: Run Tests

**Command to run:**

```bash
npm run test:run
```

**Expected output:** 4 tests pass.

**If tests fail:**

- Read errors carefully
- Verify all files match exactly
- Do NOT skip. Tests must pass.

---

# 📦 SECTION 11: Verify Everything Compiles

## Task 11.1: Run Full Type Check

**Command to run:**

```bash
npm run typecheck
```

**Expected output:** Exits with code 0, no errors.

**If errors occur:**

- Verify all files in this chapter exist with exact content
- Common issue: Forgot to install `lucide-react` or `electron-store` (Section 2)
- Common issue: Spelling errors in import paths

## Task 11.2: Run Lint

**Command to run:**

```bash
npm run lint
```

**Expected output:** No errors. Warnings acceptable.

**If errors occur:** Run `npm run lint:fix`, then check again.

## Task 11.3: Run Format

**Command to run:**

```bash
npm run format
```

**Expected output:** Files formatted successfully.

**Verification:**

```bash
npm run format:check
```

Should pass.

---

# 📦 SECTION 12: Manual Visual Verification

## Task 12.1: Launch Dev Mode

**Command to run:**

```bash
npm run dev
```

**Expected behavior:**

1. App window opens within ~5 seconds
2. Window has NO native OS title bar
3. Custom dark title bar appears at top showing "Agent Flow Manager"
4. Three buttons appear on right side: minimize (−), maximize (☐), close (✕)
5. Status card shows "✅ Chapter 2 Complete"
6. Platform is shown (e.g., "win32", "darwin", "linux")

## Task 12.2: Test Minimize Button

**Action:** Click the minimize button (−)

**Expected:** Window minimizes to taskbar.

**Action:** Click the app in taskbar to restore.

**Expected:** Window restores to previous size.

## Task 12.3: Test Maximize Button

**Action:** Click the maximize button (☐)

**Expected:**

- Window fills entire screen
- Maximize icon changes to "restore" icon
- Click again restores window to original size

## Task 12.4: Test Close Button

**Action:** Click the close button (✕)

**Expected:** App closes completely (on Windows/Linux). On macOS, app stays in dock.

## Task 12.5: Test Window Drag

**Action:** Click and drag the title bar area (where "Agent Flow Manager" text is)

**Expected:** Window moves with cursor.

**Action:** Drag the title bar to a different position. Note the position.

## Task 12.6: Test Window State Persistence

**Action:**

1. Resize the window to a non-default size (e.g., make it smaller)
2. Move it to a specific position
3. Close the app
4. Run `npm run dev` again

**Expected:** Window opens at the EXACT same size and position you left it.

## Task 12.7: Test Maximize Persistence

**Action:**

1. Maximize the window
2. Close the app
3. Run `npm run dev` again

**Expected:** Window opens maximized.

## Task 12.8: Test Double-Click on Title Bar

**Action:** Restore the window if maximized, then double-click on the title bar drag area

**Expected:** Window maximizes. Double-click again to restore.

## Task 12.9: Test Single Instance Enforcement

**Action:** While the app is running, open a new terminal and run `npm run dev` again.

**Expected:** Either:

- New instance refuses to launch and existing window comes to focus, OR
- The first window jumps to foreground

**Note:** This may behave slightly differently in dev mode vs production. The key behavior is that there's no duplicate window.

**🛑 USER VERIFICATION REQUIRED:** Confirm ALL of the following work:

- [ ] Custom title bar appears (no native OS title bar)
- [ ] Minimize button works
- [ ] Maximize button works (and toggles icon)
- [ ] Close button works (and shows red on hover on Windows)
- [ ] Window can be dragged by title bar
- [ ] Window size persists after closing and reopening
- [ ] Window position persists after closing and reopening
- [ ] Maximize state persists after closing and reopening
- [ ] Double-clicking title bar maximizes/restores
- [ ] Status card shows "Chapter 2 Complete"
- [ ] Platform name is visible

**DO NOT PROCEED until user confirms all items work.**

---

# 📦 SECTION 13: Production Build Test

## Task 13.1: Run Production Build

**Command to run:**

```bash
npm run build
```

**Expected output:**

- TypeScript check passes
- Three builds complete (main, preload, renderer)
- No errors
- Output in `out/` folder

## Task 13.2: Verify Build Artifacts

**Command to run:**

```bash
ls out
```

**Expected output:** `main`, `preload`, `renderer` folders.

**Command to run:**

```bash
ls out/main
```

**Expected output:** Should include `index.js` and other compiled files.

---

# 📦 SECTION 14: Git Commit

## Task 14.1: Stage Changes

**Command to run:**

```bash
git add .
```

## Task 14.2: Verify No Unwanted Files

**Command to run:**

```bash
git status
```

**Expected:** Changes listed include:

- New files: `src/main/window.ts`, `src/main/windowState.ts`, `src/main/ipcHandlers.ts`
- New files: `src/renderer/src/components/TitleBar/*`
- Modified files: `src/main/index.ts`, `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/App.tsx`, `src/renderer/src/styles/globals.css`, `tests/unit/App.test.tsx`, `package.json`, `package-lock.json`

**Should NOT include:** `node_modules/`, `out/`, `dist/`

## Task 14.3: Commit Changes

**Command to run:**

```bash
git commit -m "feat: window management and custom title bar (Chapter 2)"
```

**Expected output:**

- Pre-commit hook runs (lint + format check)
- Commit succeeds

**If pre-commit fails:** Fix errors, run `git add .` again, retry commit.

---

# 🏁 FINAL VERIFICATION CHECKLIST

Run each command and verify the expected output. ALL must pass before declaring Chapter 2 done.

## ✅ Check 1: All new files exist

**Command:**

```bash
ls src/main/window.ts src/main/windowState.ts src/main/ipcHandlers.ts src/renderer/src/components/TitleBar/TitleBar.tsx src/renderer/src/components/TitleBar/TitleBar.css
```

**Expected:** All 5 files listed without errors.

## ✅ Check 2: Modified files updated

**Command:**

```bash
ls src/main/index.ts src/preload/index.ts src/preload/index.d.ts src/renderer/src/App.tsx
```

**Expected:** All 4 files listed.

## ✅ Check 3: New dependencies installed

**Command:**

```bash
npm list electron-store lucide-react
```

**Expected:** Both packages listed with versions, no "missing" errors.

## ✅ Check 4: TypeScript compiles

**Command:**

```bash
npm run typecheck
```

**Expected:** Exits with code 0, no errors.

## ✅ Check 5: Lint passes

**Command:**

```bash
npm run lint
```

**Expected:** Exits with code 0, no errors.

## ✅ Check 6: Format check passes

**Command:**

```bash
npm run format:check
```

**Expected:** Exits with code 0.

## ✅ Check 7: Tests pass

**Command:**

```bash
npm run test:run
```

**Expected:** 4 tests pass.

## ✅ Check 8: Production build works

**Command:**

```bash
npm run build
```

**Expected:** Exits with code 0, no errors.

## ✅ Check 9: Dev mode launches with custom title bar

**Command:**

```bash
npm run dev
```

**🛑 USER MUST CONFIRM:**

- [ ] No native OS title bar visible
- [ ] Custom dark title bar appears
- [ ] Window controls (− ☐ ✕) work
- [ ] Window can be dragged
- [ ] Window state persists across launches
- [ ] Status card shows "Chapter 2 Complete"

**Stop the app after verification (Ctrl+C or close window).**

## ✅ Check 10: Git commit made

**Command:**

```bash
git log --oneline
```

**Expected:** At least 2 commits visible. Latest mentions Chapter 2.

---

# 📊 Chapter 2 Completion Report

When all 10 final verification checks pass, report this to the user:

```
✅ Chapter 2: Application Shell & Window Management - COMPLETE

Acceptance Criteria Met:
✅ BrowserWindow created with secure settings (contextIsolation, sandbox)
✅ Custom frameless window implemented
✅ Custom title bar component built and styled
✅ Window controls (minimize/maximize/close) functional
✅ Window state persists between launches (size, position, maximized)
✅ Single-instance lock prevents duplicate apps
✅ Platform-specific behavior (Windows/macOS/Linux)
✅ Application lifecycle handled (startup, activate, quit)
✅ Double-click title bar toggles maximize
✅ Window centered/restored correctly on launch
✅ All tests passing (4 tests)
✅ Production build works
✅ Git commit made

Deliverables Created:
- src/main/window.ts (window manager)
- src/main/windowState.ts (state persistence)
- src/main/ipcHandlers.ts (window control IPC)
- src/renderer/src/components/TitleBar/TitleBar.tsx
- src/renderer/src/components/TitleBar/TitleBar.css

Deliverables Modified:
- src/main/index.ts (refactored entry point)
- src/preload/index.ts (window controls API)
- src/preload/index.d.ts (type declarations)
- src/renderer/src/App.tsx (uses TitleBar)
- src/renderer/src/styles/globals.css (updated)
- tests/unit/App.test.tsx (updated tests)
- package.json (new dependencies)

Dependencies Added:
- electron-store
- lucide-react

Ready to proceed to Chapter 3: Design System & Theme Foundation.
```

---

# 🚨 Troubleshooting Guide

## Problem: Title bar not appearing / native title bar still visible

**Solutions:**

1. Verify `frame: false` is set in `src/main/window.ts`
2. Restart `npm run dev` (changes to main process require restart)
3. Check that `TitleBar` component is imported in `App.tsx`

## Problem: Window controls (minimize/maximize/close) don't work

**Solutions:**

1. Open DevTools (Ctrl+Shift+I) and check Console for errors
2. Verify preload script is updated (Section 7)
3. Verify `registerWindowHandlers()` is called in `src/main/index.ts`
4. Check `window.windowControls` exists by typing it in DevTools console

## Problem: Window state doesn't persist

**Solutions:**

1. Verify `electron-store` is installed: `npm list electron-store`
2. Verify `trackWindowState(mainWindow)` is called in `window.ts`
3. Check that you're closing the app properly (not killing the process)

## Problem: "Cannot find module 'electron-store'"

**Solution:** Run `npm install electron-store` again.

## Problem: "Cannot find module 'lucide-react'"

**Solution:** Run `npm install lucide-react` again.

## Problem: Window appears off-screen on second launch

**Solution:** This shouldn't happen because of `isValidState()` check. If it does, delete the window state file:

- Windows: `%APPDATA%\agent-flow-manager\window-state.json`
- macOS: `~/Library/Application Support/agent-flow-manager/window-state.json`
- Linux: `~/.config/agent-flow-manager/window-state.json`

## Problem: Drag region not working (window won't drag)

**Solutions:**

1. Verify `-webkit-app-region: drag` is in CSS
2. Verify drag region div is NOT covered by other elements
3. The buttons must have `-webkit-app-region: no-drag`

## Problem: Tests fail with "window is not defined"

**Solution:** Verify `vitest.config.ts` has `environment: 'jsdom'`. If not, fix Chapter 1.

## Problem: Single instance lock not working

**Solutions:**

1. In dev mode, this can sometimes be tricky because of hot reload
2. Test in production build (`npm run build`) for accurate behavior
3. Verify `app.requestSingleInstanceLock()` is at the top of `index.ts`

## Problem: macOS: Title bar buttons appear in wrong place

**Solution:** On macOS, native traffic light buttons are used (left side). Our custom buttons are hidden via `!isMac` check. This is correct behavior.

---

# 📝 Notes for the Implementing LLM

1. **DO NOT remove existing functionality.** All Chapter 1 features must still work.
2. **DO NOT add features not specified.** This chapter is window management only.
3. **DO NOT skip the manual visual verification.** It's critical for window behavior.
4. **PAUSE at user verification checkpoints.** Wait for user confirmation.
5. **REPORT ERRORS HONESTLY.** Do not pretend something works when it doesn't.
6. **DO NOT modify electron-builder.yml.** It's already correct from Chapter 1.
7. **TEST ON THE ACTUAL OS.** Window behavior varies between Windows/Mac/Linux.
8. **DO NOT proceed to Chapter 3** until all 10 final checks pass.

---

**End of Chapter 2 Implementation Plan**
