# 📘 Agent Flow Manager — Complete Development Blueprint

> **A book-style, goal-driven roadmap for building an Antigravity-style AI Agent Manager desktop application.**

---

## 📖 How to Use This Book

This document is the **single source of truth** for building Agent Flow Manager. It is structured as a book with chapters, sections, and explicit goals.

### Rules of Engagement

1. **Sequential Development** — Chapters MUST be completed in order unless explicitly marked as parallel-safe.
2. **Goal Verification** — Each chapter and section has a clearly defined **Goal** and **Acceptance Criteria**. Do NOT proceed to the next item until ALL acceptance criteria pass.
3. **No Skipping** — If a goal cannot be met, STOP and resolve it. Never paper over failures.
4. **Test-as-you-go** — Tests are written alongside code (per user decision Q18=A).
5. **Definition of Done** — A chapter is "Done" only when:
   - ✅ All acceptance criteria pass
   - ✅ Tests are written and passing
   - ✅ Manual smoke test completed
   - ✅ Code is committed with a meaningful message
   - ✅ User has visually verified the feature works

### Symbol Legend

- 🎯 **Goal** — The objective of this chapter/section
- ✅ **Acceptance Criteria** — Concrete checks that prove the goal is met
- 🧪 **Tests** — Tests required for this section
- 📦 **Deliverables** — Concrete files/artifacts produced
- ⚠️ **Risks** — Known challenges and how to handle them
- 🔗 **Dependencies** — What must be done before starting

---

## 📚 Table of Contents

**PART I — FOUNDATION**

- Chapter 1: Project Bootstrap & Environment Setup
- Chapter 2: Application Shell & Window Management
- Chapter 3: Design System & Theme Foundation

**PART II — CORE DATA & STATE**

- Chapter 4: Local Storage & Database Layer
- Chapter 5: State Management Architecture
- Chapter 6: IPC & Process Communication

**PART III — UI SKELETON**

- Chapter 7: Layout System (VS Code-style)
- Chapter 8: Tab System & Multi-View Support
- Chapter 9: Sidebar Components & Navigation
- Chapter 10: Status Bar & Toolbar

**PART IV — PROJECT & SESSION MANAGEMENT**

- Chapter 11: Project Creation Wizard
- Chapter 12: Session Management
- Chapter 13: Settings System

**PART V — LLM INTEGRATION**

- Chapter 14: LLM Provider Abstraction
- Chapter 15: Cloud LLM Providers
- Chapter 16: Local LLM Providers
- Chapter 17: Streaming Chat Engine
- Chapter 18: Model + Mode Selector System

**PART VI — AGENT SYSTEM**

- Chapter 19: Agent Core Architecture
- Chapter 20: Sub-Agent Spawning
- Chapter 21: Agent Communication (Blackboard)
- Chapter 22: Agent Lifecycle Management
- Chapter 23: Brain Modes (Fast/Plan/Deep Think/Deep Research)

**PART VII — VISUALIZATION**

- Chapter 24: Flow Diagram Engine
- Chapter 25: Agent Actions Panel
- Chapter 26: Live Token & Cost Tracking

**PART VIII — TOOL SYSTEM**

- Chapter 27: Tool Architecture & MCP Integration
- Chapter 28: Built-in Tool Pack (5 essentials)
- Chapter 29: Tool Approval UX
- Chapter 30: Docker Code Sandbox

**PART IX — ANTIGRAVITY-LIKE FEATURES**

- Chapter 31: Artifact System
- Chapter 32: Diff Viewer
- Chapter 33: Plan.md Iteration System
- Chapter 34: File Save Approval Flow

**PART X — ADVANCED FEATURES**

- Chapter 35: Memory System Architecture
- Chapter 36: Workspace SSH Support
- Chapter 37: Marketplace & Plugin System

**PART XI — POLISH & RELEASE**

- Chapter 38: Multi-modal Input
- Chapter 39: Keyboard Shortcuts & Command Palette
- Chapter 40: Cross-Platform Build & Distribution
- Chapter 41: Auto-Updater
- Chapter 42: Final QA & Launch

---

# PART I — FOUNDATION

---

## Chapter 1: Project Bootstrap & Environment Setup

🎯 **Chapter Goal:** Establish a working Electron + React + TypeScript development environment that builds and launches without errors on Windows.

🔗 **Dependencies:** None (this is the start)

### 1.1 Prerequisite Verification

🎯 **Goal:** Confirm the development machine has all required tools.

✅ **Acceptance Criteria:**

- [ ] Node.js v20+ installed (`node --version` returns 20.x or higher)
- [ ] npm v10+ installed (`npm --version` returns 10.x or higher)
- [ ] Git installed and configured (`git --version` works)
- [ ] VS Code or chosen editor is installed
- [ ] At least 5GB free disk space
- [ ] Docker Desktop installed and running (for code sandbox in later chapters)

### 1.2 Repository Initialization

🎯 **Goal:** Create the project repository with proper version control.

✅ **Acceptance Criteria:**

- [ ] Project folder created at chosen location
- [ ] `git init` executed
- [ ] `.gitignore` file created with Node/Electron/IDE entries
- [ ] Initial commit made
- [ ] `README.md` created with project name and brief description
- [ ] License file added (MIT recommended)

📦 **Deliverables:**

- `.gitignore`
- `README.md`
- `LICENSE`

### 1.3 Electron + Vite + React + TypeScript Scaffold

🎯 **Goal:** Set up a working Electron application using `electron-vite` with React and TypeScript.

✅ **Acceptance Criteria:**

- [ ] `package.json` created with correct metadata
- [ ] `electron-vite` installed and configured
- [ ] React 18+ installed
- [ ] TypeScript 5+ configured with strict mode
- [ ] Project structure created (`src/main`, `src/renderer`, `src/preload`, `src/shared`)
- [ ] `tsconfig.json` files for each process
- [ ] `npm run dev` launches Electron window successfully
- [ ] React component renders inside the Electron window
- [ ] Hot reload works for renderer process changes
- [ ] No TypeScript errors

📦 **Deliverables:**

- `package.json`
- `electron.vite.config.ts`
- `tsconfig.json` (root + per-process)
- `src/main/index.ts`
- `src/renderer/src/App.tsx`
- `src/preload/index.ts`

🧪 **Tests:**

- [ ] Vitest installed and configured
- [ ] One smoke test that asserts `App.tsx` renders without crashing

⚠️ **Risks:**

- Electron-Vite version mismatches → Pin specific versions
- Native module compilation issues on Windows → Install windows-build-tools if needed

### 1.4 Code Quality Tooling

🎯 **Goal:** Enforce code quality from day one.

✅ **Acceptance Criteria:**

- [ ] ESLint installed and configured for TypeScript + React
- [ ] Prettier installed with config file
- [ ] Husky pre-commit hook runs lint + format
- [ ] `npm run lint` passes
- [ ] `npm run format` works
- [ ] EditorConfig file present
- [ ] VS Code settings folder with recommended extensions list

📦 **Deliverables:**

- `.eslintrc.json` or `eslint.config.js`
- `.prettierrc`
- `.editorconfig`
- `.husky/pre-commit`
- `.vscode/extensions.json`
- `.vscode/settings.json`

### 1.5 Build Pipeline Verification

🎯 **Goal:** Prove that production builds work end-to-end.

✅ **Acceptance Criteria:**

- [ ] `electron-builder` installed and configured for Windows
- [ ] `npm run build` completes without errors
- [ ] `npm run build:win` produces a working `.exe` installer
- [ ] Built app launches and displays React content
- [ ] App icon appears correctly in the built version

📦 **Deliverables:**

- `electron-builder.yml`
- Build output in `dist/` folder

---

## Chapter 2: Application Shell & Window Management

🎯 **Chapter Goal:** Build the foundational Electron window with proper lifecycle management, security settings, and window controls.

🔗 **Dependencies:** Chapter 1

### 2.1 Main Window Configuration

🎯 **Goal:** Create a properly configured BrowserWindow with security best practices.

✅ **Acceptance Criteria:**

- [ ] BrowserWindow created with `contextIsolation: true`
- [ ] `nodeIntegration: false`
- [ ] `sandbox: true` for renderer
- [ ] Custom title bar (frameless on Windows for Antigravity feel)
- [ ] Window remembers size/position between launches (electron-store)
- [ ] Minimum window size enforced (1024x768)
- [ ] App icon set correctly
- [ ] Window centered on first launch

### 2.2 Application Lifecycle

🎯 **Goal:** Handle all Electron lifecycle events gracefully.

✅ **Acceptance Criteria:**

- [ ] `app.whenReady` properly handled
- [ ] `window-all-closed` correctly quits on Windows/Linux, hides on macOS
- [ ] `activate` event reopens window on macOS
- [ ] Single-instance lock implemented (no duplicate apps)
- [ ] Graceful shutdown on quit (close DB, save state)

### 2.3 Custom Title Bar

🎯 **Goal:** Implement Antigravity-style custom title bar with window controls.

✅ **Acceptance Criteria:**

- [ ] Frameless window
- [ ] Custom title bar component with drag region
- [ ] Minimize/Maximize/Close buttons functional
- [ ] Window controls match OS conventions (right on Windows, left on macOS)
- [ ] Title bar reflects current project name
- [ ] Double-click on title bar maximizes/restores

📦 **Deliverables:**

- `src/renderer/src/components/TitleBar/TitleBar.tsx`
- `src/main/window.ts`

🧪 **Tests:**

- [ ] Window controls trigger correct IPC messages
- [ ] State persistence works across restarts

---

## Chapter 3: Design System & Theme Foundation

🎯 **Chapter Goal:** Build a complete dark-mode design system that establishes the Antigravity aesthetic before any features are added.

🔗 **Dependencies:** Chapter 2

