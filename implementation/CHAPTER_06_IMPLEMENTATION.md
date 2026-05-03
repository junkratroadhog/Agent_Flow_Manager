# 📘 Chapter 6 Implementation Plan: IPC & Process Communication

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 6 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only.
> 6. Run all commands from project root.
> 7. After completing this chapter, run the FINAL VERIFICATION at the bottom.
> 8. **PREREQUISITE:** Chapters 1-5 must be complete.

---

## 🎯 Chapter 6 Goal

Build a robust, type-safe IPC (Inter-Process Communication) layer connecting the renderer process to the main process. This enables the UI to interact with the database, file system, and future LLM/tool services.

## 📋 What Will Exist When This Chapter Is Done

- Type-safe IPC contract shared between main and renderer
- IPC handlers for all CRUD operations on Projects, Sessions, Messages, Agents
- Event streaming from main to renderer (e.g., agent status updates)
- Error handling and validation on all IPC calls
- Renderer-side service layer that wraps IPC for clean store usage
- IPC handlers tested
- Renderer can create/list/update/delete projects via UI

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

**If errors occur:** STOP. Fix earlier chapter issues first.

---

# 📦 SECTION 2: IPC Contract Definition

## Task 2.1: Create Shared IPC Types

**File path:** `src/shared/ipc-channels.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Centralized IPC channel names. ALL handlers and renderer calls must use these constants.
 * This prevents typos and makes it easy to find all usages.
 */

export const IPC = {
  // Projects
  PROJECT_LIST: 'projects:list',
  PROJECT_CREATE: 'projects:create',
  PROJECT_UPDATE: 'projects:update',
  PROJECT_DELETE: 'projects:delete',
  PROJECT_GET: 'projects:get',

  // Sessions
  SESSION_LIST: 'sessions:list',
  SESSION_CREATE: 'sessions:create',
  SESSION_UPDATE: 'sessions:update',
  SESSION_DELETE: 'sessions:delete',
  SESSION_PIN: 'sessions:pin',
  SESSION_ARCHIVE: 'sessions:archive',
  SESSION_GET: 'sessions:get',

  // Messages
  MESSAGE_LIST: 'messages:list',
  MESSAGE_CREATE: 'messages:create',
  MESSAGE_DELETE: 'messages:delete',

  // Agents
  AGENT_LIST: 'agents:list',
  AGENT_CREATE: 'agents:create',
  AGENT_UPDATE_STATUS: 'agents:updateStatus',
  AGENT_GET: 'agents:get',
  AGENT_CHILDREN: 'agents:children',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll',

  // API Keys
  APIKEY_SET: 'apikey:set',
  APIKEY_HAS: 'apikey:has',
  APIKEY_DELETE: 'apikey:delete',
  APIKEY_LIST_PROVIDERS: 'apikey:listProviders',

  // App
  APP_VERSION: 'app:version',
  APP_PLATFORM: 'app:platform',
  APP_USER_DATA_PATH: 'app:userDataPath',

  // Window controls (already in Chapter 2)
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized'
} as const

export const IPC_EVENTS = {
  // Pushed from main → renderer
  AGENT_STATUS_CHANGED: 'event:agent:statusChanged',
  AGENT_TOKENS_UPDATED: 'event:agent:tokensUpdated',
  AGENT_SPAWNED: 'event:agent:spawned',
  MESSAGE_STREAM_DELTA: 'event:message:streamDelta',
  MESSAGE_STREAM_COMPLETE: 'event:message:streamComplete',
  TOOL_CALL_REQUESTED: 'event:tool:requested',
  TOOL_CALL_COMPLETED: 'event:tool:completed',
  WINDOW_MAXIMIZED: 'window:maximized'
} as const

export type IPCChannel = (typeof IPC)[keyof typeof IPC]
export type IPCEvent = (typeof IPC_EVENTS)[keyof typeof IPC_EVENTS]
```

## Task 2.2: Create IPC Result Type

**File path:** `src/shared/ipc-types.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Standard envelope for all IPC responses. Use these helpers to ensure errors
 * are surfaced consistently across the IPC boundary.
 */

export type IPCSuccess<T> = { ok: true; data: T }
export type IPCError = { ok: false; error: string; code?: string }
export type IPCResult<T> = IPCSuccess<T> | IPCError

export function ipcSuccess<T>(data: T): IPCSuccess<T> {
  return { ok: true, data }
}

export function ipcError(error: unknown, code?: string): IPCError {
  const message = error instanceof Error ? error.message : String(error)
  return { ok: false, error: message, code }
}

export function unwrap<T>(result: IPCResult<T>): T {
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}
```

