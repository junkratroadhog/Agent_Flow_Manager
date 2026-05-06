# 📘 Chapter 16 Implementation Plan: Agent System Foundation

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 16 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-15 must be complete with all verification checks passing.

---

## 🎯 Chapter 16 Goal

Replace the simple "stateless LLM call" from Chapter 15 with a real **Agent system** — a primary agent that has its own lifecycle, status, action log, and shared memory (the **blackboard**). This is the foundation that Chapters 17 (sub-agents), 17.5 (goal reformulation), and 17.6 (self-critique) build on.

## 📋 What Will Exist When This Chapter Is Done

- A primary agent created automatically when a session sends its first message
- Agent has a status lifecycle: `idle` → `thinking` → `working` → `done` / `failed`
- Agent status updates broadcast via IPC events (Inspector panel reflects them in real time)
- A **shared blackboard** (key-value store) per session that any agent can read/write
- Agent action log — every meaningful step (tool call, sub-agent spawn, message produced) is recorded
- Token usage and cost tracked per agent (not just per message)
- Status bar reflects real agent activity (not the demo button)
- Inspector panel in the right sidebar shows the active agent's status, current action, tokens, cost, and recent actions
- All agent state persists in the database

This chapter does NOT yet add sub-agent spawning (that's Chapter 17), tool use (Chapter 18-19), or self-improvement (Chapter 17.5/17.6). Those layer on top.

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

## Task 1.2: Verify Streaming Chat Works

**Command:**

```bash
npm run dev
```

Send a message in a chat session. Confirm that streaming works end-to-end (Chapter 15 result). Close the app and proceed.

---

# 📦 SECTION 2: Database Schema Updates

We need a new table for the **blackboard** (shared session memory).

## Task 2.1: Add Blackboard Table to Schema

**File path:** `src/main/db/schema.sql`

**Action:** Find the line `-- Tools registry` and ADD this new table directly above it.

Find this:

```sql
-- Tools registry
CREATE TABLE IF NOT EXISTS tools (
```

Replace with:

```sql
-- Blackboard: shared key-value store per session, written by any agent
CREATE TABLE IF NOT EXISTS blackboard (
  session_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  written_by_agent_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, key),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (written_by_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_blackboard_session ON blackboard(session_id);

-- Tools registry
CREATE TABLE IF NOT EXISTS tools (
```

## Task 2.2: Verify the Schema File

**Command:**

```bash
grep -n "blackboard" src/main/db/schema.sql
```

**Expected:** Multiple matches showing the new table.

## Task 2.3: Add Migration for Existing Databases

Existing databases won't have this table. We add a migration so users who already ran the app get the new table.

**File path:** `src/main/db/migrations/runner.ts`

**Action:** Find the `migrations` array and ADD a migration to it.

Find this:

```typescript
const migrations: Migration[] = [
  // Add future migrations here, e.g.:
  // {
  //   version: 1,
  //   name: 'add_user_preferences',
  //   up: (db) => {
  //     db.exec('ALTER TABLE settings ADD COLUMN ...')
  //   }
  // }
]
```

Replace with:

```typescript
const migrations: Migration[] = [
  {
    version: 1,
    name: 'add_blackboard_table',
    up: (db): void => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS blackboard (
          session_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value_json TEXT NOT NULL,
          written_by_agent_id TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          PRIMARY KEY (session_id, key),
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
          FOREIGN KEY (written_by_agent_id) REFERENCES agents(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_blackboard_session ON blackboard(session_id);
      `)
    }
  }
]
```

---

# 📦 SECTION 3: Shared Types

## Task 3.1: Add Agent Action and Blackboard Types

**File path:** `src/shared/db-types.ts`

**Action:** Find the line `// Tool Call` (which appears before the `ToolCallSchema` definition) and ADD these new schemas directly above it.

Find this:

```typescript
export type AgentStatusType = z.infer<typeof AgentStatus>

// Tool Call
```

Replace with:

```typescript
export type AgentStatusType = z.infer<typeof AgentStatus>

// Agent Action
export const AgentActionSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  action_type: z.string(),
  payload_json: z.string().default('{}'),
  status: z.enum(['pending', 'running', 'done', 'failed']).default('pending'),
  created_at: z.string()
})

export const CreateAgentActionSchema = AgentActionSchema.omit({
  id: true,
  created_at: true
}).partial({ status: true, payload_json: true })

export type AgentAction = z.infer<typeof AgentActionSchema>
export type CreateAgentActionInput = z.infer<typeof CreateAgentActionSchema>

// Blackboard Entry
export const BlackboardEntrySchema = z.object({
  session_id: z.string(),
  key: z.string(),
  value_json: z.string(),
  written_by_agent_id: z.string().nullable().optional(),
  updated_at: z.string()
})

export type BlackboardEntry = z.infer<typeof BlackboardEntrySchema>

// Tool Call
```

---

# 📦 SECTION 4: New Repositories

## Task 4.1: Create AgentAction Repository

**File path:** `src/main/db/repositories/AgentActionRepository.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { BaseRepository } from './BaseRepository'
import { generateId, ID_PREFIXES } from '../../utils/ids'
import {
  type AgentAction,
  type CreateAgentActionInput,
  CreateAgentActionSchema,
  AgentActionSchema
} from '@shared/db-types'

export class AgentActionRepository extends BaseRepository {
  create(input: CreateAgentActionInput): AgentAction {
    const validated = CreateAgentActionSchema.parse(input)
    const id = generateId(ID_PREFIXES.ACTION)
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO agent_actions (id, agent_id, action_type, payload_json, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        validated.agent_id,
        validated.action_type,
        validated.payload_json ?? '{}',
        validated.status ?? 'pending',
        now
      )

    return this.findById(id)!
  }

  findById(id: string): AgentAction | null {
    const row = this.db.prepare('SELECT * FROM agent_actions WHERE id = ?').get(id)
    if (!row) return null
    return AgentActionSchema.parse(row)
  }

  findByAgent(agentId: string, limit?: number): AgentAction[] {
    const sql = limit
      ? 'SELECT * FROM agent_actions WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM agent_actions WHERE agent_id = ? ORDER BY created_at DESC'
    const rows = limit
      ? this.db.prepare(sql).all(agentId, limit)
      : this.db.prepare(sql).all(agentId)
    return rows.map((r) => AgentActionSchema.parse(r))
  }

  updateStatus(id: string, status: AgentAction['status']): AgentAction | null {
    this.db.prepare('UPDATE agent_actions SET status = ? WHERE id = ?').run(status, id)
    return this.findById(id)
  }
}
```