### 3.1 Tailwind CSS + shadcn/ui Setup

🎯 **Goal:** Install and configure styling foundation.

✅ **Acceptance Criteria:**

- [ ] Tailwind CSS v3+ installed and configured
- [ ] PostCSS configured
- [ ] shadcn/ui CLI initialized
- [ ] Tailwind config has custom color palette
- [ ] Tailwind processes successfully on build
- [ ] CSS variables for theming defined in `globals.css`

### 3.2 Color Palette & Tokens

🎯 **Goal:** Define every color token used in the application.

✅ **Acceptance Criteria:**

- [ ] Background tiers defined (deepest, deep, surface, elevated)
- [ ] Border tones defined (subtle, default, strong)
- [ ] Text tiers defined (primary, secondary, tertiary, disabled)
- [ ] Accent color defined (single signature color, e.g., electric blue)
- [ ] Status colors defined (success/warning/error/info)
- [ ] Agent status colors defined (idle/thinking/working/done/failed)
- [ ] All colors documented in `docs/design-tokens.md`

📦 **Deliverables:**

- `src/renderer/src/styles/globals.css`
- `tailwind.config.ts`
- `docs/design-tokens.md`

### 3.3 Typography System

🎯 **Goal:** Establish consistent type hierarchy.

✅ **Acceptance Criteria:**

- [ ] Inter font loaded (UI)
- [ ] JetBrains Mono loaded (code/mono contexts)
- [ ] Font sizes defined: xs (11), sm (12), base (13), md (14), lg (16), xl (18), 2xl (24)
- [ ] Line heights configured per size
- [ ] Font weights defined (regular, medium, semibold)
- [ ] No layout shift on font load (preload + font-display strategy)

### 3.4 Core UI Primitives

🎯 **Goal:** Install/build base components that will be used everywhere.

✅ **Acceptance Criteria:**

- [ ] Button component (primary/secondary/ghost/danger variants)
- [ ] Input component
- [ ] Textarea component
- [ ] Select/Dropdown component
- [ ] Modal/Dialog component
- [ ] Tooltip component
- [ ] Toast/Notification component
- [ ] Tabs component
- [ ] Resizable panel component (for layout)
- [ ] All components are dark-mode native
- [ ] All components have hover/focus/disabled states
- [ ] Storybook OR a `ComponentShowcase.tsx` route exists for visual testing

📦 **Deliverables:**

- `src/renderer/src/components/ui/*`
- `src/renderer/src/routes/ComponentShowcase.tsx`

🧪 **Tests:**

- [ ] Each primitive has a render test
- [ ] Interactive components have interaction tests

⚠️ **Risks:**

- Inconsistent styles across components → Use shadcn/ui as base, customize via tokens only

---

# PART II — CORE DATA & STATE

---

## Chapter 4: Local Storage & Database Layer

🎯 **Chapter Goal:** Build a robust local persistence layer using SQLite that all features will rely on.

🔗 **Dependencies:** Chapter 3

### 4.1 SQLite Integration

🎯 **Goal:** Set up `better-sqlite3` in the main process.

✅ **Acceptance Criteria:**

- [ ] `better-sqlite3` installed and rebuilt for Electron
- [ ] Database file created at OS-appropriate user data path
- [ ] Connection pooling/single-connection pattern documented
- [ ] WAL mode enabled
- [ ] Backup mechanism in place (daily snapshot)

### 4.2 Schema Design

🎯 **Goal:** Define and create all required database tables.

✅ **Acceptance Criteria:**

- [ ] `projects` table (id, name, description, workspace_path, workspace_type, settings_json, created_at, updated_at)
- [ ] `sessions` table (id, project_id, title, created_at, updated_at, pinned, archived)
- [ ] `messages` table (id, session_id, role, content, model, tokens_in, tokens_out, cost, created_at, parent_message_id)
- [ ] `agents` table (id, session_id, parent_agent_id, name, role, model, status, started_at, completed_at, tokens_used, cost)
- [ ] `agent_actions` table (id, agent_id, action_type, payload_json, status, created_at)
- [ ] `tool_calls` table (id, agent_id, message_id, tool_name, arguments_json, result_json, approved, approved_scope, created_at)
- [ ] `settings` table (key, value_json)
- [ ] `api_keys` table (provider, encrypted_key, created_at)
- [ ] `tools` table (id, name, source, version, enabled, config_json)
- [ ] All foreign keys properly defined with CASCADE rules
- [ ] Indexes on commonly-queried columns

### 4.3 Migration System

🎯 **Goal:** Make schema changes safe and versioned.

✅ **Acceptance Criteria:**

- [ ] Migration runner exists in `src/main/db/migrations/`
- [ ] Each migration is a numbered `.sql` or `.ts` file
- [ ] Schema version tracked in `_migrations` table
- [ ] Migrations run automatically on app start
- [ ] Rollback documented (if not implemented)

### 4.4 Repository Pattern

🎯 **Goal:** Wrap all DB access in typed repositories.

✅ **Acceptance Criteria:**

- [ ] `ProjectRepository` with CRUD methods
- [ ] `SessionRepository` with CRUD + listing methods
- [ ] `MessageRepository` with append, list, search
- [ ] `AgentRepository` with status updates
- [ ] `ToolCallRepository`
- [ ] `SettingsRepository`
- [ ] All repositories use Zod for input validation
- [ ] All repositories have unit tests

📦 **Deliverables:**

- `src/main/db/index.ts`
- `src/main/db/schema.sql`
- `src/main/db/migrations/`
- `src/main/db/repositories/*`

🧪 **Tests:**

- [ ] Each repository has CRUD tests using in-memory SQLite
- [ ] Migration runner tested with fresh + existing DBs

### 4.5 Encrypted Storage for Secrets

🎯 **Goal:** Store API keys and SSH credentials securely.

✅ **Acceptance Criteria:**

- [ ] `keytar` or `electron-safe-storage` integrated
- [ ] OS keychain used for API keys
- [ ] Fallback to encrypted file with derived key (if keychain unavailable)
- [ ] Encryption/decryption works on Windows/Mac/Linux
- [ ] No plaintext secrets ever written to disk

---

## Chapter 5: State Management Architecture

🎯 **Chapter Goal:** Establish predictable, performant state management for renderer process.

🔗 **Dependencies:** Chapter 4

### 5.1 Zustand Store Setup

🎯 **Goal:** Configure Zustand for global app state.

✅ **Acceptance Criteria:**

- [ ] Zustand installed
- [ ] Store organization decided (one store per domain vs. single store)
- [ ] Devtools middleware enabled in dev mode
- [ ] Persist middleware configured for non-sensitive UI state
- [ ] TypeScript types exported for all stores

### 5.2 Domain Stores Created

🎯 **Goal:** Define stores for each major domain.

✅ **Acceptance Criteria:**

- [ ] `useProjectStore` (current project, list of projects)
- [ ] `useSessionStore` (active session, messages, drafts)
- [ ] `useAgentStore` (active agents, hierarchy, statuses)
- [ ] `useFlowStore` (flow diagram nodes, edges, layout)
- [ ] `useUIStore` (sidebar state, active tab, modal state)
- [ ] `useSettingsStore` (preferences, theme, models config)
- [ ] `useToolStore` (installed tools, approval cache)
- [ ] Each store has selectors to prevent unnecessary re-renders

### 5.3 Renderer ↔ Main Sync Pattern

🎯 **Goal:** Establish how state flows between processes.

✅ **Acceptance Criteria:**

- [ ] Main is source of truth for persistent data
- [ ] Renderer requests data via IPC, caches in Zustand
- [ ] Real-time updates pushed from main → renderer via IPC events
- [ ] Pattern documented in `docs/state-architecture.md`

📦 **Deliverables:**

- `src/renderer/src/stores/*`
- `docs/state-architecture.md`

🧪 **Tests:**

- [ ] Each store has unit tests for actions and selectors

---

## Chapter 6: IPC & Process Communication

🎯 **Chapter Goal:** Build a type-safe, secure IPC system between main and renderer.

🔗 **Dependencies:** Chapter 5

### 6.1 Preload Script & Context Bridge

🎯 **Goal:** Expose only necessary APIs to renderer.

✅ **Acceptance Criteria:**

- [ ] Preload script defines clear API surface
- [ ] Uses `contextBridge.exposeInMainWorld`
- [ ] No direct Node access from renderer
- [ ] TypeScript types shared via `src/shared/`

### 6.2 IPC Channel Design

🎯 **Goal:** Structure IPC channels for scalability.

✅ **Acceptance Criteria:**

- [ ] Channels follow naming convention: `domain:action` (e.g., `session:create`)
- [ ] Each channel has request/response types
- [ ] Channels documented in `src/shared/ipc-channels.ts`
- [ ] Error responses standardized (success/error envelope)

### 6.3 Type-Safe IPC Wrapper

🎯 **Goal:** Eliminate `any` in IPC calls.

✅ **Acceptance Criteria:**

- [ ] Generic `invoke<T>` wrapper with typed args/returns
- [ ] All IPC handlers registered through a central registry
- [ ] Compile-time error if handler missing for a channel
- [ ] Renderer-side hooks (`useIpc`) for clean usage

### 6.4 Event Streaming (Main → Renderer)

🎯 **Goal:** Stream live data (LLM tokens, agent updates) efficiently.

✅ **Acceptance Criteria:**

- [ ] Event subscription pattern implemented
- [ ] Renderer can subscribe to event channels
- [ ] Backpressure handled (no flooded renderer)
- [ ] Subscription cleanup on component unmount

📦 **Deliverables:**

- `src/preload/index.ts`
- `src/shared/ipc-channels.ts`
- `src/main/ipc/registry.ts`
- `src/renderer/src/hooks/useIpc.ts`

