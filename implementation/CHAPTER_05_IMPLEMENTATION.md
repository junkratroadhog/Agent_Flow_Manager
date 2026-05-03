# 📘 Chapter 5 Implementation Plan: State Management Architecture

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 5 of the Agent Flow Manager project. Follow this document EXACTLY in order.
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
> 8. **PREREQUISITE:** Chapters 1-4 must be complete.

---

## 🎯 Chapter 5 Goal

Set up Zustand-based state management for the renderer process with domain-specific stores. Establish the pattern for renderer ↔ main state synchronization.

## 📋 What Will Exist When This Chapter Is Done

- Zustand installed and configured
- 7 domain stores: project, session, agent, flow, UI, settings, tool
- Persistent UI state (sidebar widths, theme, etc.)
- Devtools middleware enabled in dev mode
- Selectors to prevent unnecessary re-renders
- State architecture documented

---

# 📦 SECTION 1: Pre-flight

## Task 1.1: Verify Previous Chapters

```bash
npm run typecheck && npm run test:run
```

---

# 📦 SECTION 2: Install Dependencies

## Task 2.1: Install Zustand

```bash
npm install zustand
```

## Task 2.2: Install Immer (for immutable updates)

```bash
npm install immer
```

---

# 📦 SECTION 3: Store Folder Structure

## Task 3.1: Create Folders

```bash
mkdir -p src/renderer/src/stores
mkdir -p src/renderer/src/stores/middleware
```

---

# 📦 SECTION 4: Persistence Middleware

## Task 4.1: Create Persistence Helper

**File path:** `src/renderer/src/stores/middleware/persist.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { type StateCreator, type StoreMutatorIdentifier } from 'zustand'
import { persist as zustandPersist, type PersistOptions } from 'zustand/middleware'

/**
 * Creates a persisted store using localStorage.
 * Only persists keys listed in `partialize`.
 */
export function createPersistedStore<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  name: string,
  initializer: StateCreator<T, Mps, Mcs>,
  partialize?: (state: T) => Partial<T>
): StateCreator<T, Mps, Mcs> {
  const options: PersistOptions<T, Partial<T>> = {
    name,
    storage: {
      getItem: (key) => {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : null
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value))
      },
      removeItem: (key) => {
        localStorage.removeItem(key)
      }
    }
  }

  if (partialize) {
    options.partialize = partialize
  }

  return zustandPersist(initializer, options) as unknown as StateCreator<T, Mps, Mcs>
}
```

---

# 📦 SECTION 5: UI Store

## Task 5.1: Create UI Store

**File path:** `src/renderer/src/stores/uiStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarView = 'sessions' | 'projects' | 'tools' | 'marketplace' | 'settings' | null

export interface UIState {
  // Sidebar
  leftSidebarVisible: boolean
  leftSidebarView: SidebarView
  leftSidebarWidth: number
  rightSidebarVisible: boolean
  rightSidebarWidth: number
  bottomPanelVisible: boolean
  bottomPanelHeight: number

  // Theme
  theme: 'dark' | 'light'

  // Active tab
  activeTabId: string | null

  // Modals
  isProjectWizardOpen: boolean
  isSettingsOpen: boolean

  // Actions
  toggleLeftSidebar: () => void
  setLeftSidebarView: (view: SidebarView) => void
  setLeftSidebarWidth: (width: number) => void
  toggleRightSidebar: () => void
  setRightSidebarWidth: (width: number) => void
  toggleBottomPanel: () => void
  setBottomPanelHeight: (height: number) => void
  setTheme: (theme: 'dark' | 'light') => void
  setActiveTabId: (id: string | null) => void
  setProjectWizardOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftSidebarVisible: true,
      leftSidebarView: 'sessions',
      leftSidebarWidth: 260,
      rightSidebarVisible: true,
      rightSidebarWidth: 320,
      bottomPanelVisible: false,
      bottomPanelHeight: 200,
      theme: 'dark',
      activeTabId: null,
      isProjectWizardOpen: false,
      isSettingsOpen: false,

      toggleLeftSidebar: (): void => set((s) => ({ leftSidebarVisible: !s.leftSidebarVisible })),
      setLeftSidebarView: (view): void => set({ leftSidebarView: view }),
      setLeftSidebarWidth: (width): void => set({ leftSidebarWidth: width }),
      toggleRightSidebar: (): void => set((s) => ({ rightSidebarVisible: !s.rightSidebarVisible })),
      setRightSidebarWidth: (width): void => set({ rightSidebarWidth: width }),
      toggleBottomPanel: (): void => set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
      setBottomPanelHeight: (height): void => set({ bottomPanelHeight: height }),
      setTheme: (theme): void => set({ theme }),
      setActiveTabId: (id): void => set({ activeTabId: id }),
      setProjectWizardOpen: (open): void => set({ isProjectWizardOpen: open }),
      setSettingsOpen: (open): void => set({ isSettingsOpen: open })
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        leftSidebarVisible: state.leftSidebarVisible,
        leftSidebarView: state.leftSidebarView,
        leftSidebarWidth: state.leftSidebarWidth,
        rightSidebarVisible: state.rightSidebarVisible,
        rightSidebarWidth: state.rightSidebarWidth,
        bottomPanelVisible: state.bottomPanelVisible,
        bottomPanelHeight: state.bottomPanelHeight,
        theme: state.theme
      })
    }
  )
)
```