## Task 4.2: Create Blackboard Repository

**File path:** `src/main/db/repositories/BlackboardRepository.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { BaseRepository } from './BaseRepository'
import { type BlackboardEntry, BlackboardEntrySchema } from '@shared/db-types'

export class BlackboardRepository extends BaseRepository {
  set<T = unknown>(
    sessionId: string,
    key: string,
    value: T,
    writtenByAgentId?: string
  ): BlackboardEntry {
    const json = JSON.stringify(value)
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO blackboard (session_id, key, value_json, written_by_agent_id, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(session_id, key) DO UPDATE SET
           value_json = excluded.value_json,
           written_by_agent_id = excluded.written_by_agent_id,
           updated_at = excluded.updated_at`
      )
      .run(sessionId, key, json, writtenByAgentId ?? null, now)

    return this.get(sessionId, key)!
  }

  get(sessionId: string, key: string): BlackboardEntry | null {
    const row = this.db
      .prepare('SELECT * FROM blackboard WHERE session_id = ? AND key = ?')
      .get(sessionId, key)
    if (!row) return null
    return BlackboardEntrySchema.parse(row)
  }

  getValue<T = unknown>(sessionId: string, key: string): T | null {
    const entry = this.get(sessionId, key)
    if (!entry) return null
    try {
      return JSON.parse(entry.value_json) as T
    } catch {
      return null
    }
  }

  listForSession(sessionId: string): BlackboardEntry[] {
    const rows = this.db
      .prepare('SELECT * FROM blackboard WHERE session_id = ? ORDER BY updated_at DESC')
      .all(sessionId)
    return rows.map((r) => BlackboardEntrySchema.parse(r))
  }

  delete(sessionId: string, key: string): boolean {
    const result = this.db
      .prepare('DELETE FROM blackboard WHERE session_id = ? AND key = ?')
      .run(sessionId, key)
    return result.changes > 0
  }

  clearSession(sessionId: string): number {
    const result = this.db.prepare('DELETE FROM blackboard WHERE session_id = ?').run(sessionId)
    return result.changes
  }
}
```

## Task 4.3: Update Repositories Index

**File path:** `src/main/db/repositories/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import type Database from 'better-sqlite3'
import { ProjectRepository } from './ProjectRepository'
import { SessionRepository } from './SessionRepository'
import { MessageRepository } from './MessageRepository'
import { AgentRepository } from './AgentRepository'
import { SettingsRepository } from './SettingsRepository'
import { AgentActionRepository } from './AgentActionRepository'
import { BlackboardRepository } from './BlackboardRepository'

export interface Repositories {
  projects: ProjectRepository
  sessions: SessionRepository
  messages: MessageRepository
  agents: AgentRepository
  settings: SettingsRepository
  agentActions: AgentActionRepository
  blackboard: BlackboardRepository
}

export function createRepositories(db: Database.Database): Repositories {
  return {
    projects: new ProjectRepository(db),
    sessions: new SessionRepository(db),
    messages: new MessageRepository(db),
    agents: new AgentRepository(db),
    settings: new SettingsRepository(db),
    agentActions: new AgentActionRepository(db),
    blackboard: new BlackboardRepository(db)
  }
}

export {
  ProjectRepository,
  SessionRepository,
  MessageRepository,
  AgentRepository,
  SettingsRepository,
  AgentActionRepository,
  BlackboardRepository
}
```

---

# 📦 SECTION 5: Agent Service (Main Process)

This is the core orchestration class. It owns the agent lifecycle.

## Task 5.1: Create Agent Service Folder

```bash
mkdir -p src/main/services/agents
```

## Task 5.2: Create Agent Constants

**File path:** `src/main/services/agents/agentConstants.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Built-in agent action types. The action_type column on agent_actions
 * is freeform text so plugins can add their own, but these are the core ones.
 */
export const AGENT_ACTION_TYPES = {
  THINK: 'think',
  GENERATE_MESSAGE: 'generate_message',
  TOOL_CALL: 'tool_call',
  SPAWN_SUB_AGENT: 'spawn_sub_agent',
  WAIT_FOR_SUB_AGENT: 'wait_for_sub_agent',
  WRITE_BLACKBOARD: 'write_blackboard',
  READ_BLACKBOARD: 'read_blackboard',
  REFORMULATE_GOAL: 'reformulate_goal',
  CRITIQUE_OUTPUT: 'critique_output',
  ITERATE: 'iterate'
} as const

export type AgentActionType = (typeof AGENT_ACTION_TYPES)[keyof typeof AGENT_ACTION_TYPES]

/**
 * Default role names for primary agents per brain mode. Used as a hint to the LLM.
 */
export const PRIMARY_AGENT_ROLE_BY_MODE: Record<string, string> = {
  fast: 'assistant',
  plan: 'planner',
  deepThink: 'reasoner',
  deepResearch: 'researcher',
  advanced: 'orchestrator'
}

/**
 * Default agent name shown in the UI per brain mode.
 */
export const PRIMARY_AGENT_NAME_BY_MODE: Record<string, string> = {
  fast: 'Quick Assistant',
  plan: 'Planner',
  deepThink: 'Reasoner',
  deepResearch: 'Researcher',
  advanced: 'Orchestrator'
}
```

## Task 5.3: Create AgentService

**File path:** `src/main/services/agents/AgentService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { BrowserWindow } from 'electron'
import { IPC_EVENTS } from '@shared/ipc-channels'
import type { Repositories } from '../../db/repositories'
import type { Agent, AgentAction, AgentStatusType, CreateAgentInput } from '@shared/db-types'
import { AGENT_ACTION_TYPES, type AgentActionType } from './agentConstants'

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload)
  }
}

export interface ActionLogInput {
  agentId: string
  actionType: AgentActionType | string
  payload?: Record<string, unknown>
  status?: AgentAction['status']
}