🧪 **Tests:**

- [ ] IPC roundtrip integration tests
- [ ] Error handling tests
- [ ] Streaming tests with mock data

---

# PART III — UI SKELETON

---

## Chapter 7: Layout System (VS Code-style)

🎯 **Chapter Goal:** Build the main application layout with collapsible sidebars and resizable panels matching the user's preference for VS Code-style organization.

🔗 **Dependencies:** Chapter 3, Chapter 6

### 7.1 Root Layout Structure

🎯 **Goal:** Create the top-level layout shell.

✅ **Acceptance Criteria:**

- [ ] Title bar at top (from Chapter 2)
- [ ] Left sidebar (sessions/projects/tools)
- [ ] Activity bar (icon strip on far left)
- [ ] Main content area (tab container)
- [ ] Right sidebar (agent actions panel)
- [ ] Bottom panel (terminal/output, collapsible)
- [ ] Status bar at bottom
- [ ] All sidebars collapse smoothly with animation

### 7.2 Resizable Panels

🎯 **Goal:** Allow user to resize all panels.

✅ **Acceptance Criteria:**

- [ ] `react-resizable-panels` integrated
- [ ] Each panel has min/max width
- [ ] Resize handles styled subtly (visible on hover)
- [ ] Sizes persisted to local storage
- [ ] Double-click handle resets to default

### 7.3 Sidebar Toggle System

🎯 **Goal:** Sidebars can be hidden/shown.

✅ **Acceptance Criteria:**

- [ ] Activity bar icons toggle left sidebar views
- [ ] Right sidebar toggle button
- [ ] Bottom panel toggle button
- [ ] Keyboard shortcuts: Ctrl+B (left), Ctrl+J (bottom), Ctrl+Alt+B (right)
- [ ] State persists across launches

📦 **Deliverables:**

- `src/renderer/src/layouts/MainLayout.tsx`
- `src/renderer/src/components/Layout/ActivityBar.tsx`
- `src/renderer/src/components/Layout/Sidebar.tsx`
- `src/renderer/src/components/Layout/BottomPanel.tsx`
- `src/renderer/src/components/Layout/StatusBar.tsx`

🧪 **Tests:**

- [ ] Layout renders all regions
- [ ] Sidebar toggles work
- [ ] Resize persistence works

---

## Chapter 8: Tab System & Multi-View Support

🎯 **Chapter Goal:** Build a robust tab system supporting mixed content types (chat, files, diff, flow, terminal, plan).

🔗 **Dependencies:** Chapter 7

### 8.1 Tab Container

🎯 **Goal:** Implement the core tab system.

✅ **Acceptance Criteria:**

- [ ] Tabs render in a horizontal strip
- [ ] Each tab shows icon + title + close button
- [ ] Tabs can be reordered via drag
- [ ] Middle-click closes tab
- [ ] Ctrl+Tab cycles tabs
- [ ] Ctrl+W closes active tab
- [ ] Ctrl+T opens new chat tab
- [ ] "Pinned" tabs cannot be closed by normal close
- [ ] Tab overflow handled (scroll buttons or dropdown)

### 8.2 Tab Type System

🎯 **Goal:** Support different content types per tab.

✅ **Acceptance Criteria:**

- [ ] Tab type registry with: `chat`, `editor`, `diff`, `flow`, `terminal`, `plan`, `settings`
- [ ] Each type has its own icon and renderer
- [ ] Tabs serialize to/from JSON for persistence
- [ ] Tab state survives app restart (if user wants)

### 8.3 Tab Persistence

🎯 **Goal:** Restore tabs on relaunch.

✅ **Acceptance Criteria:**

- [ ] Open tabs saved per project
- [ ] Active tab restored
- [ ] Unsaved changes prompt before close
- [ ] User setting to disable restore

📦 **Deliverables:**

- `src/renderer/src/components/Tabs/TabContainer.tsx`
- `src/renderer/src/components/Tabs/Tab.tsx`
- `src/renderer/src/components/Tabs/types.ts`

🧪 **Tests:**

- [ ] Tab CRUD operations
- [ ] Drag reorder
- [ ] Persistence roundtrip

---

## Chapter 9: Sidebar Components & Navigation

🎯 **Chapter Goal:** Build the left sidebar with multiple views (sessions, projects, tools, marketplace).

🔗 **Dependencies:** Chapter 8

### 9.1 Activity Bar Implementation

🎯 **Goal:** Vertical icon strip that switches sidebar contents.

✅ **Acceptance Criteria:**

- [ ] Icons for: Sessions, Projects, Tools, Marketplace, Settings
- [ ] Active icon highlighted
- [ ] Click toggles sidebar (close if same view active)
- [ ] Tooltip on hover
- [ ] Badge support (e.g., new marketplace updates)

### 9.2 Sessions Sidebar View

🎯 **Goal:** Antigravity-style session list.

✅ **Acceptance Criteria:**

- [ ] "+ New Session" button at top
- [ ] Search bar
- [ ] Sessions grouped by: Pinned, Today, Yesterday, Last 7 days, Last 30 days, Older
- [ ] Right-click context menu (rename, pin, archive, delete, export)
- [ ] Click opens session in current/new tab
- [ ] Icon indicates session type/status
- [ ] Drag to reorder pinned items

### 9.3 Projects Sidebar View

🎯 **Goal:** Switch between projects easily.

✅ **Acceptance Criteria:**

- [ ] List of all projects
- [ ] Active project marked
- [ ] "+ New Project" launches wizard
- [ ] Right-click: open, rename, delete, settings, export

### 9.4 Tools Sidebar View

🎯 **Goal:** Quick access to installed tools.

✅ **Acceptance Criteria:**

- [ ] List of installed tools grouped by category
- [ ] Toggle to enable/disable per session
- [ ] Click opens tool settings
- [ ] "Browse Marketplace" button

📦 **Deliverables:**

- `src/renderer/src/components/Sidebar/SessionList.tsx`
- `src/renderer/src/components/Sidebar/ProjectList.tsx`
- `src/renderer/src/components/Sidebar/ToolList.tsx`

🧪 **Tests:**

- [ ] Each sidebar view renders correct data
- [ ] Context menu actions work
- [ ] Search filters correctly

---

## Chapter 10: Status Bar & Toolbar

🎯 **Chapter Goal:** Build the status bar (bottom) and chat toolbar with all the live indicators the user requested.

🔗 **Dependencies:** Chapter 9

### 10.1 Status Bar Components

🎯 **Goal:** Display all key live information.

✅ **Acceptance Criteria:**

- [ ] Current mode display (Fast/Plan/Deep Think/Deep Research)
- [ ] Active model display
- [ ] Live token usage counter
- [ ] Cost so far (this session)
- [ ] Active agents count (e.g., "3 agents")
- [ ] Workspace status (Local / SSH connected with hostname / SSH disconnected)
- [ ] Click each item for quick action

### 10.2 Chat Toolbar (Above Input)

🎯 **Goal:** Antigravity-style toolbar with selectors.

✅ **Acceptance Criteria:**

- [ ] Model selector dropdown
- [ ] Brain mode dropdown (with "Advanced" option)
- [ ] Execution mode dropdown (Parallel/Serial)
- [ ] Tools button (shows count of enabled tools)
- [ ] Attachment button (drag/drop also works)
- [ ] All controls show keyboard shortcuts in tooltips

📦 **Deliverables:**

- `src/renderer/src/components/StatusBar/StatusBar.tsx`
- `src/renderer/src/components/StatusBar/StatusItem.tsx`
- `src/renderer/src/components/Chat/ChatToolbar.tsx`

🧪 **Tests:**

- [ ] Status bar updates reactively
- [ ] Toolbar selectors fire correct events

---

# PART IV — PROJECT & SESSION MANAGEMENT

---

## Chapter 11: Project Creation Wizard

🎯 **Chapter Goal:** Build the multi-step wizard for creating projects with all the configuration options.

🔗 **Dependencies:** Chapter 10

### 11.1 Wizard Framework

🎯 **Goal:** Reusable multi-step wizard component.

✅ **Acceptance Criteria:**

- [ ] Step indicator at top
- [ ] Back / Next / Cancel / Finish buttons
- [ ] Validation per step (cannot proceed if invalid)
- [ ] State preserved if user clicks back
- [ ] Keyboard navigation (Enter to advance, Esc to cancel)
- [ ] Smooth step transitions

### 11.2 Step 1 — Project Basics

✅ **Acceptance Criteria:**

- [ ] Project name input (required, validated)
- [ ] Description textarea (optional)
- [ ] Color picker
- [ ] Icon picker

### 11.3 Step 2 — Workspace Configuration

✅ **Acceptance Criteria:**

- [ ] Toggle: Local folder / SSH remote
- [ ] If Local: folder picker via Electron dialog
- [ ] If SSH: host, port, username, auth method, key/password, remote path
- [ ] "Test Connection" button works for SSH
- [ ] Connection status indicator (green/red)

### 11.4 Step 3 — Model Configuration

✅ **Acceptance Criteria:**

- [ ] Primary agent model selector
- [ ] Default sub-agent model selector
- [ ] Embedding model selector
- [ ] Status indicator next to each (live API check)

### 11.5 Step 4 — Agent Behavior

✅ **Acceptance Criteria:**

- [ ] Agent spawning policy (Hybrid default, per Q5)
- [ ] Sub-agent lifecycle (Dies after task default, per Q7)
- [ ] Tool approval (Require for destructive default, per Q9)
- [ ] All can be changed later in settings

### 11.6 Step 5 — Memory Setup

✅ **Acceptance Criteria:**

- [ ] Global memory toggle + engine selector
- [ ] Local memory toggle + engine selector
- [ ] Memory strategy radio (read-all-write-local / local-first / smart-routing)