---

# 📦 SECTION 6: Project Store

## Task 6.1: Create Project Store

**File path:** `src/renderer/src/stores/projectStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'
import type { Project } from '@shared/db-types'

export interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  loading: boolean

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  loading: false,

  setProjects: (projects): void => set({ projects }),
  addProject: (project): void => set((s) => ({ projects: [project, ...s.projects] })),
  updateProject: (id, updates): void =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })),
  removeProject: (id): void =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId
    })),
  setActiveProject: (id): void => set({ activeProjectId: id }),
  setLoading: (loading): void => set({ loading })
}))

// Selectors
export const selectActiveProject = (state: ProjectState): Project | null =>
  state.projects.find((p) => p.id === state.activeProjectId) ?? null
```

---

# 📦 SECTION 7: Session Store

## Task 7.1: Create Session Store

**File path:** `src/renderer/src/stores/sessionStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'
import type { Session, Message } from '@shared/db-types'

export interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  messagesBySession: Record<string, Message[]>
  draftBySession: Record<string, string>
  isStreaming: boolean
  loading: boolean

  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  removeSession: (id: string) => void
  setActiveSession: (id: string | null) => void

  setMessages: (sessionId: string, messages: Message[]) => void
  appendMessage: (sessionId: string, message: Message) => void
  updateLastMessage: (sessionId: string, content: string) => void

  setDraft: (sessionId: string, draft: string) => void
  clearDraft: (sessionId: string) => void

  setStreaming: (streaming: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,
  messagesBySession: {},
  draftBySession: {},
  isStreaming: false,
  loading: false,

  setSessions: (sessions): void => set({ sessions }),
  addSession: (session): void => set((s) => ({ sessions: [session, ...s.sessions] })),
  updateSession: (id, updates): void =>
    set((s) => ({
      sessions: s.sessions.map((sess) => (sess.id === id ? { ...sess, ...updates } : sess))
    })),
  removeSession: (id): void =>
    set((s) => {
      const { [id]: _removed, ...rest } = s.messagesBySession
      void _removed
      return {
        sessions: s.sessions.filter((sess) => sess.id !== id),
        messagesBySession: rest,
        activeSessionId: s.activeSessionId === id ? null : s.activeSessionId
      }
    }),
  setActiveSession: (id): void => set({ activeSessionId: id }),

  setMessages: (sessionId, messages): void =>
    set((s) => ({
      messagesBySession: { ...s.messagesBySession, [sessionId]: messages }
    })),

  appendMessage: (sessionId, message): void =>
    set((s) => ({
      messagesBySession: {
        ...s.messagesBySession,
        [sessionId]: [...(s.messagesBySession[sessionId] ?? []), message]
      }
    })),

  updateLastMessage: (sessionId, content): void =>
    set((s) => {
      const msgs = s.messagesBySession[sessionId] ?? []
      if (msgs.length === 0) return s
      const updated = [...msgs]
      updated[updated.length - 1] = { ...updated[updated.length - 1], content }
      return {
        messagesBySession: { ...s.messagesBySession, [sessionId]: updated }
      }
    }),

  setDraft: (sessionId, draft): void =>
    set((s) => ({
      draftBySession: { ...s.draftBySession, [sessionId]: draft }
    })),

  clearDraft: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _removed, ...rest } = s.draftBySession
      void _removed
      return { draftBySession: rest }
    }),

  setStreaming: (streaming): void => set({ isStreaming: streaming }),
  setLoading: (loading): void => set({ loading })
}))

// Selectors
export const selectActiveSession = (state: SessionState): Session | null =>
  state.sessions.find((s) => s.id === state.activeSessionId) ?? null

export const selectActiveMessages = (state: SessionState): Message[] =>
  state.activeSessionId ? (state.messagesBySession[state.activeSessionId] ?? []) : []
```