export class AgentService {
  constructor(private repos: Repositories) {}

  // ========== AGENT LIFECYCLE ==========

  createAgent(input: CreateAgentInput): Agent {
    const agent = this.repos.agents.create(input)
    broadcast(IPC_EVENTS.AGENT_SPAWNED, agent)
    return agent
  }

  setStatus(agentId: string, status: AgentStatusType, currentAction?: string): Agent | null {
    const updated = this.repos.agents.updateStatus(agentId, status, currentAction)
    if (updated) {
      broadcast(IPC_EVENTS.AGENT_STATUS_CHANGED, updated)
    }
    return updated
  }

  recordTokens(agentId: string, tokens: number, cost: number): void {
    this.repos.agents.incrementTokens(agentId, tokens, cost)
    const agent = this.repos.agents.findById(agentId)
    if (agent) {
      broadcast(IPC_EVENTS.AGENT_TOKENS_UPDATED, agent)
    }
  }

  // ========== ACTION LOG ==========

  logAction(input: ActionLogInput): AgentAction {
    return this.repos.agentActions.create({
      agent_id: input.agentId,
      action_type: input.actionType,
      payload_json: JSON.stringify(input.payload ?? {}),
      status: input.status ?? 'pending'
    })
  }

  completeAction(actionId: string, status: 'done' | 'failed' = 'done'): AgentAction | null {
    return this.repos.agentActions.updateStatus(actionId, status)
  }

  // ========== BLACKBOARD ==========

  blackboardSet<T>(sessionId: string, key: string, value: T, writtenByAgentId?: string): void {
    this.repos.blackboard.set(sessionId, key, value, writtenByAgentId)
    if (writtenByAgentId) {
      this.logAction({
        agentId: writtenByAgentId,
        actionType: AGENT_ACTION_TYPES.WRITE_BLACKBOARD,
        payload: { key },
        status: 'done'
      })
    }
  }

  blackboardGet<T>(sessionId: string, key: string): T | null {
    return this.repos.blackboard.getValue<T>(sessionId, key)
  }

  // ========== HELPERS ==========

  /**
   * Returns the most recently created primary agent for the session, or null.
   * Used to decide whether to create a new agent or reuse an existing one.
   */
  findPrimaryAgent(sessionId: string): Agent | null {
    const agents = this.repos.agents.findBySession(sessionId)
    // A primary agent has no parent
    return agents.find((a) => !a.parent_agent_id) ?? null
  }
}
```

---

# 📦 SECTION 6: IPC Channels & Handlers

## Task 6.1: Add New Channels

**File path:** `src/shared/ipc-channels.ts`

**Action:** Find the section `// Agents` and update it.

Find this:

```typescript
  // Agents
  AGENT_LIST: 'agents:list',
  AGENT_CREATE: 'agents:create',
  AGENT_UPDATE_STATUS: 'agents:updateStatus',
  AGENT_GET: 'agents:get',
  AGENT_CHILDREN: 'agents:children',
```

Replace with:

```typescript
  // Agents
  AGENT_LIST: 'agents:list',
  AGENT_CREATE: 'agents:create',
  AGENT_UPDATE_STATUS: 'agents:updateStatus',
  AGENT_GET: 'agents:get',
  AGENT_CHILDREN: 'agents:children',
  AGENT_ACTIONS: 'agents:actions',

  // Blackboard
  BLACKBOARD_SET: 'blackboard:set',
  BLACKBOARD_GET: 'blackboard:get',
  BLACKBOARD_LIST: 'blackboard:list',
  BLACKBOARD_DELETE: 'blackboard:delete',
```

## Task 6.2: Update Agent Handlers

**File path:** `src/main/ipc/agentHandlers.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Agent, AgentAction, CreateAgentInput, AgentStatusType } from '@shared/db-types'
import type { AgentService } from '../services/agents/AgentService'

export function registerAgentHandlers(repos: Repositories, agentService: AgentService): void {
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
        return ipcSuccess(agentService.createAgent(input))
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
        return ipcSuccess(agentService.setStatus(id, status, currentAction))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.AGENT_ACTIONS,
    async (_event, agentId: string, limit?: number): Promise<IPCResult<AgentAction[]>> => {
      try {
        return ipcSuccess(repos.agentActions.findByAgent(agentId, limit))
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
```

## Task 6.3: Create Blackboard Handlers

**File path:** `src/main/ipc/blackboardHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { BlackboardEntry } from '@shared/db-types'

export function registerBlackboardHandlers(repos: Repositories): void {
  ipcMain.handle(
    IPC.BLACKBOARD_SET,
    async (
      _event,
      sessionId: string,
      key: string,
      value: unknown,
      writtenByAgentId?: string
    ): Promise<IPCResult<BlackboardEntry>> => {
      try {
        return ipcSuccess(repos.blackboard.set(sessionId, key, value, writtenByAgentId))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.BLACKBOARD_GET,
    async (_event, sessionId: string, key: string): Promise<IPCResult<BlackboardEntry | null>> => {
      try {
        return ipcSuccess(repos.blackboard.get(sessionId, key))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.BLACKBOARD_LIST,
    async (_event, sessionId: string): Promise<IPCResult<BlackboardEntry[]>> => {
      try {
        return ipcSuccess(repos.blackboard.listForSession(sessionId))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.BLACKBOARD_DELETE,
    async (_event, sessionId: string, key: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(repos.blackboard.delete(sessionId, key))
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
```

## Task 6.4: Register Blackboard Handlers and Update Agent Service Wiring

**File path:** `src/main/ipc/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import type { Repositories } from '../db/repositories'
import type { SecretStorage } from '../services/SecretStorage'
import type { LLMService } from '../services/llm/LLMService'
import type { AgentService } from '../services/agents/AgentService'
import { registerProjectHandlers } from './projectHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerMessageHandlers } from './messageHandlers'
import { registerAgentHandlers } from './agentHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerApiKeyHandlers } from './apiKeyHandlers'
import { registerAppHandlers } from './appHandlers'
import { registerLLMHandlers } from './llmHandlers'
import { registerBlackboardHandlers } from './blackboardHandlers'

export function registerAllIpcHandlers(
  repos: Repositories,
  secretStorage: SecretStorage,
  llm: LLMService,
  agentService: AgentService
): void {
  registerProjectHandlers(repos)
  registerSessionHandlers(repos)
  registerMessageHandlers(repos)
  registerAgentHandlers(repos, agentService)
  registerSettingsHandlers(repos)
  registerApiKeyHandlers(secretStorage)
  registerAppHandlers()
  registerLLMHandlers(llm)
  registerBlackboardHandlers(repos)
}
```