### 11.7 Step 6 — Default Mode

✅ **Acceptance Criteria:**

- [ ] Mode picker (Fast/Plan/Deep Think/Deep Research)

### 11.8 Step 7 — Review & Create

✅ **Acceptance Criteria:**

- [ ] Summary of all selections
- [ ] "Create Project" button
- [ ] Project saved to DB
- [ ] Wizard closes, new project becomes active
- [ ] First chat session auto-created

📦 **Deliverables:**

- `src/renderer/src/components/Wizard/ProjectWizard.tsx`
- `src/renderer/src/components/Wizard/steps/*`

🧪 **Tests:**

- [ ] Each step validates correctly
- [ ] Full wizard flow creates project in DB
- [ ] Cancel discards data

---

## Chapter 12: Session Management

🎯 **Chapter Goal:** Implement complete session CRUD with persistence and rich features like in Antigravity.

🔗 **Dependencies:** Chapter 11

### 12.1 Session CRUD

✅ **Acceptance Criteria:**

- [ ] Create session within active project
- [ ] List sessions (sorted by last updated)
- [ ] Open session in tab
- [ ] Rename session (auto-title via AI after first message)
- [ ] Pin/unpin session
- [ ] Archive session
- [ ] Delete session (with confirmation)

### 12.2 Auto-Title Generation

✅ **Acceptance Criteria:**

- [ ] After first user+assistant exchange, AI generates a 3-7 word title
- [ ] Uses cheap model (Haiku/Flash)
- [ ] User can override the title

### 12.3 Session Search

✅ **Acceptance Criteria:**

- [ ] Search box in sidebar
- [ ] Searches title + message content (FTS)
- [ ] Highlights matches
- [ ] Cmd+P quick session switcher

### 12.4 Session Export

✅ **Acceptance Criteria:**

- [ ] Export to Markdown (full conversation)
- [ ] Export to JSON (with metadata)
- [ ] Choose location via dialog

📦 **Deliverables:**

- `src/main/services/SessionService.ts`
- `src/renderer/src/features/sessions/`

🧪 **Tests:**

- [ ] Full CRUD lifecycle
- [ ] Search returns correct results
- [ ] Export produces valid output

---

## Chapter 13: Settings System

🎯 **Chapter Goal:** Build the comprehensive settings UI covering API keys, models, brain modes, tool config, etc.

🔗 **Dependencies:** Chapter 12

### 13.1 Settings Page Structure

✅ **Acceptance Criteria:**

- [ ] Settings opens as a tab (not modal)
- [ ] Left nav: General, API Keys, Models, Brain Modes, Tools, Memory, Workspaces, Marketplace, Advanced, About
- [ ] Each section is independently scrollable
- [ ] Search box at top filters all settings
- [ ] Changes save automatically (with debounce) or via Save button (per section)

### 13.2 API Keys Section

✅ **Acceptance Criteria:**

- [ ] Input for each provider (Anthropic, OpenAI, Google, etc.)
- [ ] Keys masked by default with reveal button
- [ ] "Test" button next to each (calls API to verify)
- [ ] Status indicator (valid/invalid/not-set)
- [ ] Keys stored encrypted (Chapter 4.5)

### 13.3 LLM Agents Configuration

🎯 **Goal:** This is the user's key Q4 design — separate model per brain mode.

✅ **Acceptance Criteria:**

- [ ] Section called "Brain Modes" or "LLM Agents"
- [ ] Four cards: Fast, Plan, Deep Think, Deep Research
- [ ] Each card: model selector, system prompt override, max tokens, temperature
- [ ] Live API status check next to each
- [ ] "Test" button sends a sample prompt
- [ ] Reset to defaults button

### 13.4 General Settings

✅ **Acceptance Criteria:**

- [ ] Theme (currently dark only, but extensible)
- [ ] Font size
- [ ] Language
- [ ] Telemetry opt-out
- [ ] Auto-update behavior

📦 **Deliverables:**

- `src/renderer/src/features/settings/`
- `src/main/services/SettingsService.ts`

🧪 **Tests:**

- [ ] Settings persist
- [ ] API key validation works
- [ ] Model status check works

---

# PART V — LLM INTEGRATION

---

## Chapter 14: LLM Provider Abstraction

🎯 **Chapter Goal:** Build a unified interface so all LLM providers (cloud + local) look the same to the rest of the app.

🔗 **Dependencies:** Chapter 13

### 14.1 Vercel AI SDK Integration

✅ **Acceptance Criteria:**