---

# 📦 SECTION 8: Agent Store

## Task 8.1: Create Agent Store

**File path:** `src/renderer/src/stores/agentStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'
import type { Agent, AgentStatusType } from '@shared/db-types'

export interface AgentAction {
  id: string
  agentId: string
  actionType: string
  description: string
  status: 'pending' | 'running' | 'done' | 'failed'
  createdAt: string
}

export interface AgentState {
  agentsBySession: Record<string, Agent[]>
  actionsByAgent: Record<string, AgentAction[]>

  setAgents: (sessionId: string, agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  updateAgentStatus: (id: string, status: AgentStatusType, action?: string) => void
  removeAgent: (id: string) => void

  addAction: (action: AgentAction) => void
  updateActionStatus: (id: string, status: AgentAction['status']) => void

  clearSession: (sessionId: string) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agentsBySession: {},
  actionsByAgent: {},

  setAgents: (sessionId, agents): void =>
    set((s) => ({
      agentsBySession: { ...s.agentsBySession, [sessionId]: agents }
    })),

  addAgent: (agent): void =>
    set((s) => ({
      agentsBySession: {
        ...s.agentsBySession,
        [agent.session_id]: [...(s.agentsBySession[agent.session_id] ?? []), agent]
      }
    })),

  updateAgent: (id, updates): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.map((a) => (a.id === id ? { ...a, ...updates } : a))
      }
      return { agentsBySession: newMap }
    }),

  updateAgentStatus: (id, status, action): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.map((a) =>
          a.id === id ? { ...a, status, current_action: action ?? a.current_action } : a
        )
      }
      return { agentsBySession: newMap }
    }),

  removeAgent: (id): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.filter((a) => a.id !== id)
      }
      const { [id]: _removed, ...restActions } = s.actionsByAgent
      void _removed
      return { agentsBySession: newMap, actionsByAgent: restActions }
    }),

  addAction: (action): void =>
    set((s) => ({
      actionsByAgent: {
        ...s.actionsByAgent,
        [action.agentId]: [...(s.actionsByAgent[action.agentId] ?? []), action]
      }
    })),

  updateActionStatus: (id, status): void =>
    set((s) => {
      const newMap: Record<string, AgentAction[]> = {}
      for (const [agentId, actions] of Object.entries(s.actionsByAgent)) {
        newMap[agentId] = actions.map((a) => (a.id === id ? { ...a, status } : a))
      }
      return { actionsByAgent: newMap }
    }),

  clearSession: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _removed, ...rest } = s.agentsBySession
      void _removed
      return { agentsBySession: rest }
    })
}))

// Selectors
export const selectActiveAgents = (state: AgentState, sessionId: string | null): Agent[] =>
  sessionId ? (state.agentsBySession[sessionId] ?? []) : []

export const selectAgentChildren = (
  state: AgentState,
  parentId: string,
  sessionId: string
): Agent[] => {
  const agents = state.agentsBySession[sessionId] ?? []
  return agents.filter((a) => a.parent_agent_id === parentId)
}
```

---

# 📦 SECTION 9: Flow Store

## Task 9.1: Create Flow Store