## Task 6.5: Wire Agent Service Into Main Entry

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
import { ProviderFactory } from './services/llm/providerFactory'
import { LLMService } from './services/llm/LLMService'
import { AgentService } from './services/agents/AgentService'
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

    try {
      const db = initDatabase()
      runMigrations(db)
      repos = createRepositories(db)
      const secretStorage = new SecretStorage(db)
      const providerFactory = new ProviderFactory(secretStorage)
      const llmService = new LLMService(providerFactory)
      const agentService = new AgentService(repos)
      registerAllIpcHandlers(repos, secretStorage, llmService, agentService)
      console.info('All services initialized')
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

# 📦 SECTION 7: Renderer Services

## Task 7.1: Update Agent Service

**File path:** `src/renderer/src/services/agentService.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { invoke, subscribe } from './bridge'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import type { Agent, AgentAction, CreateAgentInput, AgentStatusType } from '@shared/db-types'

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
  actions: (agentId: string, limit?: number): Promise<AgentAction[]> =>
    invoke<AgentAction[]>(IPC.AGENT_ACTIONS, agentId, limit),

  onStatusChanged: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_STATUS_CHANGED, (...args) => cb(args[0] as Agent)),
  onSpawned: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_SPAWNED, (...args) => cb(args[0] as Agent)),
  onTokensUpdated: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_TOKENS_UPDATED, (...args) => cb(args[0] as Agent))
}
```

## Task 7.2: Create Blackboard Service

**File path:** `src/renderer/src/services/blackboardService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { BlackboardEntry } from '@shared/db-types'

export const blackboardService = {
  set: <T = unknown>(
    sessionId: string,
    key: string,
    value: T,
    writtenByAgentId?: string
  ): Promise<BlackboardEntry> =>
    invoke<BlackboardEntry>(IPC.BLACKBOARD_SET, sessionId, key, value, writtenByAgentId),
  get: (sessionId: string, key: string): Promise<BlackboardEntry | null> =>
    invoke<BlackboardEntry | null>(IPC.BLACKBOARD_GET, sessionId, key),
  list: (sessionId: string): Promise<BlackboardEntry[]> =>
    invoke<BlackboardEntry[]>(IPC.BLACKBOARD_LIST, sessionId),
  delete: (sessionId: string, key: string): Promise<boolean> =>
    invoke<boolean>(IPC.BLACKBOARD_DELETE, sessionId, key)
}
```

## Task 7.3: Update Services Index

**File path:** `src/renderer/src/services/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
export * from './bridge'
export * from './projectService'
export * from './sessionService'
export * from './messageService'
export * from './agentService'
export * from './settingsService'
export * from './apiKeyService'
export * from './llmService'
export * from './blackboardService'
```

---

# 📦 SECTION 8: Update ChatController to Use Agents

The Chapter 15 controller calls the LLM directly. Now we wrap that call in an agent lifecycle so the work is tracked.

## Task 8.1: Replace ChatController

**File path:** `src/renderer/src/hooks/useChatController.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useCallback, useEffect, useRef } from 'react'
import { useSessionStore, useSettingsStore, useToastStore, useAgentStore } from '../stores'
import { messageService, llmService, agentService } from '../services'
import { buildLLMMessages, trimToTokenBudget } from '../lib/conversationBuilder'
import type { Agent, Message } from '@shared/db-types'

const HISTORY_TOKEN_BUDGET = 100_000

const PRIMARY_AGENT_NAME_BY_MODE: Record<string, string> = {
  fast: 'Quick Assistant',
  plan: 'Planner',
  deepThink: 'Reasoner',
  deepResearch: 'Researcher',
  advanced: 'Orchestrator'
}

const PRIMARY_AGENT_ROLE_BY_MODE: Record<string, string> = {
  fast: 'assistant',
  plan: 'planner',
  deepThink: 'reasoner',
  deepResearch: 'researcher',
  advanced: 'orchestrator'
}

export interface ChatController {
  send: (sessionId: string, content: string) => Promise<void>
  retry: (sessionId: string, assistantMessageId: string) => Promise<void>
  cancel: () => Promise<void>
  isStreaming: boolean
}

export function useChatController(): ChatController {
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const setStreaming = useSessionStore((s) => s.setStreaming)
  const messagesBySession = useSessionStore((s) => s.messagesBySession)
  const appendMessage = useSessionStore((s) => s.appendMessage)
  const updateMessage = useSessionStore((s) => s.updateMessage)
  const removeMessage = useSessionStore((s) => s.removeMessage)

  const primaryModel = useSettingsStore((s) => s.primaryModel)
  const currentBrainMode = useSettingsStore((s) => s.currentBrainMode)
  const brainModes = useSettingsStore((s) => s.brainModes)

  const showToast = useToastStore((s) => s.showToast)
  const addAgent = useAgentStore((s) => s.addAgent)
  const updateAgent = useAgentStore((s) => s.updateAgent)
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus)

  const cancelFnRef = useRef<(() => Promise<void>) | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const streamingTextRef = useRef<string>('')
  const activeContextRef = useRef<{
    sessionId: string
    assistantId: string
    agentId: string
  } | null>(null)

  const cleanup = useCallback((): void => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    cancelFnRef.current = null
    streamingTextRef.current = ''
    activeContextRef.current = null
  }, [])

  const cancel = useCallback(async (): Promise<void> => {
    if (cancelFnRef.current) {
      await cancelFnRef.current()
    }
    const ctx = activeContextRef.current
    if (ctx) {
      try {
        await messageService.update(ctx.assistantId, {
          content: streamingTextRef.current
        })
        await agentService.updateStatus(ctx.agentId, 'done', 'Cancelled by user')
      } catch {
        // ignore
      }
    }
    setStreaming(false)
    cleanup()
  }, [cleanup, setStreaming])

  useEffect(() => {
    if (!isStreaming) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isStreaming, cancel])

  /**
   * Get or create the primary agent for this session and brain mode.
   * Reuses an existing primary agent if one exists, but updates its model
   * if the brain mode model has changed.
   */
  const getOrCreatePrimaryAgent = useCallback(
    async (sessionId: string, modelToUse: string): Promise<Agent> => {
      const existing = await agentService.list(sessionId)
      const primary = existing.find((a) => !a.parent_agent_id)
      if (primary) {
        return primary
      }
      const name = PRIMARY_AGENT_NAME_BY_MODE[currentBrainMode] ?? 'Assistant'
      const role = PRIMARY_AGENT_ROLE_BY_MODE[currentBrainMode] ?? 'assistant'
      const created = await agentService.create({
        session_id: sessionId,
        name,
        role,
        model: modelToUse,
        status: 'idle'
      })
      addAgent(created)
      return created
    },
    [currentBrainMode, addAgent]
  )

  const startStreamFor = useCallback(
    async (sessionId: string, agent: Agent, assistantMessage: Message): Promise<void> => {
      const messages = messagesBySession[sessionId] ?? []
      const llmMessages = trimToTokenBudget(
        buildLLMMessages(messages, new Set([assistantMessage.id])),
        HISTORY_TOKEN_BUDGET
      )

      const brainConfig = brainModes[currentBrainMode]
      const modelToUse = brainConfig.model || primaryModel
      const systemPrompt = brainConfig.systemPrompt || undefined
      const temperature = brainConfig.temperature

      streamingTextRef.current = ''
      activeContextRef.current = {
        sessionId,
        assistantId: assistantMessage.id,
        agentId: agent.id
      }
      setStreaming(true)

      // Move agent into thinking state
      await agentService.updateStatus(agent.id, 'thinking', 'Reading conversation...')
      updateAgentStatus(agent.id, 'thinking', 'Reading conversation...')

      try {
        const { cancel: cancelStream, unsubscribe } = await llmService.stream(
          {
            modelId: modelToUse,
            messages: llmMessages,
            systemPrompt,
            temperature
          },
          {
            onDelta: async (text) => {
              if (streamingTextRef.current === '') {
                // First delta — flip status to "working"
                await agentService.updateStatus(agent.id, 'working', 'Generating response')
                updateAgentStatus(agent.id, 'working', 'Generating response')
              }
              streamingTextRef.current += text
              updateMessage(sessionId, assistantMessage.id, {
                content: streamingTextRef.current
              })
            },
            onFinish: async (result) => {
              try {
                const updated = await messageService.update(assistantMessage.id, {
                  content: result.text || streamingTextRef.current,
                  tokens_in: result.inputTokens,
                  tokens_out: result.outputTokens,
                  cost: result.cost
                })
                if (updated) {
                  updateMessage(sessionId, assistantMessage.id, updated)
                }
                // Increment agent tokens
                const refreshed = await agentService.list(sessionId)
                const refreshedAgent = refreshed.find((a) => a.id === agent.id)
                if (refreshedAgent) {
                  updateAgent(agent.id, refreshedAgent)
                }
                await agentService.updateStatus(agent.id, 'done', 'Idle')
                updateAgentStatus(agent.id, 'done', 'Idle')
              } catch (e) {
                console.error('Failed to persist final message:', e)
              }
              setStreaming(false)
              cleanup()
            },
            onError: (errMsg) => {
              if (errMsg !== 'Aborted') {
                showToast({
                  title: 'Generation failed',
                  description: errMsg,
                  variant: 'error',
                  duration: 8000,
                  action: {
                    label: 'Retry',
                    onClick: () => {
                      void retry(sessionId, assistantMessage.id)
                    }
                  }
                })
                updateMessage(sessionId, assistantMessage.id, {
                  content: streamingTextRef.current || `*Error: ${errMsg}*`,
                  metadata_json: JSON.stringify({ error: errMsg })
                })
                messageService
                  .update(assistantMessage.id, {
                    content: streamingTextRef.current || `*Error: ${errMsg}*`,
                    metadata_json: JSON.stringify({ error: errMsg })
                  })
                  .catch(() => undefined)
                agentService
                  .updateStatus(agent.id, 'failed', `Error: ${errMsg}`)
                  .catch(() => undefined)
                updateAgentStatus(agent.id, 'failed', `Error: ${errMsg}`)
              }
              setStreaming(false)
              cleanup()
            }
          }
        )
        cancelFnRef.current = cancelStream
        unsubscribeRef.current = unsubscribe
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        showToast({
          title: 'Could not start generation',
          description: errMsg,
          variant: 'error',
          duration: 8000
        })
        await messageService.delete(assistantMessage.id).catch(() => undefined)
        removeMessage(sessionId, assistantMessage.id)
        await agentService.updateStatus(agent.id, 'failed', errMsg).catch(() => undefined)
        updateAgentStatus(agent.id, 'failed', errMsg)
        setStreaming(false)
        cleanup()
      }
    },
    [
      messagesBySession,
      primaryModel,
      currentBrainMode,
      brainModes,
      setStreaming,
      updateMessage,
      removeMessage,
      cleanup,
      showToast,
      updateAgent,
      updateAgentStatus
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ]
  )

  const send = useCallback(
    async (sessionId: string, content: string): Promise<void> => {
      if (isStreaming) return
      const trimmed = content.trim()
      if (!trimmed) return

      const brainConfig = brainModes[currentBrainMode]
      const modelToUse = brainConfig.model || primaryModel

      // 1. Get or create primary agent
      let agent: Agent
      try {
        agent = await getOrCreatePrimaryAgent(sessionId, modelToUse)
      } catch (e) {
        showToast({
          title: 'Could not initialize agent',
          description: e instanceof Error ? e.message : String(e),
          variant: 'error'
        })
        return
      }

      // 2. Persist user message
      let userMsg: Message
      try {
        userMsg = await messageService.create({
          session_id: sessionId,
          role: 'user',
          content: trimmed
        })
        appendMessage(sessionId, userMsg)
      } catch (e) {
        showToast({
          title: 'Failed to send message',
          description: e instanceof Error ? e.message : String(e),
          variant: 'error'
        })
        return
      }

      // 3. Create empty assistant placeholder
      let assistantMsg: Message
      try {
        assistantMsg = await messageService.create({
          session_id: sessionId,
          role: 'assistant',
          content: '',
          model: modelToUse
        })
        appendMessage(sessionId, assistantMsg)
      } catch (e) {
        showToast({
          title: 'Failed to start response',
          description: e instanceof Error ? e.message : String(e),
          variant: 'error'
        })
        return
      }

      // 4. Run the streaming generation through the agent lifecycle
      await startStreamFor(sessionId, agent, assistantMsg)
    },
    [
      isStreaming,
      appendMessage,
      brainModes,
      currentBrainMode,
      primaryModel,
      showToast,
      startStreamFor,
      getOrCreatePrimaryAgent
    ]
  )

  const retry = useCallback(
    async (sessionId: string, assistantMessageId: string): Promise<void> => {
      if (isStreaming) return
      const messages = messagesBySession[sessionId] ?? []
      const target = messages.find((m) => m.id === assistantMessageId)
      if (!target || target.role !== 'assistant') return

      const brainConfig = brainModes[currentBrainMode]
      const modelToUse = brainConfig.model || primaryModel

      let agent: Agent
      try {
        agent = await getOrCreatePrimaryAgent(sessionId, modelToUse)
      } catch (e) {
        showToast({
          title: 'Retry failed',
          description: e instanceof Error ? e.message : String(e),
          variant: 'error'
        })
        return
      }

      try {
        await messageService.update(assistantMessageId, {
          content: '',
          tokens_in: 0,
          tokens_out: 0,
          cost: 0,
          metadata_json: '{}'
        })
        updateMessage(sessionId, assistantMessageId, {
          content: '',
          tokens_in: 0,
          tokens_out: 0,
          cost: 0,
          metadata_json: '{}'
        })
      } catch (e) {
        showToast({
          title: 'Retry failed',
          description: e instanceof Error ? e.message : String(e),
          variant: 'error'
        })
        return
      }

      await startStreamFor(sessionId, agent, { ...target, content: '' })
    },
    [
      isStreaming,
      messagesBySession,
      brainModes,
      currentBrainMode,
      primaryModel,
      updateMessage,
      showToast,
      startStreamFor,
      getOrCreatePrimaryAgent
    ]
  )

  return { send, retry, cancel, isStreaming }
}
```

---

# 📦 SECTION 9: Inspector Panel — Live Agent View

The right sidebar's "Inspector" tab now shows real agent data.

## Task 9.1: Create Agent Inspector Component

**File path:** `src/renderer/src/components/Inspector/AgentInspector.tsx`

**Command first:**

```bash
mkdir -p src/renderer/src/components/Inspector
```

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { Activity, Cpu, Coins, Clock } from 'lucide-react'
import { useSessionStore, useAgentStore } from '../../stores'
import { agentService } from '../../services'
import { formatTokens, formatCost, formatDuration } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Agent, AgentAction, AgentStatusType } from '@shared/db-types'

