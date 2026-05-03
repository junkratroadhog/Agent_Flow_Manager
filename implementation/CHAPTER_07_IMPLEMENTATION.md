# 📘 Chapter 7 Implementation Plan: Layout System

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 7 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-6 must be complete.

---

## 🎯 Chapter 7 Goal

Build the VS Code-style application layout: activity bar (icon rail), collapsible left sidebar, main content area, optional right sidebar, bottom panel, and status bar. This becomes the permanent shell for all features.

## 📋 What Will Exist When This Chapter Is Done

- Activity bar (left edge, narrow icon rail) with view switcher
- Resizable left sidebar with header + content area
- Main content area (will host tabs in Chapter 8)
- Resizable right sidebar (Inspector / Flow / Plan)
- Toggleable bottom panel (Terminal / Logs)
- Status bar (bottom, single line)
- All sizes persisted via `useUIStore`
- Keyboard shortcuts: Ctrl+B (toggle left), Ctrl+J (toggle bottom)

---

# 📦 SECTION 1: Pre-flight

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

---

# 📦 SECTION 2: Layout Components Folder

## Task 2.1: Create Folder

```bash
mkdir -p src/renderer/src/components/Layout
```

---

# 📦 SECTION 3: Activity Bar

## Task 3.1: Create Activity Bar Component

**File path:** `src/renderer/src/components/Layout/ActivityBar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { MessageSquare, FolderOpen, Wrench, Store, Settings } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'
import { useUIStore, type SidebarView } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

interface ActivityItem {
  id: SidebarView
  icon: typeof MessageSquare
  label: string
  shortcut?: string
}

const TOP_ITEMS: ActivityItem[] = [
  { id: 'sessions', icon: MessageSquare, label: 'Sessions', shortcut: 'Ctrl+1' },
  { id: 'projects', icon: FolderOpen, label: 'Projects', shortcut: 'Ctrl+2' },
  { id: 'tools', icon: Wrench, label: 'Tools', shortcut: 'Ctrl+3' },
  { id: 'marketplace', icon: Store, label: 'Marketplace', shortcut: 'Ctrl+4' }
]

const BOTTOM_ITEMS: ActivityItem[] = [
  { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'Ctrl+,' }
]

export default function ActivityBar(): JSX.Element {
  const { leftSidebarVisible, leftSidebarView, setLeftSidebarView, toggleLeftSidebar } =
    useUIStore()

  const handleClick = (id: SidebarView): void => {
    if (leftSidebarView === id && leftSidebarVisible) {
      toggleLeftSidebar()
    } else {
      setLeftSidebarView(id)
      if (!leftSidebarVisible) toggleLeftSidebar()
    }
  }

  const renderItem = (item: ActivityItem): JSX.Element => {
    const Icon = item.icon
    const isActive = leftSidebarView === item.id && leftSidebarVisible
    return (
      <Tooltip key={item.id} delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleClick(item.id)}
            className={cn(
              'relative flex items-center justify-center w-12 h-12 transition-colors',
              'hover:text-text-primary',
              isActive ? 'text-text-primary' : 'text-text-tertiary'
            )}
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent rounded-r" />
            )}
            <Icon size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label} {item.shortcut && <span className="opacity-60 ml-2">{item.shortcut}</span>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col w-12 bg-bg-deepest border-r border-border-subtle flex-shrink-0">
      <div className="flex flex-col">{TOP_ITEMS.map(renderItem)}</div>
      <div className="flex-1" />
      <div className="flex flex-col">{BOTTOM_ITEMS.map(renderItem)}</div>
    </div>
  )
}
```

---

# 📦 SECTION 4: Left Sidebar Shell

## Task 4.1: Create Left Sidebar Container

**File path:** `src/renderer/src/components/Layout/LeftSidebar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useUIStore } from '../../stores/uiStore'

export default function LeftSidebar(): JSX.Element {
  const view = useUIStore((s) => s.leftSidebarView)

  const titles: Record<string, string> = {
    sessions: 'Sessions',
    projects: 'Projects',
    tools: 'Tools',
    marketplace: 'Marketplace',
    settings: 'Settings'
  }

  const title = view ? titles[view] ?? 'Sidebar' : 'Sidebar'

  return (
    <div className="flex flex-col h-full bg-bg-deep">
      <div className="h-9 flex items-center px-3 border-b border-border-subtle">
        <span className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 text-sm text-text-secondary">
          {view === 'sessions' && (
            <p className="text-text-tertiary text-xs">
              Session list will appear here in Chapter 9.
            </p>
          )}
          {view === 'projects' && (
            <p className="text-text-tertiary text-xs">
              Project list will appear here in Chapter 9.
            </p>
          )}
          {view === 'tools' && (
            <p className="text-text-tertiary text-xs">
              Installed tools list (Chapter 9).
            </p>
          )}
          {view === 'marketplace' && (
            <p className="text-text-tertiary text-xs">
              Marketplace browser (later chapter).
            </p>
          )}
          {view === 'settings' && (
            <p className="text-text-tertiary text-xs">Settings (later chapter).</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 5: Right Sidebar Shell

## Task 5.1: Create Right Sidebar

**File path:** `src/renderer/src/components/Layout/RightSidebar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'

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
            <p className="text-xs text-text-tertiary">
              Agent details, token usage, cost (filled in later chapters).
            </p>
          </TabsContent>
          <TabsContent value="flow" className="mt-0">
            <p className="text-xs text-text-tertiary">
              Mini-map of agent flow (Chapter 22-ish).
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