**File path:** `src/renderer/src/stores/flowStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'

export interface FlowNode {
  id: string
  type: 'primary' | 'sub' | 'tool'
  agentId: string
  position: { x: number; y: number }
  data: {
    label: string
    status: string
    model?: string
    currentAction?: string
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type: 'spawn' | 'message' | 'result'
  animated?: boolean
}

export interface FlowState {
  nodesBySession: Record<string, FlowNode[]>
  edgesBySession: Record<string, FlowEdge[]>
  manualPositions: Record<string, { x: number; y: number }>

  setNodes: (sessionId: string, nodes: FlowNode[]) => void
  setEdges: (sessionId: string, edges: FlowEdge[]) => void
  addNode: (sessionId: string, node: FlowNode) => void
  addEdge: (sessionId: string, edge: FlowEdge) => void
  updateNode: (sessionId: string, nodeId: string, updates: Partial<FlowNode>) => void
  setManualPosition: (nodeId: string, position: { x: number; y: number }) => void
  clearSession: (sessionId: string) => void
}

export const useFlowStore = create<FlowState>((set) => ({
  nodesBySession: {},
  edgesBySession: {},
  manualPositions: {},

  setNodes: (sessionId, nodes): void =>
    set((s) => ({ nodesBySession: { ...s.nodesBySession, [sessionId]: nodes } })),
  setEdges: (sessionId, edges): void =>
    set((s) => ({ edgesBySession: { ...s.edgesBySession, [sessionId]: edges } })),
  addNode: (sessionId, node): void =>
    set((s) => ({
      nodesBySession: {
        ...s.nodesBySession,
        [sessionId]: [...(s.nodesBySession[sessionId] ?? []), node]
      }
    })),
  addEdge: (sessionId, edge): void =>
    set((s) => ({
      edgesBySession: {
        ...s.edgesBySession,
        [sessionId]: [...(s.edgesBySession[sessionId] ?? []), edge]
      }
    })),
  updateNode: (sessionId, nodeId, updates): void =>
    set((s) => ({
      nodesBySession: {
        ...s.nodesBySession,
        [sessionId]: (s.nodesBySession[sessionId] ?? []).map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        )
      }
    })),
  setManualPosition: (nodeId, position): void =>
    set((s) => ({ manualPositions: { ...s.manualPositions, [nodeId]: position } })),
  clearSession: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _n, ...restNodes } = s.nodesBySession
      const { [sessionId]: _e, ...restEdges } = s.edgesBySession
      void _n
      void _e
      return { nodesBySession: restNodes, edgesBySession: restEdges }
    })
}))
```

---

# 📦 SECTION 10: Settings Store

## Task 10.1: Create Settings Store

**File path:** `src/renderer/src/stores/settingsStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'

export type ExecutionMode = 'parallel' | 'serial'
export type BrainMode = 'fast' | 'plan' | 'deepThink' | 'deepResearch' | 'advanced'

export interface BrainModeConfig {
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface SettingsState {
  // Models
  primaryModel: string
  brainModes: Record<BrainMode, BrainModeConfig>
  currentBrainMode: BrainMode
  executionMode: ExecutionMode

  // Provider statuses
  providerStatus: Record<string, 'unknown' | 'online' | 'offline' | 'error'>

  // General preferences
  fontSize: number
  language: string
  telemetryEnabled: boolean
  autoUpdate: boolean

  setPrimaryModel: (model: string) => void
  setBrainModeConfig: (mode: BrainMode, config: BrainModeConfig) => void
  setCurrentBrainMode: (mode: BrainMode) => void
  setExecutionMode: (mode: ExecutionMode) => void
  setProviderStatus: (provider: string, status: SettingsState['providerStatus'][string]) => void
  setFontSize: (size: number) => void
  setLanguage: (lang: string) => void
  setTelemetryEnabled: (enabled: boolean) => void
  setAutoUpdate: (enabled: boolean) => void
}

const DEFAULT_BRAIN_MODES: Record<BrainMode, BrainModeConfig> = {
  fast: { model: 'gemini-flash', temperature: 0.5 },
  plan: { model: 'claude-sonnet', temperature: 0.7 },
  deepThink: { model: 'claude-opus', temperature: 0.7 },
  deepResearch: { model: 'gpt-4o', temperature: 0.5 },
  advanced: { model: 'claude-opus', temperature: 0.7 }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  primaryModel: 'claude-opus',
  brainModes: DEFAULT_BRAIN_MODES,
  currentBrainMode: 'deepThink',
  executionMode: 'serial',
  providerStatus: {},
  fontSize: 13,
  language: 'en',
  telemetryEnabled: false,
  autoUpdate: true,

  setPrimaryModel: (model): void => set({ primaryModel: model }),
  setBrainModeConfig: (mode, config): void =>
    set((s) => ({ brainModes: { ...s.brainModes, [mode]: config } })),
  setCurrentBrainMode: (mode): void => set({ currentBrainMode: mode }),
  setExecutionMode: (mode): void => set({ executionMode: mode }),
  setProviderStatus: (provider, status): void =>
    set((s) => ({ providerStatus: { ...s.providerStatus, [provider]: status } })),
  setFontSize: (size): void => set({ fontSize: size }),
  setLanguage: (lang): void => set({ language: lang }),
  setTelemetryEnabled: (enabled): void => set({ telemetryEnabled: enabled }),
  setAutoUpdate: (enabled): void => set({ autoUpdate: enabled })
}))
```