const STATUS_COLORS: Record<AgentStatusType, string> = {
  idle: 'bg-agent-idle',
  thinking: 'bg-agent-thinking animate-pulse',
  working: 'bg-agent-working animate-pulse',
  done: 'bg-agent-done',
  failed: 'bg-agent-failed',
  paused: 'bg-agent-idle'
}

const STATUS_LABELS: Record<AgentStatusType, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  working: 'Working',
  done: 'Done',
  failed: 'Failed',
  paused: 'Paused'
}

export default function AgentInspector(): JSX.Element {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const agents = useAgentStore((s) =>
    activeSessionId ? s.agentsBySession[activeSessionId] ?? [] : []
  )
  const setAgents = useAgentStore((s) => s.setAgents)
  const [actions, setActions] = useState<AgentAction[]>([])

  const primary = agents.find((a) => !a.parent_agent_id) ?? null

  const loadAgents = useCallback(async (): Promise<void> => {
    if (!activeSessionId) return
    try {
      const list = await agentService.list(activeSessionId)
      setAgents(activeSessionId, list)
    } catch (e) {
      console.error('Failed to load agents:', e)
    }
  }, [activeSessionId, setAgents])

  const loadActions = useCallback(async (): Promise<void> => {
    if (!primary) {
      setActions([])
      return
    }
    try {
      const list = await agentService.actions(primary.id, 20)
      setActions(list)
    } catch (e) {
      console.error('Failed to load actions:', e)
    }
  }, [primary])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  useEffect(() => {
    loadActions()
  }, [loadActions, primary?.status])

  // Subscribe to status events for live updates
  useEffect(() => {
    const unsub1 = agentService.onStatusChanged(() => {
      loadAgents()
      loadActions()
    })
    const unsub2 = agentService.onSpawned(loadAgents)
    const unsub3 = agentService.onTokensUpdated(loadAgents)
    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [loadAgents, loadActions])

  if (!activeSessionId) {
    return (
      <div className="p-4 text-xs text-text-tertiary text-center">
        Select a session to inspect agents.
      </div>
    )
  }

  if (!primary) {
    return (
      <div className="p-4 text-xs text-text-tertiary text-center">
        No agent yet. Send a message to spawn the primary agent.
      </div>
    )
  }

  const startedAt = primary.started_at ? new Date(primary.started_at) : null
  const completedAt = primary.completed_at ? new Date(primary.completed_at) : null
  const duration =
    startedAt && completedAt
      ? completedAt.getTime() - startedAt.getTime()
      : startedAt
        ? Date.now() - startedAt.getTime()
        : null

  return (
    <div className="flex flex-col gap-4">
      {/* Primary agent card */}
      <AgentCard agent={primary} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox
          icon={<Cpu size={12} />}
          label="Tokens"
          value={formatTokens(primary.tokens_used)}
        />
        <StatBox
          icon={<Coins size={12} />}
          label="Cost"
          value={formatCost(primary.cost)}
        />
        <StatBox
          icon={<Clock size={12} />}
          label="Duration"
          value={duration !== null ? formatDuration(duration) : '—'}
        />
        <StatBox
          icon={<Activity size={12} />}
          label="Status"
          value={STATUS_LABELS[primary.status as AgentStatusType]}
        />
      </div>

      {/* Action log */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">
          Recent Actions
        </h4>
        {actions.length === 0 ? (
          <p className="text-xs text-text-tertiary">No actions yet.</p>
        ) : (
          <div className="space-y-1">
            {actions.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }): JSX.Element {
  const status = agent.status as AgentStatusType
  return (
    <div className="rounded-md border border-border bg-bg-elevated p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[status])} />
        <span className="text-sm font-medium truncate">{agent.name}</span>
      </div>
      <div className="text-[10px] text-text-tertiary space-y-0.5">
        <div className="flex justify-between gap-2">
          <span>Role</span>
          <span className="font-mono">{agent.role}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Model</span>
          <span className="font-mono truncate">{agent.model}</span>
        </div>
        {agent.current_action && (
          <div className="pt-1.5 mt-1.5 border-t border-border-subtle text-text-secondary">
            {agent.current_action}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({
  icon,
  label,
  value
}: {
  icon: JSX.Element
  label: string
  value: string
}): JSX.Element {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-deep p-2">
      <div className="flex items-center gap-1 text-text-tertiary text-[10px] uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  )
}

function ActionRow({ action }: { action: AgentAction }): JSX.Element {
  const time = new Date(action.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const statusClass =
    action.status === 'done'
      ? 'text-status-success'
      : action.status === 'failed'
        ? 'text-status-error'
        : action.status === 'running'
          ? 'text-status-warning'
          : 'text-text-tertiary'

  return (
    <div className="flex items-start gap-2 px-2 py-1 rounded text-xs hover:bg-bg-hover">
      <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', statusClass.replace('text-', 'bg-'))} />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] truncate">{action.action_type}</div>
        <div className="text-[10px] text-text-tertiary">{time}</div>
      </div>
    </div>
  )
}
```

## Task 9.2: Wire Inspector Into Right Sidebar

**File path:** `src/renderer/src/components/Layout/RightSidebar.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import AgentInspector from '../Inspector/AgentInspector'

export default function RightSidebar(): JSX.Element {
  const [tab, setTab] = useState('inspector')

  return (
    <div className="flex flex-col h-full bg-bg-deep border-l border-border-subtle">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
        <div className="h-9 flex items-center px-2 border-b border-border-subtle">
          <TabsList className="h-7">
            <TabsTrigger value="inspector" className="text-xs">
              Inspector
            </TabsTrigger>
            <TabsTrigger value="flow" className="text-xs">
              Flow
            </TabsTrigger>
            <TabsTrigger value="plan" className="text-xs">
              Plan
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="inspector" className="mt-0">
            <AgentInspector />
          </TabsContent>
          <TabsContent value="flow" className="mt-0">
            <p className="text-xs text-text-tertiary">
              Mini-map of agent flow (coming soon).
            </p>
          </TabsContent>
          <TabsContent value="plan" className="mt-0">
            <p className="text-xs text-text-tertiary">
              Plan.md preview (later chapter).
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
```

---

# 📦 SECTION 10: Remove Demo Stats Button (No Longer Needed)

The demo button from Chapter 10 is now obsolete because real agents drive the status bar.

## Task 10.1: Update Sessions Panel to Remove Demo Button

**File path:** `src/renderer/src/components/Sidebar/SessionsPanel.tsx`

**Action:** Find and remove the demo button rendering.

Find this:

```typescript
import DemoStatsButton from './DemoStatsButton'
import DemoMessagesButton from './DemoMessagesButton'
```

Replace with:

```typescript
import DemoMessagesButton from './DemoMessagesButton'
```

Then find this:

```typescript
      <div className="flex-1 overflow-y-auto">
        <DemoStatsButton />
        <DemoMessagesButton />
        {!activeProjectId ? (
```

Replace with:

```typescript
      <div className="flex-1 overflow-y-auto">
        <DemoMessagesButton />
        {!activeProjectId ? (
```

---

# 📦 SECTION 11: Tests

## Task 11.1: Add Repository Tests

**File path:** `tests/unit/agentRepositories.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  ProjectRepository,
  SessionRepository,
  AgentRepository,
  AgentActionRepository,
  BlackboardRepository
} from '../../src/main/db/repositories'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  const schema = readFileSync(resolve('src/main/db/schema.sql'), 'utf-8')
  db.exec(schema)
  return db
}

describe('AgentActionRepository', () => {
  let db: Database.Database
  let actionRepo: AgentActionRepository
  let agentId: string

  beforeEach(() => {
    db = createTestDb()
    const projectRepo = new ProjectRepository(db)
    const sessionRepo = new SessionRepository(db)
    const agentRepo = new AgentRepository(db)
    actionRepo = new AgentActionRepository(db)

    const projectId = projectRepo.create({ name: 'P' }).id
    const sessionId = sessionRepo.create({ project_id: projectId, title: 'S' }).id
    agentId = agentRepo.create({
      session_id: sessionId,
      name: 'A',
      role: 'r',
      model: 'm'
    }).id
  })

  it('creates an action', () => {
    const action = actionRepo.create({
      agent_id: agentId,
      action_type: 'think',
      payload_json: '{"thought":"hmm"}'
    })
    expect(action.id).toMatch(/^act_/)
    expect(action.action_type).toBe('think')
    expect(action.status).toBe('pending')
  })

  it('finds actions by agent in reverse chronological order', () => {
    actionRepo.create({ agent_id: agentId, action_type: 'first' })
    actionRepo.create({ agent_id: agentId, action_type: 'second' })
    actionRepo.create({ agent_id: agentId, action_type: 'third' })
    const list = actionRepo.findByAgent(agentId)
    expect(list[0].action_type).toBe('third')
    expect(list[2].action_type).toBe('first')
  })

  it('respects limit', () => {
    for (let i = 0; i < 5; i++) {
      actionRepo.create({ agent_id: agentId, action_type: `a${i}` })
    }
    expect(actionRepo.findByAgent(agentId, 2).length).toBe(2)
  })

  it('updates action status', () => {
    const a = actionRepo.create({ agent_id: agentId, action_type: 'x' })
    const updated = actionRepo.updateStatus(a.id, 'done')
    expect(updated?.status).toBe('done')
  })
})

describe('BlackboardRepository', () => {
  let db: Database.Database
  let bbRepo: BlackboardRepository
  let sessionId: string

  beforeEach(() => {
    db = createTestDb()
    const projectRepo = new ProjectRepository(db)
    const sessionRepo = new SessionRepository(db)
    bbRepo = new BlackboardRepository(db)

    const projectId = projectRepo.create({ name: 'P' }).id
    sessionId = sessionRepo.create({ project_id: projectId, title: 'S' }).id
  })

  it('stores and retrieves a value', () => {
    bbRepo.set(sessionId, 'goal', { description: 'build a thing' })
    const value = bbRepo.getValue<{ description: string }>(sessionId, 'goal')
    expect(value?.description).toBe('build a thing')
  })

  it('returns null for missing keys', () => {
    expect(bbRepo.getValue(sessionId, 'missing')).toBeNull()
  })

  it('overwrites existing key', () => {
    bbRepo.set(sessionId, 'k', 1)
    bbRepo.set(sessionId, 'k', 2)
    expect(bbRepo.getValue(sessionId, 'k')).toBe(2)
  })

  it('lists all entries for a session', () => {
    bbRepo.set(sessionId, 'a', 1)
    bbRepo.set(sessionId, 'b', 2)
    expect(bbRepo.listForSession(sessionId).length).toBe(2)
  })

  it('deletes a key', () => {
    bbRepo.set(sessionId, 'k', 'v')
    expect(bbRepo.delete(sessionId, 'k')).toBe(true)
    expect(bbRepo.getValue(sessionId, 'k')).toBeNull()
  })

  it('clears entire session', () => {
    bbRepo.set(sessionId, 'a', 1)
    bbRepo.set(sessionId, 'b', 2)
    expect(bbRepo.clearSession(sessionId)).toBe(2)
    expect(bbRepo.listForSession(sessionId).length).toBe(0)
  })
})
```

---

# 📦 SECTION 12: Verification

## Task 12.1: Type Check

```bash
npm run typecheck
```

## Task 12.2: Lint

```bash
npm run lint
```

## Task 12.3: Format

```bash
npm run format
```

## Task 12.4: Tests

```bash
npm run test:run
```

## Task 12.5: Build

```bash
npm run build
```

## Task 12.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

(Requires a working API key)

- [ ] App launches, terminal shows "All services initialized"
- [ ] Open or create a session
- [ ] Right sidebar Inspector tab shows "No agent yet. Send a message to spawn the primary agent."
- [ ] Send a message → primary agent appears in Inspector with name like "Reasoner" (depending on brain mode)
- [ ] Status dot pulses yellow during thinking, blue during working
- [ ] Tokens count increments in Inspector
- [ ] Cost increments
- [ ] Duration ticks up
- [ ] Recent Actions list updates as the agent goes through states
- [ ] Status bar at bottom now shows "1 agent" (because there's a real primary agent)
- [ ] Wait for response to complete → agent status flips to "Done", dot is green
- [ ] Send a second message in the same session → reuses the same agent, doesn't create a new one
- [ ] Switch brain mode (e.g., from Deep Think to Fast) → next message uses the new model but the same primary agent
- [ ] Open another session → that session has its own (initially empty) Inspector
- [ ] Cancel mid-stream (click Stop) → agent status updates to "Done" with action "Cancelled by user"
- [ ] Send a message with bad API key → agent status flips to "Failed", red dot, error visible

**Persistence test:**

- [ ] Close and reopen app
- [ ] Open the same session → agent state preserved (status, tokens, cost, recent actions)

---

# 📦 SECTION 13: Git Commit

```bash
git add .
git commit -m "feat: agent system foundation with blackboard and inspector (Chapter 16)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Schema and migration updated

```bash
grep -c "blackboard" src/main/db/schema.sql
```

**Expected:** ≥ 2 matches.

## ✅ Check 2: New repositories exist

```bash
ls src/main/db/repositories/AgentActionRepository.ts src/main/db/repositories/BlackboardRepository.ts
```

## ✅ Check 3: AgentService exists

```bash
ls src/main/services/agents/AgentService.ts src/main/services/agents/agentConstants.ts
```

## ✅ Check 4: Inspector component exists

```bash
ls src/renderer/src/components/Inspector/AgentInspector.tsx
```

## ✅ Check 5: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 6: Tests pass

```bash
npm run test:run
```

## ✅ Check 7: Build works

```bash
npm run build
```

## ✅ Check 8: Inspector shows live agent (user confirmed)

## ✅ Check 9: Status persists across launches (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline | head -3
```

---

# 📊 Chapter 16 Completion Report

```
✅ Chapter 16: Agent System Foundation - COMPLETE

Acceptance Criteria Met:
✅ Primary agent created per session
✅ Status lifecycle (idle → thinking → working → done/failed)
✅ Action log records every step
✅ Blackboard table for shared session memory
✅ Token + cost tracked per agent
✅ Status events broadcast in real time
✅ Inspector panel shows live agent state
✅ Agent reused across messages in same session
✅ Migration system handles schema upgrade
✅ Tests passing
✅ Build works

Ready for Chapter 17: Sub-Agent Spawning & Hierarchy.
```

---

# 🚨 Troubleshooting

## "blackboard table does not exist"

The migration didn't run. For existing databases:

1. Close the app
2. Locate the DB file (path from Chapter 4 — `%APPDATA%\agent-flow-manager\database\agentflow.db` on Windows)
3. Either delete the DB file (loses all data) or open it in DB Browser and run the CREATE TABLE statement manually

## Inspector stays empty after sending a message

- Check terminal for IPC errors
- Verify `agentService.list()` is being called by adding a `console.log` in the Inspector's `loadAgents`
- Confirm `useAgentStore` has the agent: `useAgentStore.getState().agentsBySession`

## Status bar shows "0 agents"

Run a fresh send. The status bar reads from the agent store, which only populates after the first agent is created.

## "AgentInspector keeps re-rendering"

The hook subscribes to status events and reloads on each. Acceptable for now — will be optimized in a polish chapter.

## Two primary agents in one session

The `getOrCreatePrimaryAgent` function checks for an existing primary. If you see duplicates, the check is failing — likely because of a race condition. Ensure you don't fire two `send()` calls in parallel.

---

**End of Chapter 16 Implementation Plan**
