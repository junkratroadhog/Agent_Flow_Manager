# State Architecture

## Overview

The renderer process uses **Zustand** for state management. Each domain has its own store. The main process is the source of truth for persistent data; the renderer caches state in stores.

## Stores

| Store | Domain | Persisted? |
|-------|--------|------------|
| `useUIStore` | Sidebar visibility, widths, theme, active tab | Yes (UI prefs only) |
| `useProjectStore` | Projects list, active project | No (loaded from DB) |
| `useSessionStore` | Sessions, messages, drafts | No (loaded from DB) |
| `useAgentStore` | Agents per session, action logs | No (loaded from DB) |
| `useFlowStore` | Flow diagram nodes, edges, manual positions | No |
| `useSettingsStore` | Models, brain modes, preferences | Synced via IPC |
| `useToolStore` | Installed tools, approvals | Synced via IPC |

## Sync Pattern

```
┌────────────────┐                ┌─────────────────┐
│ Renderer       │   IPC invoke   │ Main Process    │
│ Zustand Store  │ ─────────────> │ Repository      │
│                │ <───────────── │ SQLite          │
│                │   IPC events   │                 │
└────────────────┘                └─────────────────┘
```

1. **Initial Load:** Renderer requests data from main via IPC, populates store.
2. **Mutations:** Renderer calls IPC, main updates DB, broadcasts event.
3. **Real-time updates:** Main pushes events (e.g., agent status), renderer updates store.

## Selectors

Stores expose selectors to prevent unnecessary re-renders:

```typescript
const project = useProjectStore(selectActiveProject)
const messages = useSessionStore(selectActiveMessages)
```

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