---

# 📦 SECTION 11: Tool Store

## Task 11.1: Create Tool Store

**File path:** `src/renderer/src/stores/toolStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'

export interface InstalledTool {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'mcp' | 'plugin'
  enabled: boolean
  version: string
  permissions: string[]
}

export type ApprovalScope = 'once' | 'session' | 'project' | 'global'

export interface ApprovalRecord {
  toolName: string
  scope: ApprovalScope
  scopeId?: string // sessionId or projectId for those scopes
  approvedAt: string
}

export interface ToolState {
  installedTools: InstalledTool[]
  approvals: ApprovalRecord[]

  setInstalledTools: (tools: InstalledTool[]) => void
  addTool: (tool: InstalledTool) => void
  removeTool: (id: string) => void
  setToolEnabled: (id: string, enabled: boolean) => void

  addApproval: (approval: ApprovalRecord) => void
  hasApproval: (toolName: string, sessionId?: string, projectId?: string) => boolean
  revokeApproval: (toolName: string, scope: ApprovalScope, scopeId?: string) => void
  clearSessionApprovals: (sessionId: string) => void
}

export const useToolStore = create<ToolState>((set, get) => ({
  installedTools: [],
  approvals: [],

  setInstalledTools: (tools): void => set({ installedTools: tools }),
  addTool: (tool): void => set((s) => ({ installedTools: [...s.installedTools, tool] })),
  removeTool: (id): void =>
    set((s) => ({ installedTools: s.installedTools.filter((t) => t.id !== id) })),
  setToolEnabled: (id, enabled): void =>
    set((s) => ({
      installedTools: s.installedTools.map((t) => (t.id === id ? { ...t, enabled } : t))
    })),

  addApproval: (approval): void => set((s) => ({ approvals: [...s.approvals, approval] })),

  hasApproval: (toolName, sessionId, projectId): boolean => {
    const approvals = get().approvals
    return approvals.some((a) => {
      if (a.toolName !== toolName) return false
      if (a.scope === 'global') return true
      if (a.scope === 'project' && a.scopeId === projectId) return true
      if (a.scope === 'session' && a.scopeId === sessionId) return true
      return false
    })
  },

  revokeApproval: (toolName, scope, scopeId): void =>
    set((s) => ({
      approvals: s.approvals.filter(
        (a) => !(a.toolName === toolName && a.scope === scope && a.scopeId === scopeId)
      )
    })),

  clearSessionApprovals: (sessionId): void =>
    set((s) => ({
      approvals: s.approvals.filter((a) => !(a.scope === 'session' && a.scopeId === sessionId))
    }))
}))
```

---

# 📦 SECTION 12: Stores Index

## Task 12.1: Create Index File

**File path:** `src/renderer/src/stores/index.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export * from './uiStore'
export * from './projectStore'
export * from './sessionStore'
export * from './agentStore'
export * from './flowStore'
export * from './settingsStore'
export * from './toolStore'
```

---

# 📦 SECTION 13: Documentation

## Task 13.1: Create State Architecture Doc

**File path:** `docs/state-architecture.md`

**Action:** Create NEW file.

**Exact content:**