---

# 📦 SECTION 3: Main Process IPC Handlers

## Task 3.1: Create Project IPC Handler

**File path:** `src/main/ipc/projectHandlers.ts`

**Command first:**

```bash
mkdir -p src/main/ipc
```

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Project, CreateProjectInput } from '@shared/db-types'

export function registerProjectHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.PROJECT_LIST, async (): Promise<IPCResult<Project[]>> => {
    try {
      return ipcSuccess(repos.projects.findAll())
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.PROJECT_GET,
    async (_event, id: string): Promise<IPCResult<Project | null>> => {
      try {
        return ipcSuccess(repos.projects.findById(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.PROJECT_CREATE,
    async (_event, input: CreateProjectInput): Promise<IPCResult<Project>> => {
      try {
        return ipcSuccess(repos.projects.create(input))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.PROJECT_UPDATE,
    async (
      _event,
      id: string,
      updates: Partial<CreateProjectInput>
    ): Promise<IPCResult<Project | null>> => {
      try {
        return ipcSuccess(repos.projects.update(id, updates))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.PROJECT_DELETE, async (_event, id: string): Promise<IPCResult<boolean>> => {
    try {
      return ipcSuccess(repos.projects.delete(id))
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.2: Create Session IPC Handler

**File path:** `src/main/ipc/sessionHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Session, CreateSessionInput } from '@shared/db-types'

export function registerSessionHandlers(repos: Repositories): void {
  ipcMain.handle(
    IPC.SESSION_LIST,
    async (_event, projectId: string, includeArchived = false): Promise<IPCResult<Session[]>> => {
      try {
        return ipcSuccess(repos.sessions.findByProject(projectId, includeArchived))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_GET,
    async (_event, id: string): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.findById(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_CREATE,
    async (_event, input: CreateSessionInput): Promise<IPCResult<Session>> => {
      try {
        return ipcSuccess(repos.sessions.create(input))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_UPDATE,
    async (_event, id: string, title: string): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.updateTitle(id, title))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_PIN,
    async (_event, id: string, pinned: boolean): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.setPinned(id, pinned))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_ARCHIVE,
    async (_event, id: string, archived: boolean): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.setArchived(id, archived))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.SESSION_DELETE, async (_event, id: string): Promise<IPCResult<boolean>> => {
    try {
      return ipcSuccess(repos.sessions.delete(id))
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.3: Create Message IPC Handler

**File path:** `src/main/ipc/messageHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Message, CreateMessageInput } from '@shared/db-types'

export function registerMessageHandlers(repos: Repositories): void {
  ipcMain.handle(
    IPC.MESSAGE_LIST,
    async (_event, sessionId: string, limit?: number): Promise<IPCResult<Message[]>> => {
      try {
        return ipcSuccess(repos.messages.findBySession(sessionId, limit))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.MESSAGE_CREATE,
    async (_event, input: CreateMessageInput): Promise<IPCResult<Message>> => {
      try {
        const msg = repos.messages.create(input)
        // Touch session updated_at
        repos.sessions.touch(input.session_id)
        return ipcSuccess(msg)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.MESSAGE_DELETE, async (_event, id: string): Promise<IPCResult<boolean>> => {
    try {
      return ipcSuccess(repos.messages.delete(id))
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.4: Create Agent IPC Handler

**File path:** `src/main/ipc/agentHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain, BrowserWindow } from 'electron'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Agent, CreateAgentInput, AgentStatusType } from '@shared/db-types'

export function registerAgentHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.AGENT_LIST, async (_event, sessionId: string): Promise<IPCResult<Agent[]>> => {
    try {
      return ipcSuccess(repos.agents.findBySession(sessionId))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.AGENT_GET, async (_event, id: string): Promise<IPCResult<Agent | null>> => {
    try {
      return ipcSuccess(repos.agents.findById(id))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.AGENT_CHILDREN,
    async (_event, parentId: string): Promise<IPCResult<Agent[]>> => {
      try {
        return ipcSuccess(repos.agents.findChildren(parentId))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.AGENT_CREATE,
    async (_event, input: CreateAgentInput): Promise<IPCResult<Agent>> => {
      try {
        const agent = repos.agents.create(input)
        broadcastToWindows(IPC_EVENTS.AGENT_SPAWNED, agent)
        return ipcSuccess(agent)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.AGENT_UPDATE_STATUS,
    async (
      _event,
      id: string,
      status: AgentStatusType,
      currentAction?: string
    ): Promise<IPCResult<Agent | null>> => {
      try {
        const updated = repos.agents.updateStatus(id, status, currentAction)
        if (updated) {
          broadcastToWindows(IPC_EVENTS.AGENT_STATUS_CHANGED, updated)
        }
        return ipcSuccess(updated)
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}
```

## Task 3.5: Create Settings IPC Handler

**File path:** `src/main/ipc/settingsHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'

export function registerSettingsHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.SETTINGS_GET, async (_event, key: string): Promise<IPCResult<unknown>> => {
    try {
      return ipcSuccess(repos.settings.get(key))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.SETTINGS_SET,
    async (_event, key: string, value: unknown): Promise<IPCResult<void>> => {
      try {
        repos.settings.set(key, value)
        return ipcSuccess(undefined)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.SETTINGS_GET_ALL, async (): Promise<IPCResult<Record<string, unknown>>> => {
    try {
      return ipcSuccess(repos.settings.getAll())
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.6: Create API Key IPC Handler

**File path:** `src/main/ipc/apiKeyHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { SecretStorage } from '../services/SecretStorage'

export function registerApiKeyHandlers(secretStorage: SecretStorage): void {
  ipcMain.handle(
    IPC.APIKEY_SET,
    async (_event, provider: string, key: string): Promise<IPCResult<void>> => {
      try {
        secretStorage.setApiKey(provider, key)
        return ipcSuccess(undefined)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.APIKEY_HAS, async (_event, provider: string): Promise<IPCResult<boolean>> => {
    try {
      return ipcSuccess(secretStorage.hasApiKey(provider))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.APIKEY_DELETE,
    async (_event, provider: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(secretStorage.deleteApiKey(provider))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.APIKEY_LIST_PROVIDERS, async (): Promise<IPCResult<string[]>> => {
    try {
      return ipcSuccess(secretStorage.listProviders())
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.7: Create App Info IPC Handler

**File path:** `src/main/ipc/appHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain, app } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'

export function registerAppHandlers(): void {
  ipcMain.handle(IPC.APP_VERSION, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(app.getVersion())
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.APP_PLATFORM, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(process.platform)
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.APP_USER_DATA_PATH, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(app.getPath('userData'))
    } catch (error) {
      return ipcError(error)
    }
  })
}
```

## Task 3.8: Create IPC Registry

**File path:** `src/main/ipc/index.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import type { Repositories } from '../db/repositories'
import type { SecretStorage } from '../services/SecretStorage'
import { registerProjectHandlers } from './projectHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerMessageHandlers } from './messageHandlers'
import { registerAgentHandlers } from './agentHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerApiKeyHandlers } from './apiKeyHandlers'
import { registerAppHandlers } from './appHandlers'

export function registerAllIpcHandlers(repos: Repositories, secretStorage: SecretStorage): void {
  registerProjectHandlers(repos)
  registerSessionHandlers(repos)
  registerMessageHandlers(repos)
  registerAgentHandlers(repos)
  registerSettingsHandlers(repos)
  registerApiKeyHandlers(secretStorage)
  registerAppHandlers()
}
```

---

# 📦 SECTION 4: Update Main Process Entry

## Task 4.1: Update src/main/index.ts

**File path:** `src/main/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, focusMainWindow } from './window'
import { registerWindowHandlers, attachWindowStateEvents } from './ipcHandlers'
import { initDatabase, closeDatabase } from './db'
import { runMigrations } from './db/migrations/runner'
import { createRepositories, type Repositories } from './db/repositories'
import { SecretStorage } from './services/SecretStorage'
import { registerAllIpcHandlers } from './ipc'

let repos: Repositories | null = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.agentflow.manager')

    // Initialize database & repos
    try {
      const db = initDatabase()
      runMigrations(db)
      repos = createRepositories(db)
      const secretStorage = new SecretStorage(db)
      registerAllIpcHandlers(repos, secretStorage)
      console.info('Database and IPC handlers initialized')
    } catch (error) {
      console.error('Failed to initialize:', error)
    }

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
    closeDatabase()
  })
}
```

---

# 📦 SECTION 5: Preload Bridge

## Task 5.1: Update Preload Script

**File path:** `src/preload/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC, IPC_EVENTS } from '../shared/ipc-channels'
import type { IPCResult } from '../shared/ipc-types'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

const windowControls = {
  minimize: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_MINIMIZE),
  maximize: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_MAXIMIZE),
  close: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_CLOSE),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW_IS_MAXIMIZED),
  onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized)
    }
    ipcRenderer.on(IPC_EVENTS.WINDOW_MAXIMIZED, handler)
    return () => ipcRenderer.removeListener(IPC_EVENTS.WINDOW_MAXIMIZED, handler)
  }
}

const platform = {
  get: (): Promise<string> =>
    ipcRenderer
      .invoke(IPC.APP_PLATFORM)
      .then((r: IPCResult<string>) => (r.ok ? r.data : 'unknown')),
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC.APP_VERSION).then((r: IPCResult<string>) => (r.ok ? r.data : '0.0.0'))
}

/**
 * Generic IPC bridge. The renderer service layer wraps these.
 */
const bridge = {
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void =>
      listener(...args)
    ipcRenderer.on(channel, wrapped)
    return () => ipcRenderer.removeListener(channel, wrapped)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('windowControls', windowControls)
    contextBridge.exposeInMainWorld('platform', platform)
    contextBridge.exposeInMainWorld('bridge', bridge)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
  // @ts-ignore
  window.windowControls = windowControls
  // @ts-ignore
  window.platform = platform
  // @ts-ignore
  window.bridge = bridge
}
```

## Task 5.2: Update Preload Type Declarations

**File path:** `src/preload/index.d.ts`

**Action:** OVERWRITE entire file.

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

export interface Bridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, listener: (...args: unknown[]) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: { appName: string; appVersion: string }
    windowControls: WindowControls
    platform: PlatformAPI
    bridge: Bridge
  }
}
```

---

# 📦 SECTION 6: Renderer-Side Service Layer

## Task 6.1: Create Services Folder

**Command:**

```bash
mkdir -p src/renderer/src/services
```

## Task 6.2: Create Base Bridge Wrapper

**File path:** `src/renderer/src/services/bridge.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { unwrap, type IPCResult } from '@shared/ipc-types'

export async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!window.bridge) {
    throw new Error('IPC bridge not available. Are you running in Electron?')
  }
  const result = (await window.bridge.invoke(channel, ...args)) as IPCResult<T>
  return unwrap(result)
}

export function subscribe(channel: string, listener: (...args: unknown[]) => void): () => void {
  if (!window.bridge) {
    return () => undefined
  }
  return window.bridge.on(channel, listener)
}
```

## Task 6.3: Create Project Service

**File path:** `src/renderer/src/services/projectService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Project, CreateProjectInput } from '@shared/db-types'

export const projectService = {
  list: (): Promise<Project[]> => invoke<Project[]>(IPC.PROJECT_LIST),
  get: (id: string): Promise<Project | null> => invoke<Project | null>(IPC.PROJECT_GET, id),
  create: (input: CreateProjectInput): Promise<Project> =>
    invoke<Project>(IPC.PROJECT_CREATE, input),
  update: (id: string, updates: Partial<CreateProjectInput>): Promise<Project | null> =>
    invoke<Project | null>(IPC.PROJECT_UPDATE, id, updates),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.PROJECT_DELETE, id)
}
```

## Task 6.4: Create Session Service

**File path:** `src/renderer/src/services/sessionService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Session, CreateSessionInput } from '@shared/db-types'

export const sessionService = {
  list: (projectId: string, includeArchived = false): Promise<Session[]> =>
    invoke<Session[]>(IPC.SESSION_LIST, projectId, includeArchived),
  get: (id: string): Promise<Session | null> => invoke<Session | null>(IPC.SESSION_GET, id),
  create: (input: CreateSessionInput): Promise<Session> =>
    invoke<Session>(IPC.SESSION_CREATE, input),
  updateTitle: (id: string, title: string): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_UPDATE, id, title),
  setPinned: (id: string, pinned: boolean): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_PIN, id, pinned),
  setArchived: (id: string, archived: boolean): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_ARCHIVE, id, archived),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.SESSION_DELETE, id)
}
```

## Task 6.5: Create Message Service

**File path:** `src/renderer/src/services/messageService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Message, CreateMessageInput } from '@shared/db-types'

export const messageService = {
  list: (sessionId: string, limit?: number): Promise<Message[]> =>
    invoke<Message[]>(IPC.MESSAGE_LIST, sessionId, limit),
  create: (input: CreateMessageInput): Promise<Message> =>
    invoke<Message>(IPC.MESSAGE_CREATE, input),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.MESSAGE_DELETE, id)
}
```

## Task 6.6: Create Agent Service

**File path:** `src/renderer/src/services/agentService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke, subscribe } from './bridge'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import type { Agent, CreateAgentInput, AgentStatusType } from '@shared/db-types'

export const agentService = {
  list: (sessionId: string): Promise<Agent[]> => invoke<Agent[]>(IPC.AGENT_LIST, sessionId),
  get: (id: string): Promise<Agent | null> => invoke<Agent | null>(IPC.AGENT_GET, id),
  children: (parentId: string): Promise<Agent[]> => invoke<Agent[]>(IPC.AGENT_CHILDREN, parentId),
  create: (input: CreateAgentInput): Promise<Agent> => invoke<Agent>(IPC.AGENT_CREATE, input),
  updateStatus: (
    id: string,
    status: AgentStatusType,
    currentAction?: string
  ): Promise<Agent | null> =>
    invoke<Agent | null>(IPC.AGENT_UPDATE_STATUS, id, status, currentAction),

  onStatusChanged: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_STATUS_CHANGED, (...args) => cb(args[0] as Agent)),
  onSpawned: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_SPAWNED, (...args) => cb(args[0] as Agent))
}
```

## Task 6.7: Create Settings Service

**File path:** `src/renderer/src/services/settingsService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'

export const settingsService = {
  get: <T = unknown>(key: string): Promise<T | null> => invoke<T | null>(IPC.SETTINGS_GET, key),
  set: <T = unknown>(key: string, value: T): Promise<void> =>
    invoke<void>(IPC.SETTINGS_SET, key, value),
  getAll: (): Promise<Record<string, unknown>> =>
    invoke<Record<string, unknown>>(IPC.SETTINGS_GET_ALL)
}
```

## Task 6.8: Create API Key Service

**File path:** `src/renderer/src/services/apiKeyService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'

export const apiKeyService = {
  set: (provider: string, key: string): Promise<void> =>
    invoke<void>(IPC.APIKEY_SET, provider, key),
  has: (provider: string): Promise<boolean> => invoke<boolean>(IPC.APIKEY_HAS, provider),
  delete: (provider: string): Promise<boolean> => invoke<boolean>(IPC.APIKEY_DELETE, provider),
  listProviders: (): Promise<string[]> => invoke<string[]>(IPC.APIKEY_LIST_PROVIDERS)
}
```

## Task 6.9: Create Services Index

**File path:** `src/renderer/src/services/index.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export * from './bridge'
export * from './projectService'
export * from './sessionService'
export * from './messageService'
export * from './agentService'
export * from './settingsService'
export * from './apiKeyService'
```

---

# 📦 SECTION 7: IPC Smoke Test in UI

## Task 7.1: Create IPC Test Page

**File path:** `src/renderer/src/routes/IpcSmokeTest.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { projectService } from '../services'
import type { Project } from '@shared/db-types'

export default function IpcSmokeTest(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    try {
      const list = await projectService.list()
      setProjects(list)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) return
    try {
      await projectService.create({ name: name.trim() })
      setName('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await projectService.delete(id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">IPC Smoke Test</h1>
          <p className="text-text-secondary">
            Verify that the renderer can talk to the main process and database.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error">
            {error}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Create Project</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Project name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-text-tertiary">No projects yet.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border bg-bg-elevated p-3"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-text-tertiary font-mono">{p.id}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
```

## Task 7.2: Update App.tsx to Show IPC Test

**File path:** `src/renderer/src/App.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import ComponentShowcase from './routes/ComponentShowcase'
import IpcSmokeTest from './routes/IpcSmokeTest'
import { Button } from './components/ui/Button'

type Route = 'showcase' | 'ipc'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')
  const [route, setRoute] = useState<Route>('ipc')

  useEffect(() => {
    if (window.api) setAppName(window.api.appName)
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-bg-deep">
        <Button
          variant={route === 'ipc' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setRoute('ipc')}
        >
          IPC Test
        </Button>
        <Button
          variant={route === 'showcase' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setRoute('showcase')}
        >
          Components
        </Button>
      </div>
      {route === 'showcase' ? <ComponentShowcase /> : <IpcSmokeTest />}
    </div>
  )
}

export default App
```

---

# 📦 SECTION 8: Tests

## Task 8.1: Create IPC Handler Tests

**File path:** `tests/unit/ipc.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import { ipcSuccess, ipcError, unwrap } from '../../src/shared/ipc-types'

describe('IPC envelope', () => {
  it('wraps success', () => {
    const r = ipcSuccess({ id: 1 })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data).toEqual({ id: 1 })
  })

  it('wraps errors', () => {
    const r = ipcError(new Error('boom'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('boom')
  })

  it('unwrap returns data on success', () => {
    expect(unwrap(ipcSuccess(42))).toBe(42)
  })

  it('unwrap throws on error', () => {
    expect(() => unwrap(ipcError(new Error('nope')))).toThrow('nope')
  })
})
```

---

# 📦 SECTION 9: Verification

## Task 9.1: Type Check

```bash
npm run typecheck
```

## Task 9.2: Lint

```bash
npm run lint
```

## Task 9.3: Format

```bash
npm run format
```

## Task 9.4: Run Tests

```bash
npm run test:run
```

**Expected:** All tests pass.

## Task 9.5: Build

```bash
npm run build
```

## Task 9.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] App launches without errors
- [ ] "IPC Test" tab is shown by default
- [ ] Empty list initially
- [ ] Type a name in the input and click "Create"
- [ ] Project appears in the list with a `prj_` prefix
- [ ] Refresh the app (close + reopen) - project should still be there (DB persistence)
- [ ] Click "Delete" - project disappears
- [ ] Switch to "Components" tab - showcase still works
- [ ] No console errors in DevTools

---

# 📦 SECTION 10: Git Commit

```bash
git add .
git commit -m "feat: type-safe IPC layer with services (Chapter 6)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: All IPC handler files exist

```bash
ls src/main/ipc/projectHandlers.ts src/main/ipc/sessionHandlers.ts src/main/ipc/messageHandlers.ts src/main/ipc/agentHandlers.ts src/main/ipc/settingsHandlers.ts src/main/ipc/apiKeyHandlers.ts src/main/ipc/appHandlers.ts src/main/ipc/index.ts
```

## ✅ Check 2: All renderer service files exist

```bash
ls src/renderer/src/services/projectService.ts src/renderer/src/services/sessionService.ts src/renderer/src/services/messageService.ts src/renderer/src/services/agentService.ts src/renderer/src/services/settingsService.ts src/renderer/src/services/apiKeyService.ts
```

## ✅ Check 3: Shared IPC types exist

```bash
ls src/shared/ipc-channels.ts src/shared/ipc-types.ts
```

## ✅ Check 4: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 5: Lint passes

```bash
npm run lint
```

## ✅ Check 6: Tests pass

```bash
npm run test:run
```

## ✅ Check 7: Build works

```bash
npm run build
```

## ✅ Check 8: IPC creates and persists project (user confirmed)

## ✅ Check 9: Git commit

```bash
git log --oneline
```

## ✅ Check 10: No console errors during create/delete

---

# 📊 Chapter 6 Completion Report

```
✅ Chapter 6: IPC & Process Communication - COMPLETE

Acceptance Criteria Met:
✅ Centralized IPC channel constants
✅ Standard IPC result envelope (ok/error)
✅ 7 main process handler modules
✅ Type-safe preload bridge
✅ 6 renderer service modules
✅ Event broadcasting from main → renderer
✅ End-to-end project CRUD via IPC
✅ Tests passing
✅ Build works

Ready to proceed to Chapter 7: Layout System.
```

---

# 🚨 Troubleshooting

## "IPC bridge not available"

The bridge wasn't exposed on `window`. Verify preload script (Section 5) and contextIsolation is true in `window.ts`.

## "Cannot find module '@shared/...'"

Verify alias is set in BOTH `electron.vite.config.ts` AND `tsconfig.web.json` AND `tsconfig.node.json`. If missing in tsconfig, add:

```json
"paths": { "@shared/*": ["../shared/*"] }
```

Restart TypeScript server.

## Project list always empty

- Open DevTools, check console for IPC errors
- Verify main process logged "Database and IPC handlers initialized"
- Check if DB file was created (path from Chapter 4)

## "ipcRenderer is undefined"

Sandbox might be disabled. Ensure `sandbox: true` in webPreferences and that contextIsolation works.

---

**End of Chapter 6 Implementation Plan**