# 📦 SECTION 6: Bottom Panel Shell

## Task 6.1: Create Bottom Panel

**File path:** `src/renderer/src/components/Layout/BottomPanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'

export default function BottomPanel(): JSX.Element {
  const toggle = useUIStore((s) => s.toggleBottomPanel)
  const [tab, setTab] = useState('logs')

  return (
    <div className="flex flex-col h-full bg-bg-deep border-t border-border-subtle">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
        <div className="h-9 flex items-center justify-between px-2 border-b border-border-subtle">
          <TabsList className="h-7">
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
            <TabsTrigger value="terminal" className="text-xs">
              Terminal
            </TabsTrigger>
            <TabsTrigger value="problems" className="text-xs">
              Problems
            </TabsTrigger>
          </TabsList>
          <button
            onClick={toggle}
            className="p-1 text-text-tertiary hover:text-text-primary rounded"
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
          <TabsContent value="logs" className="mt-0">
            <p className="text-text-tertiary">Agent logs will stream here.</p>
          </TabsContent>
          <TabsContent value="terminal" className="mt-0">
            <p className="text-text-tertiary">Terminal output (later chapter).</p>
          </TabsContent>
          <TabsContent value="problems" className="mt-0">
            <p className="text-text-tertiary">No problems detected.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
```

---

# 📦 SECTION 7: Status Bar Shell

## Task 7.1: Create Status Bar

**File path:** `src/renderer/src/components/Layout/StatusBar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Circle, Cpu, Wifi } from 'lucide-react'

export default function StatusBar(): JSX.Element {
  return (
    <div className="h-6 flex items-center px-3 bg-bg-deepest border-t border-border-subtle text-xs text-text-tertiary gap-4 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <Circle size={8} className="fill-status-success text-status-success" />
        <span>Ready</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Cpu size={12} />
        <span>0 agents</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <Wifi size={12} />
        <span>Local</span>
      </div>
      <span>UTF-8</span>
      <span>v0.1.0</span>
    </div>
  )
}
```

---

# 📦 SECTION 8: Main Content Area

## Task 8.1: Create Main Content Placeholder

**File path:** `src/renderer/src/components/Layout/MainContent.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
export default function MainContent(): JSX.Element {
  return (
    <div className="flex-1 flex flex-col bg-bg-deepest min-w-0">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-semibold mb-2">Welcome to Agent Flow Manager</h2>
          <p className="text-sm text-text-secondary">
            Tabs and chat will be added in Chapter 8. For now, the layout shell is in place.
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 9: Layout Composition

## Task 9.1: Create AppShell Component

**File path:** `src/renderer/src/components/Layout/AppShell.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect } from 'react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '../ui/Resizable'
import { TooltipProvider } from '../ui/Tooltip'
import { useUIStore } from '../../stores/uiStore'
import ActivityBar from './ActivityBar'
import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'

export default function AppShell(): JSX.Element {
  const {
    leftSidebarVisible,
    leftSidebarWidth,
    setLeftSidebarWidth,
    rightSidebarVisible,
    rightSidebarWidth,
    setRightSidebarWidth,
    bottomPanelVisible,
    bottomPanelHeight,
    setBottomPanelHeight,
    toggleLeftSidebar,
    toggleBottomPanel
  } = useUIStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleLeftSidebar()
      } else if (ctrl && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        toggleBottomPanel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleLeftSidebar, toggleBottomPanel])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <ActivityBar />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {leftSidebarVisible && (
              <>
                <ResizablePanel
                  defaultSize={(leftSidebarWidth / window.innerWidth) * 100}
                  minSize={12}
                  maxSize={40}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    setLeftSidebarWidth(px)
                  }}
                >
                  <LeftSidebar />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            <ResizablePanel defaultSize={60} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={bottomPanelVisible ? 70 : 100} minSize={30}>
                  <MainContent />
                </ResizablePanel>
                {bottomPanelVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel
                      defaultSize={(bottomPanelHeight / window.innerHeight) * 100}
                      minSize={10}
                      maxSize={70}
                      onResize={(size) => {
                        const px = Math.round((size / 100) * window.innerHeight)
                        setBottomPanelHeight(px)
                      }}
                    >
                      <BottomPanel />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            {rightSidebarVisible && (
              <>
                <ResizableHandle />
                <ResizablePanel
                  defaultSize={(rightSidebarWidth / window.innerWidth) * 100}
                  minSize={15}
                  maxSize={40}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    setRightSidebarWidth(px)
                  }}
                >
                  <RightSidebar />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        <StatusBar />
      </div>
    </TooltipProvider>
  )
}
```

---

# 📦 SECTION 10: Update App.tsx

## Task 10.1: Replace App.tsx

**File path:** `src/renderer/src/App.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import AppShell from './components/Layout/AppShell'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')

  useEffect(() => {
    if (window.api) setAppName(window.api.appName)
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <div className="flex-1 overflow-hidden">
        <AppShell />
      </div>
    </div>
  )
}