- [ ] `ai` package installed
- [ ] Provider packages installed (`@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, etc.)
- [ ] Streaming wrapper built
- [ ] Tool calling wrapper built
- [ ] Multi-modal support stubbed

### 14.2 Provider Interface

✅ **Acceptance Criteria:**

- [ ] `LLMProvider` interface defined
- [ ] Methods: `listModels()`, `streamChat()`, `embedText()`, `checkStatus()`
- [ ] Each method returns standardized types
- [ ] Error handling normalized across providers

### 14.3 Model Registry

✅ **Acceptance Criteria:**

- [ ] All known models cataloged with metadata (context window, cost, capabilities)
- [ ] User can add custom models
- [ ] Models filterable by capability (chat/embed/vision/tools)

📦 **Deliverables:**

- `src/main/llm/LLMProvider.ts`
- `src/main/llm/ModelRegistry.ts`

🧪 **Tests:**

- [ ] Mock provider implementation tested
- [ ] Streaming + cancellation tested

---

## Chapter 15: Cloud LLM Providers

🎯 **Chapter Goal:** Implement all cloud providers behind the unified interface.

🔗 **Dependencies:** Chapter 14

### 15.1 Anthropic Provider

✅ **Acceptance Criteria:**

- [ ] List Claude models
- [ ] Streaming chat works
- [ ] Tool calling works
- [ ] Vision input works
- [ ] Status check verifies API key

### 15.2 OpenAI Provider

✅ **Acceptance Criteria:**

- [ ] List GPT models
- [ ] Streaming + tools + vision
- [ ] Status check

### 15.3 Google Provider

✅ **Acceptance Criteria:**

- [ ] List Gemini models
- [ ] Streaming + tools
- [ ] Status check

### 15.4 OpenRouter Provider

✅ **Acceptance Criteria:**

- [ ] OpenAI-compatible endpoint
- [ ] List 100+ available models
- [ ] Streaming works

### 15.5 Additional Providers

✅ **Acceptance Criteria:**

- [ ] Groq, Mistral, DeepSeek, xAI, Together, Fireworks
- [ ] Each follows same interface
- [ ] Custom OpenAI-compatible endpoint support (catch-all)

📦 **Deliverables:**

- `src/main/llm/providers/*`

🧪 **Tests:**

- [ ] Each provider has integration test (skipped without API key)
- [ ] Mock-based unit tests

---

## Chapter 16: Local LLM Providers

🎯 **Chapter Goal:** Auto-detect and integrate all major local LLM runtimes.

🔗 **Dependencies:** Chapter 15

### 16.1 Ollama Integration

✅ **Acceptance Criteria:**

- [ ] Detect if Ollama is running on default port
- [ ] List installed models via `/api/tags`
- [ ] Stream chat via `/api/chat`
- [ ] Pull new models via UI button
- [ ] Show model size/capabilities

### 16.2 LM Studio Integration

✅ **Acceptance Criteria:**

- [ ] Detect LM Studio server (localhost:1234)
- [ ] Use OpenAI-compatible API
- [ ] List loaded models
- [ ] Streaming works

### 16.3 llama.cpp Integration

✅ **Acceptance Criteria:**

- [ ] Connect to llama-server endpoint
- [ ] Configure server path/port

### 16.4 Other Local Runtimes

✅ **Acceptance Criteria:**

- [ ] Jan.ai (OpenAI-compatible)
- [ ] GPT4All
- [ ] vLLM
- [ ] Text Generation WebUI
- [ ] KoboldCpp
- [ ] All discoverable via auto-scan

### 16.5 Auto-Detection Service

✅ **Acceptance Criteria:**

- [ ] On app launch, scan known local ports
- [ ] Show "Local Models Detected" notification
- [ ] One-click add to model list

📦 **Deliverables:**

- `src/main/llm/providers/local/*`
- `src/main/services/LocalRuntimeDetector.ts`

🧪 **Tests:**

- [ ] Mock local servers for tests
- [ ] Auto-detection logic tested

---

## Chapter 17: Streaming Chat Engine

🎯 **Chapter Goal:** Build the actual chat engine that talks to LLMs and streams responses to UI.

🔗 **Dependencies:** Chapter 16

### 17.1 Chat Message Pipeline

✅ **Acceptance Criteria:**

- [ ] User message saved to DB
- [ ] Context assembled (recent messages + system prompt)
- [ ] LLM call initiated with streaming
- [ ] Tokens streamed to renderer in real-time
- [ ] Final response saved to DB with token counts
- [ ] Cancellation works (stop button)

### 17.2 Document-Style Rendering

🎯 **Goal:** Antigravity-style continuous document, not chat bubbles (per Q4=B).

✅ **Acceptance Criteria:**

- [ ] Messages render as continuous flow
- [ ] User messages styled differently from AI (subtle, not bubbled)
- [ ] Markdown rendering with code blocks
- [ ] Code syntax highlighting
- [ ] Inline file references clickable
- [ ] Smooth scroll-to-bottom during streaming
- [ ] User can scroll up without auto-scroll forcing them down

### 17.3 Message Actions

✅ **Acceptance Criteria:**

- [ ] Copy message
- [ ] Regenerate response
- [ ] Edit user message (forks conversation)
- [ ] Delete message pair
- [ ] Branch from any point

### 17.4 Multi-modal Input

✅ **Acceptance Criteria:**

- [ ] Drag/drop images
- [ ] Drag/drop PDFs
- [ ] Paste images from clipboard
- [ ] File preview in input area
- [ ] Files sent to vision-capable models

📦 **Deliverables:**

- `src/main/services/ChatService.ts`
- `src/renderer/src/features/chat/`

🧪 **Tests:**

- [ ] Streaming end-to-end
- [ ] Cancellation
- [ ] Markdown rendering
- [ ] Multi-modal pipeline

---

## Chapter 18: Model + Mode Selector System

🎯 **Chapter Goal:** Implement the user's specific design (Q4) — separate model selector and brain mode selector with Advanced option.

🔗 **Dependencies:** Chapter 17

### 18.1 Model Selector Component

✅ **Acceptance Criteria:**

- [ ] Dropdown lists all configured models
- [ ] Grouped by provider with badges (🟢 Local, ☁️ Cloud, ⚡ Fast)
- [ ] Search/filter within dropdown
- [ ] Live status dot per model
- [ ] Recently used at top
- [ ] Selection updates active session

### 18.2 Brain Mode Selector Component

✅ **Acceptance Criteria:**

- [ ] Dropdown with: Fast / Plan / Deep Think / Deep Research / Advanced
- [ ] When "Advanced" selected, expanded panel shows per-mode model config
- [ ] Mode change reflects in status bar
- [ ] Mode applies to currently active session

### 18.3 Advanced Mode Configuration

🎯 **Goal:** Dynamic agent invocation based on conversation needs.

✅ **Acceptance Criteria:**

- [ ] Each mode has its assigned model from settings (Chapter 13.3)
- [ ] Primary agent has tools to invoke specialized agents
- [ ] When user asks for research → Research Agent spawned with Deep Research model
- [ ] When user asks to plan → Plan Agent spawned with Plan model
- [ ] Model used per agent visible in flow diagram

📦 **Deliverables:**

- `src/renderer/src/components/ModelSelector.tsx`
- `src/renderer/src/components/ModeSelector.tsx`

🧪 **Tests:**

- [ ] Selector state syncs to backend
- [ ] Advanced config persists

---

# PART VI — AGENT SYSTEM

---

## Chapter 19: Agent Core Architecture

🎯 **Chapter Goal:** Define the foundational agent abstraction that all agents (primary, sub, specialized) inherit from.

🔗 **Dependencies:** Chapter 18

### 19.1 Agent Class Definition

✅ **Acceptance Criteria:**

- [ ] `Agent` base class with: id, parentId, name, role, model, status, actions[], children[]
- [ ] State machine: idle → thinking → working → done/failed
- [ ] Event emitter for status changes
- [ ] Lifecycle hooks (onStart, onAction, onComplete, onError)

### 19.2 Agent Orchestrator

✅ **Acceptance Criteria:**

- [ ] Singleton orchestrator in main process
- [ ] Tracks all active agents per session
- [ ] Routes messages between agents
- [ ] Enforces max depth limit
- [ ] Enforces token/cost budget per chain
- [ ] Graceful shutdown

### 19.3 Agent Identity & Roles

✅ **Acceptance Criteria:**

- [ ] System prompts per role (Primary, Researcher, Planner, Coder, Reviewer, etc.)
- [ ] Roles defined in `src/main/agents/roles/`
- [ ] Custom roles addable via settings

📦 **Deliverables:**

- `src/main/agents/Agent.ts`
- `src/main/agents/AgentOrchestrator.ts`
- `src/main/agents/roles/`

🧪 **Tests:**

- [ ] State machine transitions
- [ ] Orchestrator lifecycle
- [ ] Budget enforcement

---

## Chapter 20: Sub-Agent Spawning

🎯 **Chapter Goal:** Implement the actual `spawn_agent` tool that primary agents use.

🔗 **Dependencies:** Chapter 19

### 20.1 spawn_agent Tool Definition

✅ **Acceptance Criteria:**

- [ ] Tool schema exposed to LLM
- [ ] Args: name, role, model (optional), task, tools (optional), execution_mode (parallel/serial)
- [ ] Tool call creates new Agent in DB
- [ ] Returns agent_id immediately, agent runs async

### 20.2 Recursive Spawning

✅ **Acceptance Criteria:**

- [ ] Sub-agents can also use spawn_agent
- [ ] Parent-child hierarchy tracked
- [ ] Max depth enforced (default 5, configurable)
- [ ] Circular reference prevented

### 20.3 Parallel vs Serial Execution

✅ **Acceptance Criteria:**

- [ ] Toolbar dropdown sets default
- [ ] Parent can override per spawn call
- [ ] Parallel: agents run concurrently, parent waits for all
- [ ] Serial: agents run one at a time
- [ ] Visualization shows execution mode

📦 **Deliverables:**

- `src/main/agents/tools/SpawnAgentTool.ts`
- `src/main/agents/ExecutionStrategy.ts`

🧪 **Tests:**

- [ ] Spawn creates agent
- [ ] Parallel mode runs concurrently
- [ ] Max depth blocks excessive nesting

---

## Chapter 21: Agent Communication (Blackboard)

🎯 **Chapter Goal:** Implement the shared blackboard pattern (per Q6=C) for agents to coordinate.

🔗 **Dependencies:** Chapter 20

### 21.1 Blackboard Service

✅ **Acceptance Criteria:**

- [ ] Per-session blackboard (in-memory + persisted)
- [ ] Agents can write/read keys
- [ ] Subscribe to key changes
- [ ] Versioned entries (audit trail)
- [ ] Conflict resolution (last-write-wins by default)

### 21.2 Communication Tools

✅ **Acceptance Criteria:**

- [ ] `blackboard_write(key, value)` tool
- [ ] `blackboard_read(key)` tool
- [ ] `blackboard_subscribe(key)` for reactive workflows
- [ ] `message_parent(content)` shortcut tool
- [ ] All accessible to any agent

### 21.3 Result Aggregation

✅ **Acceptance Criteria:**

- [ ] Parent can wait for sub-agent results
- [ ] Results bubble up via blackboard
- [ ] Failed sub-agents reported with error context

📦 **Deliverables:**

- `src/main/agents/Blackboard.ts`
- `src/main/agents/tools/BlackboardTools.ts`

🧪 **Tests:**

- [ ] Read/write/subscribe works
- [ ] Concurrent access safe
- [ ] Result aggregation correct

---

## Chapter 22: Agent Lifecycle Management

🎯 **Chapter Goal:** Build user-facing controls for managing live agents.

🔗 **Dependencies:** Chapter 21

### 22.1 Pause / Resume / Kill

✅ **Acceptance Criteria:**

- [ ] Pause: agent stops at next safe point
- [ ] Resume: agent continues
- [ ] Kill: agent terminates immediately, status=failed
- [ ] Children inherit parent's pause/kill
- [ ] All controls in agent actions panel

### 22.2 Agent Persistence Setting

✅ **Acceptance Criteria:**

- [ ] Per-project default (Q7=A: dies after task)
- [ ] Per-spawn override
- [ ] Persistent agents listed for reuse

📦 **Deliverables:**

- `src/main/agents/LifecycleController.ts`
- `src/renderer/src/features/agents/AgentControls.tsx`

🧪 **Tests:**

- [ ] Lifecycle transitions correct
- [ ] Cascade to children

---

## Chapter 23: Brain Modes (Fast/Plan/Deep Think/Deep Research)

🎯 **Chapter Goal:** Implement the four modes with their specific behaviors per user spec (Q5, Q6).

🔗 **Dependencies:** Chapter 22

### 23.1 Fast Mode

✅ **Acceptance Criteria:**

- [ ] Uses Fast model from brain config
- [ ] Limited to direct response, no spawning
- [ ] Optimized for low latency
- [ ] Use case: quick lookups, simple Q&A

### 23.2 Plan Mode

🎯 **Goal:** Brainstorm without executing, output Plan.md (per Q5=A).

✅ **Acceptance Criteria:**

- [ ] No tool execution allowed
- [ ] Spawns Plan-helper sub-agents for brainstorming
- [ ] Outputs structured Plan.md
- [ ] Plan.md updates iteratively (diffs visible)
- [ ] User can refine plan via chat
- [ ] "Execute Plan" button transitions to Deep Think mode (Chapter 33)

### 23.3 Deep Think Mode

✅ **Acceptance Criteria:**

- [ ] Uses Deep Think model (Opus-tier)
- [ ] Allows full tool access
- [ ] Encouraged to spawn sub-agents
- [ ] Long context retention
- [ ] Use case: complex coding, architecture, deep analysis

### 23.4 Deep Research Mode

🎯 **Goal:** Perplexity-style (per Q6=A).

✅ **Acceptance Criteria:**

- [ ] Auto-spawns research sub-agents
- [ ] Web search heavy
- [ ] Citations tracked and shown
- [ ] Research plan shown first (user can approve/reject)
- [ ] Final output: structured report with sources
- [ ] Configurable depth

📦 **Deliverables:**

- `src/main/agents/modes/FastMode.ts`
- `src/main/agents/modes/PlanMode.ts`
- `src/main/agents/modes/DeepThinkMode.ts`
- `src/main/agents/modes/DeepResearchMode.ts`

🧪 **Tests:**

- [ ] Each mode constrains behavior correctly
- [ ] Mode transitions work
- [ ] Plan Mode never executes tools

---

# PART VII — VISUALIZATION

---

## Chapter 24: Flow Diagram Engine

🎯 **Chapter Goal:** Build the React Flow-based agent visualization (the user's hero feature).

🔗 **Dependencies:** Chapter 23

### 24.1 React Flow Setup

✅ **Acceptance Criteria:**

- [ ] `@xyflow/react` installed
- [ ] Flow renders in dedicated tab type
- [ ] Pan/zoom works
- [ ] Mini-map shown
- [ ] Background grid styled to match dark theme

### 24.2 Custom Node Types

✅ **Acceptance Criteria:**

- [ ] Primary agent node (larger, distinct)
- [ ] Sub-agent node (medium)
- [ ] Tool call node (small)
- [ ] Each shows: icon, name, status, model, current action
- [ ] Status color borders (idle/thinking/working/done/failed)
- [ ] Click opens agent details panel
- [ ] Hover shows tooltip with full info

### 24.3 Edge System

✅ **Acceptance Criteria:**

- [ ] Spawn edges (parent → child)
- [ ] Communication edges (blackboard reads/writes)
- [ ] Result edges (child → parent on completion)
- [ ] Animated edges when active
- [ ] Edge labels show data type

### 24.4 Auto-Layout

✅ **Acceptance Criteria:**

- [ ] Dagre algorithm for hierarchical layout
- [ ] Layout updates as agents spawn
- [ ] Smooth animations on layout changes
- [ ] Manual drag overrides auto-layout for that node
- [ ] "Reset Layout" button

### 24.5 Real-Time Updates

✅ **Acceptance Criteria:**

- [ ] New agent → node fades in
- [ ] Status change → border color transitions
- [ ] Action update → node "pulses"
- [ ] Completion → checkmark animation
- [ ] Failure → red shake animation

📦 **Deliverables:**

- `src/renderer/src/features/flow/FlowDiagram.tsx`
- `src/renderer/src/features/flow/nodes/`
- `src/renderer/src/features/flow/edges/`

🧪 **Tests:**

- [ ] Nodes render
- [ ] Updates reflect in real-time
- [ ] Layout is stable

---

## Chapter 25: Agent Actions Panel

🎯 **Chapter Goal:** Build the right sidebar showing live agent activity (per Q17 — show each agent's usage dynamically).

🔗 **Dependencies:** Chapter 24

### 25.1 Live Action Stream

✅ **Acceptance Criteria:**

- [ ] List of all active agents
- [ ] Each agent expandable to show actions
- [ ] Latest action highlighted
- [ ] Auto-scroll to newest action
- [ ] Filter by status / agent
- [ ] Search within actions

### 25.2 Agent Detail View

✅ **Acceptance Criteria:**

- [ ] Click agent → expanded view
- [ ] Shows: full system prompt, model, full action log, token usage, cost
- [ ] Live streaming text (per Q8=A)
- [ ] Pause/resume/kill controls

### 25.3 Stats Display

✅ **Acceptance Criteria:**

- [ ] Active agents count
- [ ] Done agents count
- [ ] Failed agents count
- [ ] Total tokens used
- [ ] Total cost

📦 **Deliverables:**

- `src/renderer/src/features/agents/AgentActionsPanel.tsx`
- `src/renderer/src/features/agents/AgentDetailView.tsx`

🧪 **Tests:**

- [ ] Live updates
- [ ] Filters work
- [ ] Stats calculations correct

---

## Chapter 26: Live Token & Cost Tracking

🎯 **Chapter Goal:** Implement per-agent dynamic token + cost tracking shown live (per Q17).

🔗 **Dependencies:** Chapter 25

### 26.1 Token Counting

✅ **Acceptance Criteria:**

- [ ] Tokens counted per agent on every LLM call
- [ ] Input vs output tokens separately
- [ ] Aggregated to session, project, global
- [ ] Live update during streaming

### 26.2 Cost Calculation

✅ **Acceptance Criteria:**

- [ ] Pricing table for all known models
- [ ] Cost calculated using actual tokens × model rate
- [ ] Currency in user's locale
- [ ] Per-agent cost shown in node
- [ ] Total session cost in status bar

### 26.3 Visualizations

✅ **Acceptance Criteria:**

- [ ] Sparkline of cost over time
- [ ] Pie chart of cost by agent (in detail view)
- [ ] Warning banner if session > $X (configurable)

📦 **Deliverables:**

- `src/main/services/TokenTracker.ts`
- `src/main/data/model-pricing.ts`
- `src/renderer/src/features/cost/`

🧪 **Tests:**

- [ ] Token counting accurate
- [ ] Cost calculation matches expected values

---

# PART VIII — TOOL SYSTEM

---

## Chapter 27: Tool Architecture & MCP Integration

🎯 **Chapter Goal:** Build the tool system using MCP as the standard, supporting local plugins, MCP servers, and custom tools.

🔗 **Dependencies:** Chapter 26

### 27.1 Tool Interface

✅ **Acceptance Criteria:**

- [ ] `Tool` interface: name, description, schema (JSON Schema), execute()
- [ ] Tools register with central `ToolRegistry`
- [ ] Tools categorized (file/web/code/etc.)
- [ ] Tools have permission flags (destructive, network, fs, exec)

### 27.2 MCP Client

✅ **Acceptance Criteria:**

- [ ] `@modelcontextprotocol/sdk` integrated
- [ ] Support stdio MCP servers (subprocess)
- [ ] Support HTTP/SSE MCP servers
- [ ] Auto-list tools from connected servers
- [ ] User's existing MCP servers (`/home/docker/docker/mcp`) connectable

### 27.3 Tool Sandboxing

✅ **Acceptance Criteria:**

- [ ] Each tool runs in restricted context
- [ ] FS access limited to workspace
- [ ] Network access controllable
- [ ] Subprocess execution limited

### 27.4 Tool Lifecycle

✅ **Acceptance Criteria:**

- [ ] Install → enable → use → disable → uninstall
- [ ] Per-project enabled tools
- [ ] Per-agent allowed tools
- [ ] Tool errors gracefully reported to agent

📦 **Deliverables:**

- `src/main/tools/ToolRegistry.ts`
- `src/main/tools/MCPClient.ts`
- `src/main/tools/Tool.ts`

🧪 **Tests:**

- [ ] Mock tool execution
- [ ] MCP roundtrip
- [ ] Permission enforcement

---

## Chapter 28: Built-in Tool Pack (5 Essentials)

🎯 **Chapter Goal:** Ship with 5 working built-in tools (per user MVP scope).

🔗 **Dependencies:** Chapter 27

### 28.1 File System Tool

✅ **Acceptance Criteria:**

- [ ] read_file, write_file, list_dir, search_files
- [ ] Restricted to workspace
- [ ] Approval required for write/delete
- [ ] Diff shown before write

### 28.2 Web Search Tool

✅ **Acceptance Criteria:**

- [ ] Provider plug-in (Tavily, Brave, SerpAPI, DuckDuckGo)
- [ ] User picks provider in settings
- [ ] Returns title, URL, snippet, date
- [ ] Citations tracked

### 28.3 Web Fetch Tool

✅ **Acceptance Criteria:**

- [ ] Fetches URL → markdown
- [ ] Handles HTML, PDF, JSON
- [ ] Respects robots.txt
- [ ] Rate limiting

### 28.4 Code Executor Tool

🎯 **Goal:** Docker-sandboxed (per Q10=B).

✅ **Acceptance Criteria:**

- [ ] Languages: Python, Node, Bash
- [ ] Each execution in fresh Docker container
- [ ] Resource limits (CPU/memory/time)
- [ ] Files mounted read-only from workspace
- [ ] Output captured and returned
- [ ] Approval required by default

### 28.5 Workspace Tools

✅ **Acceptance Criteria:**

- [ ] Project tree listing
- [ ] File search by name
- [ ] Content search (ripgrep)

📦 **Deliverables:**

- `src/main/tools/builtin/*`

🧪 **Tests:**

- [ ] Each tool tested with safe and unsafe inputs
- [ ] Sandbox verified to block escapes

---

## Chapter 29: Tool Approval UX

🎯 **Chapter Goal:** Implement inline approval (per Q11=B) with all persistence options (per Q12=E).

🔗 **Dependencies:** Chapter 28

### 29.1 Inline Approval Component

✅ **Acceptance Criteria:**

- [ ] Approval card renders in chat where tool was called
- [ ] Shows: tool name, args (formatted), risk level
- [ ] Buttons: Allow Once / Allow Session / Allow Project / Allow Always / Deny
- [ ] Optional reason input
- [ ] Diff preview for file writes

### 29.2 Approval Persistence

✅ **Acceptance Criteria:**

- [ ] Per-call (default for destructive)
- [ ] Per-session in memory
- [ ] Per-project in DB
- [ ] Global in DB
- [ ] Cache checked in order: global → project → session → ask

### 29.3 Bulk Approval Manager

✅ **Acceptance Criteria:**

- [ ] Settings page lists all approvals
- [ ] Revoke individual or bulk
- [ ] Show usage history per approval

📦 **Deliverables:**

- `src/renderer/src/features/approvals/`
- `src/main/services/ApprovalService.ts`

🧪 **Tests:**

- [ ] Approval flow end-to-end
- [ ] Persistence at each scope
- [ ] Revocation works

---

## Chapter 30: Docker Code Sandbox

🎯 **Chapter Goal:** Production-grade Docker sandbox for code execution (deepens Chapter 28.4).

🔗 **Dependencies:** Chapter 29

### 30.1 Docker Integration

✅ **Acceptance Criteria:**

- [ ] `dockerode` installed
- [ ] Detects Docker Desktop / Docker Engine
- [ ] Pulls base images on first use (with progress)
- [ ] Images: `python:slim`, `node:slim`, `alpine` (bash)

### 30.2 Container Pool

✅ **Acceptance Criteria:**

- [ ] Reusable container pool for performance
- [ ] Containers reset between sessions
- [ ] Auto-cleanup of stale containers

### 30.3 Secure Execution

✅ **Acceptance Criteria:**

- [ ] No network unless explicitly allowed
- [ ] No host volume mounts except workspace (read-only by default)
- [ ] CPU/memory limits set
- [ ] Timeout (30s default, configurable)
- [ ] Output truncation if too large

### 30.4 Persistent Environment

✅ **Acceptance Criteria:**

- [ ] Optional persistent container per session
- [ ] State survives between executions in same session
- [ ] User can install packages (cached)
- [ ] Reset button to clear state

📦 **Deliverables:**

- `src/main/sandbox/DockerSandbox.ts`
- `src/main/sandbox/ContainerPool.ts`

🧪 **Tests:**

- [ ] Hello world execution per language
- [ ] Resource limits enforced
- [ ] Isolation verified (no host access)

---

# PART IX — ANTIGRAVITY-LIKE FEATURES

---

## Chapter 31: Artifact System

🎯 **Chapter Goal:** Implement Antigravity-style artifacts (per Q13=A — match Antigravity).

🔗 **Dependencies:** Chapter 30

### 31.1 Artifact Detection

✅ **Acceptance Criteria:**

- [ ] AI outputs in artifact tags rendered specially
- [ ] Types: code, markdown, html, svg, react
- [ ] Inline preview in chat
- [ ] Right panel expanded view

### 31.2 Artifact Rendering

✅ **Acceptance Criteria:**

- [ ] Code: syntax-highlighted with copy button
- [ ] Markdown: rendered with TOC
- [ ] HTML/React: sandboxed iframe preview
- [ ] SVG: inline with download

### 31.3 Artifact Persistence

✅ **Acceptance Criteria:**

- [ ] Artifacts saved to project folder (with approval)
- [ ] Versioned (v1, v2, ...)
- [ ] Diff between versions
- [ ] Reference artifacts from later messages

📦 **Deliverables:**

- `src/renderer/src/features/artifacts/`

🧪 **Tests:**

- [ ] Each artifact type renders
- [ ] Version diffs accurate

---

## Chapter 32: Diff Viewer

🎯 **Chapter Goal:** First-class diff viewer (per user requirement).

🔗 **Dependencies:** Chapter 31

### 32.1 Monaco Diff Editor

✅ **Acceptance Criteria:**

- [ ] Monaco Editor integrated (lazy-loaded)
- [ ] Side-by-side diff view
- [ ] Inline diff option
- [ ] Syntax highlighting per language
- [ ] Line numbers
- [ ] Word-level diff highlights

### 32.2 Diff Tab Type

✅ **Acceptance Criteria:**

- [ ] New tab type "Diff"
- [ ] Opens when AI proposes file change
- [ ] Shows: original (left), proposed (right)
- [ ] Approve / Reject buttons
- [ ] Stage / Unstage individual hunks (later)

### 32.3 Inline Chat Diffs

✅ **Acceptance Criteria:**

- [ ] Small diffs render inline in chat
- [ ] Click to expand to full Diff tab

📦 **Deliverables:**

- `src/renderer/src/features/diff/`

🧪 **Tests:**

- [ ] Diff calculation correct
- [ ] Approve/reject flow works

---

## Chapter 33: Plan.md Iteration System

🎯 **Chapter Goal:** Implement Antigravity-style living Plan.md (per user spec for Plan Mode).

🔗 **Dependencies:** Chapter 32

### 33.1 Plan.md Generation

✅ **Acceptance Criteria:**

- [ ] When Plan Mode activates, AI creates Plan.md in workspace
- [ ] File structure: Goal, Steps, Open Questions, Risks
- [ ] Auto-saved with approval

### 33.2 Iterative Updates

✅ **Acceptance Criteria:**

- [ ] User chats with AI to refine plan
- [ ] AI edits Plan.md, shows diff in real-time
- [ ] Each iteration versioned
- [ ] User sees Plan.md in dedicated tab

### 33.3 Execute Plan Transition

✅ **Acceptance Criteria:**

- [ ] "Execute Plan" button at top of Plan.md tab
- [ ] On click: switches to Deep Think mode
- [ ] AI uses Plan.md as guide
- [ ] Updates Plan.md with execution status (✅ done, ⏳ in progress)

📦 **Deliverables:**

- `src/main/features/plan/PlanService.ts`
- `src/renderer/src/features/plan/PlanView.tsx`

🧪 **Tests:**

- [ ] Plan.md created on mode activation
- [ ] Iterations preserve history
- [ ] Execute transition works

---

## Chapter 34: File Save Approval Flow

🎯 **Chapter Goal:** Antigravity-style file save approvals.

🔗 **Dependencies:** Chapter 33

### 34.1 Pre-Save Approval

✅ **Acceptance Criteria:**

- [ ] Any file write triggers approval flow
- [ ] Diff shown before save
- [ ] Approve / Reject / Edit
- [ ] User can modify before approving

### 34.2 Batch Approvals

✅ **Acceptance Criteria:**

- [ ] Multiple file changes approved together
- [ ] Per-file accept/reject within batch
- [ ] Bulk approve all

### 34.3 Approval History

✅ **Acceptance Criteria:**

- [ ] All file edits logged
- [ ] Restore previous version
- [ ] Undo last change

📦 **Deliverables:**

- `src/main/services/FileApprovalService.ts`

🧪 **Tests:**

- [ ] Single file approval
- [ ] Batch approval
- [ ] History/restore

---

# PART X — ADVANCED FEATURES

---

## Chapter 35: Memory System Architecture

🎯 **Chapter Goal:** Build the plugin-based memory system (per user research request).

🔗 **Dependencies:** Chapter 34

### 35.1 Memory Engine Interface

✅ **Acceptance Criteria:**

- [ ] Standard methods: store, retrieve, search, forget, summarize, list
- [ ] MCP-compatible
- [ ] Async with streaming support

### 35.2 Built-in Memory Engines

✅ **Acceptance Criteria:**

- [ ] SQLite-based (default, zero-config)
- [ ] ChromaDB embedded (vector)
- [ ] Simple JSON file (fallback)

### 35.3 Memory Scopes

✅ **Acceptance Criteria:**

- [ ] Global (all projects)
- [ ] Project-local
- [ ] Session
- [ ] Routing strategy configurable

### 35.4 Memory Tools for Agents

✅ **Acceptance Criteria:**

- [ ] `remember(content, scope)` tool
- [ ] `recall(query)` tool
- [ ] `forget(id)` tool
- [ ] Auto-injection of relevant memories

📦 **Deliverables:**

- `src/main/memory/MemoryEngine.ts`
- `src/main/memory/engines/*`

🧪 **Tests:**

- [ ] Each engine implements interface
- [ ] Scoping works
- [ ] Recall accuracy validated

---

## Chapter 36: Workspace SSH Support

🎯 **Chapter Goal:** Antigravity-style remote workspace via SSH.

🔗 **Dependencies:** Chapter 35

### 36.1 SSH Connection Manager

✅ **Acceptance Criteria:**

- [ ] `ssh2` library integrated
- [ ] Connection pooling
- [ ] Auto-reconnect on drop
- [ ] Status indicator in status bar
- [ ] Keys from OS keychain (per Q13=A)

### 36.2 Remote File Operations

✅ **Acceptance Criteria:**

- [ ] SFTP for file ops
- [ ] Tools transparently work on remote
- [ ] File listing, read, write, search
- [ ] Local agent processing, remote execution (per Q1=A)

### 36.3 Remote Command Execution

✅ **Acceptance Criteria:**

- [ ] `exec` over SSH
- [ ] Streaming stdout/stderr to UI
- [ ] Working directory locked to remote workspace
- [ ] Timeout handling

📦 **Deliverables:**

- `src/main/ssh/SSHManager.ts`
- `src/main/ssh/RemoteFileSystem.ts`

🧪 **Tests:**

- [ ] Connection lifecycle
- [ ] File operations
- [ ] Command execution

---

## Chapter 37: Marketplace & Plugin System

🎯 **Chapter Goal:** VS Code-style marketplace for tools, agents, memory engines, and other plugins (per Q14=B GitHub-based, Q15=D sandboxed + tiered).

🔗 **Dependencies:** Chapter 36

### 37.1 Plugin Manifest Standard

✅ **Acceptance Criteria:**

- [ ] `manifest.json` schema defined
- [ ] Required fields: name, version, type, entry, permissions
- [ ] Validation on install

### 37.2 Plugin Types

✅ **Acceptance Criteria:**

- [ ] Tool plugins
- [ ] Memory engine plugins
- [ ] Agent role plugins
- [ ] LLM provider plugins
- [ ] UI extension plugins (later)

### 37.3 Marketplace UI

✅ **Acceptance Criteria:**

- [ ] Browse / search / categories
- [ ] Plugin detail page (description, screenshots, permissions)
- [ ] Install / uninstall buttons
- [ ] Update notifications
- [ ] Trust tier badges (Verified / Community / Experimental)

### 37.4 GitHub Distribution

✅ **Acceptance Criteria:**

- [ ] Plugins fetched from GitHub releases
- [ ] Custom GitHub URL support
- [ ] Signature verification (later)

### 37.5 Sandboxing

✅ **Acceptance Criteria:**

- [ ] Plugins run in isolated context
- [ ] Permissions requested up front
- [ ] User-grantable per permission
- [ ] Revocable

### 37.6 Plugin SDK (Open Source)

✅ **Acceptance Criteria:**

- [ ] Public SDK package
- [ ] Documentation site
- [ ] Example plugins
- [ ] Plugin scaffold CLI

📦 **Deliverables:**

- `src/main/marketplace/`
- `src/renderer/src/features/marketplace/`
- `packages/sdk/` (separate package)

🧪 **Tests:**

- [ ] Manifest validation
- [ ] Install/uninstall lifecycle
- [ ] Sandbox enforcement

---

# PART XI — POLISH & RELEASE

---

## Chapter 38: Multi-modal Input

🎯 **Chapter Goal:** Drag/drop images, PDFs, files into chat (per Q15=A).

🔗 **Dependencies:** Chapter 37

✅ **Acceptance Criteria:**

- [ ] Drop zone in chat input
- [ ] Image preview thumbnails
- [ ] PDF page count display
- [ ] Files attached to next message
- [ ] Vision-capable model auto-selected when images present
- [ ] Warning if model doesn't support attached file type

📦 **Deliverables:**

- `src/renderer/src/features/chat/MultimodalInput.tsx`

🧪 **Tests:**

- [ ] Drop handling
- [ ] File type detection
- [ ] Model compatibility check

---

## Chapter 39: Keyboard Shortcuts & Command Palette

🎯 **Chapter Goal:** Quick switcher (per Q9=B).

🔗 **Dependencies:** Chapter 38

### 39.1 Quick Switcher

✅ **Acceptance Criteria:**

- [ ] Ctrl+P opens
- [ ] Search sessions, projects, files, commands
- [ ] Fuzzy matching
- [ ] Recent items at top

### 39.2 Global Hotkeys

✅ **Acceptance Criteria:**

- [ ] Ctrl+N new session
- [ ] Ctrl+Shift+N new project
- [ ] Ctrl+, settings
- [ ] Ctrl+B / Ctrl+J / Ctrl+Alt+B (sidebars)
- [ ] Ctrl+Tab cycle tabs
- [ ] Customizable in settings

📦 **Deliverables:**

- `src/renderer/src/features/quickswitcher/`
- `src/renderer/src/services/HotkeyService.ts`

🧪 **Tests:**

- [ ] Hotkeys trigger actions
- [ ] Quick switcher search

---

## Chapter 40: Cross-Platform Build & Distribution

🎯 **Chapter Goal:** Build for Windows, Mac, Linux (per Q4 from earlier).

🔗 **Dependencies:** Chapter 39

✅ **Acceptance Criteria:**

- [ ] Windows: NSIS installer + portable
- [ ] macOS: DMG (Intel + Apple Silicon, signed + notarized)
- [ ] Linux: AppImage + deb + rpm
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Code signing certificates configured
- [ ] All builds tested on respective OSes

📦 **Deliverables:**

- `electron-builder.yml`
- `.github/workflows/release.yml`

🧪 **Tests:**

- [ ] Each platform build launches
- [ ] Installer smoke test
- [ ] Auto-launch on first install works

---

## Chapter 41: Auto-Updater

🎯 **Chapter Goal:** Seamless updates.

🔗 **Dependencies:** Chapter 40

✅ **Acceptance Criteria:**

- [ ] `electron-updater` integrated
- [ ] Update checks on launch + every 4 hours
- [ ] User notified of available update
- [ ] Download in background
- [ ] User installs at convenience
- [ ] Beta channel option
- [ ] Update settings in preferences

📦 **Deliverables:**

- `src/main/updater.ts`

🧪 **Tests:**

- [ ] Update check flow
- [ ] Apply update in test environment

---

## Chapter 42: Final QA & Launch

🎯 **Chapter Goal:** Verify everything works end-to-end before declaring v1.0.

🔗 **Dependencies:** ALL prior chapters

### 42.1 End-to-End Test Suite

✅ **Acceptance Criteria:**

- [ ] Playwright tests for critical flows
- [ ] Project creation end-to-end
- [ ] Chat with cloud LLM
- [ ] Chat with local LLM
- [ ] Sub-agent spawning + flow visualization
- [ ] Tool execution with approval
- [ ] File diff approval
- [ ] SSH workspace
- [ ] All passing on Windows/Mac/Linux

### 42.2 Performance Audit

✅ **Acceptance Criteria:**

- [ ] App launch under 3 seconds
- [ ] Memory usage stable over long sessions
- [ ] No memory leaks (heap snapshots compared)
- [ ] Smooth animations (60 FPS) on flow diagram with 20+ agents
- [ ] DB queries < 100ms

### 42.3 Security Review

✅ **Acceptance Criteria:**

- [ ] Electron security checklist passed
- [ ] No XSS in markdown rendering
- [ ] CSP headers configured
- [ ] API keys never logged
- [ ] Plugin sandbox verified

### 42.4 Documentation

✅ **Acceptance Criteria:**

- [ ] User guide complete
- [ ] Plugin developer guide
- [ ] API reference (for SDK)
- [ ] Video walkthrough
- [ ] FAQ

### 42.5 Launch Checklist

✅ **Acceptance Criteria:**

- [ ] GitHub release with binaries
- [ ] Website / landing page (optional)
- [ ] Initial marketplace plugins available
- [ ] Issue templates set up
- [ ] License clear

📦 **Deliverables:**

- E2E test suite
- Documentation site
- v1.0 GitHub release

🧪 **Tests:**

- [ ] Full E2E suite passes
- [ ] Performance benchmarks met

---

# 🎬 Appendix A — Verification Protocol

After completing each chapter, run this checklist:

```
□ All acceptance criteria checked
□ Unit tests written and passing
□ Integration test (if applicable) passing
□ Manual smoke test by user completed
□ No new TypeScript errors
□ No new ESLint warnings
□ Code formatted (Prettier)
□ Git commit with conventional message
□ Documentation updated (if applicable)
□ User approval before next chapter
```

---

# 🎬 Appendix B — File Structure Reference

```
agent-flow-manager/
├── .github/
│   └── workflows/
├── docs/
│   ├── design-tokens.md
│   ├── state-architecture.md
│   ├── plugin-development.md
│   └── user-guide.md
├── packages/
│   └── sdk/                    # Plugin SDK (Chapter 37)
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts
│   │   ├── window.ts
│   │   ├── db/
│   │   ├── ipc/
│   │   ├── llm/
│   │   ├── agents/
│   │   ├── tools/
│   │   ├── memory/
│   │   ├── ssh/
│   │   ├── sandbox/
│   │   ├── marketplace/
│   │   └── services/
│   ├── preload/
│   │   └── index.ts
│   ├── renderer/
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── routes/
│   │       ├── stores/
│   │       └── styles/
│   └── shared/                 # Shared types
│       ├── ipc-channels.ts
│       └── types.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── electron.vite.config.ts
├── electron-builder.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🎬 Appendix C — Risk Register

| Risk                                           | Severity | Mitigation                                 |
| ---------------------------------------------- | -------- | ------------------------------------------ |
| Electron security vulnerabilities              | High     | Strict context isolation, regular updates  |
| LLM provider API changes breaking integrations | Medium   | Use AI SDK abstraction, version locks      |
| Performance with many agents                   | Medium   | Virtualized lists, throttled updates       |
| Docker dependency for sandbox                  | Medium   | Graceful fallback, clear setup docs        |
| MCP standard evolving                          | Low      | Stay close to spec, abstract our usage     |
| Cross-platform inconsistencies                 | Medium   | CI on all 3 OSes, platform-specific tests  |
| Memory engine plugin compatibility             | Low      | Strict interface contract, versioned API   |
| Token cost runaway                             | Medium   | Per-session budgets, hard limits, warnings |

---

# 🎬 Appendix D — Decisions Log

All design decisions captured from our brainstorming:

| #   | Decision                                         | Source         |
| --- | ------------------------------------------------ | -------------- |
| D1  | Electron-based desktop app                       | Initial spec   |
| D2  | Layout: VS Code-style                            | Q1=B           |
| D3  | Flow Diagram: Hybrid auto+manual                 | Q2=C           |
| D4  | Theme: Pure dark mode                            | Q3=A           |
| D5  | Chat: Document-style continuous                  | Q4=B           |
| D6  | Agents communicate via blackboard                | Q6=C           |
| D7  | Live streaming text from all agents              | Q8=A           |
| D8  | Code sandbox: Docker-based                       | Q10=B          |
| D9  | Tab system: Mixed content types                  | Q7=B           |
| D10 | Quick switcher (no full palette)                 | Q9=B           |
| D11 | Status bar: all items shown, dynamic             | Q10=all        |
| D12 | Approval UX: inline in chat                      | Q11=B          |
| D13 | Approval persistence: all options                | Q12=E          |
| D14 | SSH: OS keychain                                 | Q13=A          |
| D15 | Plugins: GitHub-based                            | Q14=B          |
| D16 | Plugins: Sandboxed + tiered                      | Q15=D          |
| D17 | Build to spec before shipping                    | Q17=A          |
| D18 | Tests as we go                                   | Q18=A          |
| D19 | SSH execution: local agents, remote ops          | Q1=A (round 2) |
| D20 | One project = one workspace                      | Q2=A           |
| D21 | Project = many sessions                          | Q3=A           |
| D22 | Model + Mode separate selectors, Advanced option | Q4 (round 2)   |
| D23 | Plan Mode outputs Plan.md, iterative             | Q5=A (round 2) |
| D24 | Deep Research = Perplexity-style                 | Q6=A (round 2) |
| D25 | Per-agent token + cost tracking                  | Q17=B          |
| D26 | Memory: plugin-based + global/local              | Q11 (round 1)  |
| D27 | Marketplace like VS Code/Antigravity             | Bonus          |
| D28 | Parallel/Serial dropdown                         | Bonus          |
| D29 | Diff view as first-class feature                 | Bonus          |

---

# ✅ Definition of "Project Done"

The project is considered v1.0 complete when:

1. ✅ All 42 chapters complete
2. ✅ All acceptance criteria across all chapters checked
3. ✅ Full E2E test suite passing
4. ✅ Builds for Windows/Mac/Linux verified
5. ✅ Documentation complete
6. ✅ Performance benchmarks met
7. ✅ Security review passed
8. ✅ At least 5 sample plugins published to marketplace
9. ✅ User has run a real workflow end-to-end successfully

---

**🚀 Ready to begin Chapter 1.**