```markdown
# State Architecture

## Overview

The renderer process uses **Zustand** for state management. Each domain has its own store. The main process is the source of truth for persistent data; the renderer caches state in stores.

## Stores

| Store              | Domain                                        | Persisted?          |
| ------------------ | --------------------------------------------- | ------------------- |
| `useUIStore`       | Sidebar visibility, widths, theme, active tab | Yes (UI prefs only) |
| `useProjectStore`  | Projects list, active project                 | No (loaded from DB) |
| `useSessionStore`  | Sessions, messages, drafts                    | No (loaded from DB) |
| `useAgentStore`    | Agents per session, action logs               | No (loaded from DB) |
| `useFlowStore`     | Flow diagram nodes, edges, manual positions   | No                  |
| `useSettingsStore` | Models, brain modes, preferences              | Synced via IPC      |
| `useToolStore`     | Installed tools, approvals                    | Synced via IPC      |

## Sync Pattern
```

┌────────────────┐ ┌─────────────────┐
│ Renderer │ IPC invoke │ Main Process │
│ Zustand Store │ ─────────────> │ Repository │
│ │ <───────────── │ SQLite │
│ │ IPC events │ │
└────────────────┘ └─────────────────┘

````

1. **Initial Load:** Renderer requests data from main via IPC, populates store.
2. **Mutations:** Renderer calls IPC, main updates DB, broadcasts event.
3. **Real-time updates:** Main pushes events (e.g., agent status), renderer updates store.

## Selectors

Stores expose selectors to prevent unnecessary re-renders:

```typescript
const project = useProjectStore(selectActiveProject)
const messages = useSessionStore(selectActiveMessages)
````

Always prefer selectors over reading the whole state.

## Persistence

Only `useUIStore` persists to localStorage (UI preferences only).

All other state is hydrated from main process on app start.

## Adding a New Store

1. Create `src/renderer/src/stores/myStore.ts`
2. Define the state shape and actions
3. Export selectors if needed
4. Add to `src/renderer/src/stores/index.ts`
5. Document in this file

````

---

# 📦 SECTION 14: Tests

## Task 14.1: Create Store Tests

**File path:** `tests/unit/stores.test.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../../src/renderer/src/stores/uiStore'
import { useProjectStore } from '../../src/renderer/src/stores/projectStore'
import { useSessionStore } from '../../src/renderer/src/stores/sessionStore'
import { useAgentStore } from '../../src/renderer/src/stores/agentStore'
import { useToolStore } from '../../src/renderer/src/stores/toolStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      leftSidebarVisible: true,
      rightSidebarVisible: true,
      bottomPanelVisible: false
    })
  })

  it('toggles left sidebar', () => {
    const before = useUIStore.getState().leftSidebarVisible
    useUIStore.getState().toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(!before)
  })

  it('sets sidebar view', () => {
    useUIStore.getState().setLeftSidebarView('projects')
    expect(useUIStore.getState().leftSidebarView).toBe('projects')
  })
})

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: [], activeProjectId: null })
  })

  it('adds a project', () => {
    const project = {
      id: 'p1',
      name: 'Test',
      workspace_type: 'local' as const,
      settings_json: '{}',
      created_at: 'now',
      updated_at: 'now'
    }
    useProjectStore.getState().addProject(project)
    expect(useProjectStore.getState().projects.length).toBe(1)
  })

  it('removes a project and clears active if matched', () => {
    const project = {
      id: 'p1',
      name: 'Test',
      workspace_type: 'local' as const,
      settings_json: '{}',
      created_at: 'now',
      updated_at: 'now'
    }
    useProjectStore.getState().addProject(project)
    useProjectStore.getState().setActiveProject('p1')
    useProjectStore.getState().removeProject('p1')
    expect(useProjectStore.getState().projects.length).toBe(0)
    expect(useProjectStore.getState().activeProjectId).toBeNull()
  })
})

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
      messagesBySession: {},
      draftBySession: {}
    })
  })

  it('appends messages', () => {
    const msg = {
      id: 'm1',
      session_id: 's1',
      role: 'user' as const,
      content: 'Hi',
      tokens_in: 0,
      tokens_out: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useSessionStore.getState().appendMessage('s1', msg)
    expect(useSessionStore.getState().messagesBySession['s1'].length).toBe(1)
  })

  it('manages drafts', () => {
    useSessionStore.getState().setDraft('s1', 'Hello world')
    expect(useSessionStore.getState().draftBySession['s1']).toBe('Hello world')
    useSessionStore.getState().clearDraft('s1')
    expect(useSessionStore.getState().draftBySession['s1']).toBeUndefined()
  })
})

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.setState({ agentsBySession: {}, actionsByAgent: {} })
  })

  it('adds an agent', () => {
    const agent = {
      id: 'a1',
      session_id: 's1',
      name: 'Agent',
      role: 'r',
      model: 'm',
      status: 'idle' as const,
      tokens_used: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useAgentStore.getState().addAgent(agent)
    expect(useAgentStore.getState().agentsBySession['s1'].length).toBe(1)
  })

  it('updates agent status across sessions', () => {
    const agent = {
      id: 'a1',
      session_id: 's1',
      name: 'A',
      role: 'r',
      model: 'm',
      status: 'idle' as const,
      tokens_used: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useAgentStore.getState().addAgent(agent)
    useAgentStore.getState().updateAgentStatus('a1', 'working', 'Doing X')
    const updated = useAgentStore.getState().agentsBySession['s1'][0]
    expect(updated.status).toBe('working')
    expect(updated.current_action).toBe('Doing X')
  })
})