export default App
```

---

# 📦 SECTION 11: Update Tests

## Task 11.1: Update App Test

**File path:** `tests/unit/App.test.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'api', {
      value: { appName: 'Agent Flow Manager', appVersion: '0.1.0' },
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
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn().mockResolvedValue(false),
        onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'bridge', {
      value: {
        invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
        on: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getAllByText(/Agent Flow Manager/i).length).toBeGreaterThan(0)
  })

  it('renders the layout shell', () => {
    render(<App />)
    // Welcome message in MainContent
    expect(screen.getByText(/Welcome to Agent Flow Manager/i)).toBeInTheDocument()
  })

  it('renders activity bar items', () => {
    render(<App />)
    // ActivityBar buttons have aria-labels
    expect(screen.getByLabelText(/Sessions/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Projects/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tools/i)).toBeInTheDocument()
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

## Task 12.3: Tests

```bash
npm run test:run
```

## Task 12.4: Build

```bash
npm run build
```

## Task 12.5: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Custom title bar at top
- [ ] Activity bar on left edge with 5 icons (sessions, projects, tools, marketplace, settings)
- [ ] Left sidebar visible by default with "SESSIONS" header
- [ ] Main content shows "Welcome to Agent Flow Manager"
- [ ] Right sidebar visible with Inspector/Flow/Plan tabs
- [ ] Status bar at bottom shows "Ready • 0 agents • Local • UTF-8 • v0.1.0"
- [ ] Hover activity bar icons → tooltips appear
- [ ] Click "Projects" icon → sidebar header changes to "PROJECTS"
- [ ] Click "Sessions" icon again → sidebar collapses
- [ ] Click "Sessions" icon again → sidebar reopens
- [ ] Drag the divider between left sidebar and main content → resizes
- [ ] Drag the divider between main content and right sidebar → resizes
- [ ] Press **Ctrl+B** → left sidebar toggles
- [ ] Press **Ctrl+J** → bottom panel appears
- [ ] Bottom panel shows Logs/Terminal/Problems tabs
- [ ] Click X on bottom panel → it disappears
- [ ] Close app and reopen → sidebar widths preserved

---

# 📦 SECTION 13: Git Commit

```bash
git add .
git commit -m "feat: VS Code-style layout system with sidebars and panels (Chapter 7)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Layout components exist

```bash
ls src/renderer/src/components/Layout/AppShell.tsx src/renderer/src/components/Layout/ActivityBar.tsx src/renderer/src/components/Layout/LeftSidebar.tsx src/renderer/src/components/Layout/RightSidebar.tsx src/renderer/src/components/Layout/BottomPanel.tsx src/renderer/src/components/Layout/StatusBar.tsx src/renderer/src/components/Layout/MainContent.tsx
```

## ✅ Check 2: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 3: Lint passes

```bash
npm run lint
```

## ✅ Check 4: Tests pass

```bash
npm run test:run
```

## ✅ Check 5: Build works

```bash
npm run build
```

## ✅ Check 6: Activity bar visible (user confirmed)

## ✅ Check 7: Sidebars resize (user confirmed)

## ✅ Check 8: Keyboard shortcuts work (user confirmed)

## ✅ Check 9: State persists across launches (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 7 Completion Report

```
✅ Chapter 7: Layout System - COMPLETE

Acceptance Criteria Met:
✅ Activity bar with 5 view switchers
✅ Resizable left sidebar
✅ Main content area
✅ Resizable right sidebar
✅ Toggleable bottom panel
✅ Status bar
✅ Keyboard shortcuts (Ctrl+B, Ctrl+J)
✅ State persistence (widths, visibility)
✅ Tooltips on activity bar
✅ All tests passing

Ready to proceed to Chapter 8: Tab System & Multi-View Support.
```

---

# 🚨 Troubleshooting

## Sidebars don't resize smoothly

The percentages are recalculated based on `window.innerWidth`. Resizing the window itself can cause minor jumps. This is acceptable.

## Activity bar buttons don't switch sidebar

- Check that `useUIStore.setLeftSidebarView` is being called (add console.log)
- Verify `LeftSidebar` reads `leftSidebarView` from store

## Ctrl+B doesn't work

- Open DevTools → Console → check for errors
- Some browsers/Electron may capture Ctrl+B; try clicking in the main area first

## Layout flickers on resize

This is mostly a function of `react-resizable-panels`. Acceptable for now.

---

**End of Chapter 7 Implementation Plan**