describe('toolStore', () => {
  beforeEach(() => {
    useToolStore.setState({ installedTools: [], approvals: [] })
  })

  it('checks approval at global scope', () => {
    useToolStore.getState().addApproval({
      toolName: 'web_search',
      scope: 'global',
      approvedAt: 'now'
    })
    expect(useToolStore.getState().hasApproval('web_search')).toBe(true)
  })

  it('checks approval at session scope', () => {
    useToolStore.getState().addApproval({
      toolName: 'fs_write',
      scope: 'session',
      scopeId: 's1',
      approvedAt: 'now'
    })
    expect(useToolStore.getState().hasApproval('fs_write', 's1')).toBe(true)
    expect(useToolStore.getState().hasApproval('fs_write', 's2')).toBe(false)
  })

  it('revokes approval', () => {
    useToolStore.getState().addApproval({
      toolName: 'x',
      scope: 'global',
      approvedAt: 'now'
    })
    useToolStore.getState().revokeApproval('x', 'global')
    expect(useToolStore.getState().hasApproval('x')).toBe(false)
  })
})
````

---

# 📦 SECTION 15: Verification

## Task 15.1: Type Check

```bash
npm run typecheck
```

## Task 15.2: Lint

```bash
npm run lint
```

## Task 15.3: Format

```bash
npm run format
```

## Task 15.4: Tests

```bash
npm run test:run
```

**Expected:** All tests pass (previous tests + new store tests).

## Task 15.5: Build

```bash
npm run build
```

## Task 15.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION:**

- [ ] App launches normally
- [ ] No console errors
- [ ] Component Showcase still visible

---

# 📦 SECTION 16: Git Commit

```bash
git add .
git commit -m "feat: Zustand state management with domain stores (Chapter 5)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: All store files exist

```bash
ls src/renderer/src/stores/uiStore.ts src/renderer/src/stores/projectStore.ts src/renderer/src/stores/sessionStore.ts src/renderer/src/stores/agentStore.ts src/renderer/src/stores/flowStore.ts src/renderer/src/stores/settingsStore.ts src/renderer/src/stores/toolStore.ts
```

## ✅ Check 2: Documentation exists

```bash
ls docs/state-architecture.md
```

## ✅ Check 3: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 4: Lint passes

```bash
npm run lint
```

## ✅ Check 5: Tests pass

```bash
npm run test:run
```

## ✅ Check 6: Build works

```bash
npm run build
```

## ✅ Check 7: Dev mode works (user confirmed)

## ✅ Check 8: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 5 Completion Report

```
✅ Chapter 5: State Management Architecture - COMPLETE

Acceptance Criteria Met:
✅ Zustand installed and configured
✅ 7 domain stores created
✅ UI store persisted to localStorage
✅ Selectors for performance
✅ Documentation complete
✅ All tests passing

Ready to proceed to Chapter 6: IPC & Process Communication.
```

---

**End of Chapter 5 Implementation Plan**
