# 📘 Chapter 10 Implementation Plan: Status Bar & Toolbar

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 10 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-9 must be complete with all verification checks passing.

---

## 🎯 Chapter 10 Goal

Build the **live status bar** at the bottom of the app and the **chat toolbar** at the top of chat tabs. The status bar shows real-time agent counts, token usage, and cost. The chat toolbar provides Model selector, Brain Mode selector, Execution Mode toggle.

## 📋 What Will Exist When This Chapter Is Done

- **Status bar (bottom):** Active session, model name, brain mode badge, agent count, total tokens, cost, network status, app version. All values are reactive to store changes.
- **Chat toolbar (top of chat tab):** Model selector, Brain Mode selector (Fast/Plan/Deep Think/Deep Research/Advanced), Execution Mode toggle (Parallel/Serial), and a "Stop" button.
- Tooltips on every status bar and toolbar item
- Click on status bar items navigates appropriately (e.g., click cost → opens settings tab)
- Brain Mode dropdown shows description for each mode
- Token/cost numbers formatted nicely (e.g., "1.2k", "$0.05")

---

# 📦 SECTION 1: Pre-flight

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

---

# 📦 SECTION 2: Number Formatters

## Task 2.1: Create Formatters

**File path:** `src/renderer/src/lib/formatters.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function formatCost(usd: number): string {
  if (usd === 0) return '$0.00'
  if (usd < 0.01) return '<$0.01'
  if (usd < 1) return `$${usd.toFixed(3)}`
  if (usd < 100) return `$${usd.toFixed(2)}`
  return `$${usd.toFixed(0)}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const sec = ms / 1000
  if (sec < 60) return `${sec.toFixed(1)}s`
  const min = Math.floor(sec / 60)
  const remainingSec = Math.floor(sec % 60)
  return `${min}m ${remainingSec}s`
}

export function pluralize(n: number, singular: string, plural?: string): string {
  if (n === 1) return `${n} ${singular}`
  return `${n} ${plural ?? singular + 's'}`
}
```

---

# 📦 SECTION 3: Brain Mode Metadata

## Task 3.1: Create Brain Mode Definitions

**File path:** `src/renderer/src/lib/brainModes.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import type { BrainMode } from '../stores/settingsStore'
import { Zap, Map, Brain, Telescope, Settings } from 'lucide-react'

export interface BrainModeInfo {
  id: BrainMode
  label: string
  description: string
  icon: typeof Zap
  defaultModel: string
}

export const BRAIN_MODES: BrainModeInfo[] = [
  {
    id: 'fast',
    label: 'Fast',
    description: 'Quick responses with a small model',
    icon: Zap,
    defaultModel: 'gemini-flash'
  },
  {
    id: 'plan',
    label: 'Plan',
    description: 'Outputs a step-by-step plan before acting',
    icon: Map,
    defaultModel: 'claude-sonnet'
  },
  {
    id: 'deepThink',
    label: 'Deep Think',
    description: 'Slower, more thorough reasoning',
    icon: Brain,
    defaultModel: 'claude-opus'
  },
  {
    id: 'deepResearch',
    label: 'Deep Research',
    description: 'Multi-source research with citations',
    icon: Telescope,
    defaultModel: 'gpt-4o'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Custom config for power users',
    icon: Settings,
    defaultModel: 'claude-opus'
  }
]

export function getBrainModeInfo(id: BrainMode): BrainModeInfo {
  return BRAIN_MODES.find((m) => m.id === id) ?? BRAIN_MODES[0]
}
```

---

# 📦 SECTION 4: Model List Constant

## Task 4.1: Create Models List

**File path:** `src/renderer/src/lib/models.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export interface ModelInfo {
  id: string
  label: string
  provider: 'anthropic' | 'openai' | 'google' | 'local' | 'other'
  contextWindow: number
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  { id: 'claude-opus', label: 'Claude Opus', provider: 'anthropic', contextWindow: 200000 },
  { id: 'claude-sonnet', label: 'Claude Sonnet', provider: 'anthropic', contextWindow: 200000 },
  { id: 'claude-haiku', label: 'Claude Haiku', provider: 'anthropic', contextWindow: 200000 },
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000 },
  { id: 'gemini-pro', label: 'Gemini Pro', provider: 'google', contextWindow: 1000000 },
  { id: 'gemini-flash', label: 'Gemini Flash', provider: 'google', contextWindow: 1000000 },
  { id: 'gemini-3-flash', label: 'Gemini 3 Flash', provider: 'google', contextWindow: 1000000 }
]

export function getModelInfo(id: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id)
}

export const PROVIDER_LABELS: Record<ModelInfo['provider'], string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  local: 'Local',
  other: 'Other'
}
```

---

# 📦 SECTION 5: Status Bar Item Component

## Task 5.1: Create Status Bar Item

**File path:** `src/renderer/src/components/Layout/StatusBarItem.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import type { ReactNode } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'
import { cn } from '../../lib/utils'

interface StatusBarItemProps {
  icon?: ReactNode
  children: ReactNode
  tooltip?: string
  onClick?: () => void
  highlight?: boolean
}

export default function StatusBarItem({
  icon,
  children,
  tooltip,
  onClick,
  highlight
}: StatusBarItemProps): JSX.Element {
  const content = (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 h-full transition-colors',
        onClick && 'hover:bg-bg-elevated cursor-pointer',
        !onClick && 'cursor-default',
        highlight && 'text-accent'
      )}
    >
      {icon}
      {children}
    </button>
  )

  if (!tooltip) return content

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
```

---

# 📦 SECTION 6: Live Stats Hook

## Task 6.1: Create Stats Hook

**File path:** `src/renderer/src/hooks/useSessionStats.ts`

**Command first:**

```bash
mkdir -p src/renderer/src/hooks
```

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useMemo } from 'react'
import { useAgentStore, useSessionStore } from '../stores'

export interface SessionStats {
  agentCount: number
  activeAgentCount: number
  totalTokens: number
  totalCost: number
  messageCount: number
}

export function useSessionStats(sessionId: string | null): SessionStats {
  const agents = useAgentStore((s) => (sessionId ? (s.agentsBySession[sessionId] ?? []) : []))
  const messages = useSessionStore((s) => (sessionId ? (s.messagesBySession[sessionId] ?? []) : []))

  return useMemo(() => {
    const agentCount = agents.length
    const activeAgentCount = agents.filter(
      (a) => a.status === 'thinking' || a.status === 'working'
    ).length
    const totalTokens = agents.reduce((sum, a) => sum + a.tokens_used, 0)
    const totalCost = agents.reduce((sum, a) => sum + a.cost, 0)
    const messageCount = messages.length

    return { agentCount, activeAgentCount, totalTokens, totalCost, messageCount }
  }, [agents, messages])
}
```

---

# 📦 SECTION 7: Updated Status Bar

## Task 7.1: Replace Status Bar

**File path:** `src/renderer/src/components/Layout/StatusBar.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { Circle, Cpu, Wifi, Coins, MessageSquare, Folder, Brain } from 'lucide-react'
import { useSessionStore, useProjectStore, useSettingsStore, useTabStore } from '../../stores'
import { useSessionStats } from '../../hooks/useSessionStats'
import { formatTokens, formatCost } from '../../lib/formatters'
import { getBrainModeInfo } from '../../lib/brainModes'
import { getModelInfo } from '../../lib/models'
import StatusBarItem from './StatusBarItem'

export default function StatusBar(): JSX.Element {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const sessions = useSessionStore((s) => s.sessions)
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const isStreaming = useSessionStore((s) => s.isStreaming)

  const primaryModel = useSettingsStore((s) => s.primaryModel)
  const currentBrainMode = useSettingsStore((s) => s.currentBrainMode)
  const openTab = useTabStore((s) => s.openTab)

  const session = sessions.find((s) => s.id === activeSessionId) ?? null
  const project = projects.find((p) => p.id === activeProjectId) ?? null
  const stats = useSessionStats(activeSessionId)

  const modelInfo = getModelInfo(primaryModel)
  const brainModeInfo = getBrainModeInfo(currentBrainMode)

  const openSettings = (): void => {
    openTab({
      id: undefined as unknown as string,
      type: 'settings',
      title: 'Settings'
    })
  }

  const isActive = stats.activeAgentCount > 0

  return (
    <div className="h-6 flex items-center bg-bg-deepest border-t border-border-subtle text-xs text-text-tertiary flex-shrink-0">
      <StatusBarItem
        icon={
          <Circle
            size={8}
            className={
              isActive
                ? 'fill-status-warning text-status-warning animate-pulse'
                : isStreaming
                  ? 'fill-accent text-accent'
                  : 'fill-status-success text-status-success'
            }
          />
        }
        tooltip={isActive ? 'Agents are working' : isStreaming ? 'Streaming response' : 'Ready'}
      >
        {isActive ? 'Working' : isStreaming ? 'Streaming' : 'Ready'}
      </StatusBarItem>

      {project && (
        <StatusBarItem icon={<Folder size={11} />} tooltip={`Project: ${project.name}`}>
          <span className="max-w-[140px] truncate">{project.name}</span>
        </StatusBarItem>
      )}

      {session && (
        <StatusBarItem
          icon={<MessageSquare size={11} />}
          tooltip={`Session: ${session.title}`}
        >
          <span className="max-w-[160px] truncate">{session.title}</span>
        </StatusBarItem>
      )}

      <div className="flex-1" />

      <StatusBarItem
        icon={<Brain size={11} />}
        tooltip={`Brain mode: ${brainModeInfo.description}`}
        onClick={openSettings}
      >
        {brainModeInfo.label}
      </StatusBarItem>

      <StatusBarItem
        tooltip={modelInfo ? `Model: ${modelInfo.label}` : 'No model selected'}
        onClick={openSettings}
      >
        {modelInfo?.label ?? primaryModel}
      </StatusBarItem>

      <StatusBarItem
        icon={<Cpu size={11} />}
        tooltip={`${stats.activeAgentCount} active / ${stats.agentCount} total agents`}
        highlight={isActive}
      >
        {stats.agentCount} {stats.agentCount === 1 ? 'agent' : 'agents'}
      </StatusBarItem>

      <StatusBarItem
        tooltip={`${stats.totalTokens.toLocaleString()} tokens used`}
      >
        {formatTokens(stats.totalTokens)} tok
      </StatusBarItem>

      <StatusBarItem
        icon={<Coins size={11} />}
        tooltip="Total cost (estimated)"
        onClick={openSettings}
      >
        {formatCost(stats.totalCost)}
      </StatusBarItem>

      <StatusBarItem icon={<Wifi size={11} />} tooltip="Network status">
        Local
      </StatusBarItem>

      <StatusBarItem tooltip="App version">v0.1.0</StatusBarItem>
    </div>
  )
}
```

---

# 📦 SECTION 8: Brain Mode Selector

## Task 8.1: Create Brain Mode Dropdown

**File path:** `src/renderer/src/components/Toolbar/BrainModeSelector.tsx`

**Command first:**

```bash
mkdir -p src/renderer/src/components/Toolbar
```

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/Select'
import { useSettingsStore } from '../../stores'
import { BRAIN_MODES, getBrainModeInfo } from '../../lib/brainModes'

export default function BrainModeSelector(): JSX.Element {
  const currentBrainMode = useSettingsStore((s) => s.currentBrainMode)
  const setCurrentBrainMode = useSettingsStore((s) => s.setCurrentBrainMode)
  const info = getBrainModeInfo(currentBrainMode)
  const Icon = info.icon

  return (
    <Select value={currentBrainMode} onValueChange={(v) => setCurrentBrainMode(v as typeof currentBrainMode)}>
      <SelectTrigger className="h-7 w-auto min-w-[130px] gap-1.5 px-2 text-xs">
        <Icon size={12} className="text-accent" />
        <SelectValue />
        <ChevronDown size={12} className="opacity-50 ml-auto" />
      </SelectTrigger>
      <SelectContent>
        {BRAIN_MODES.map((mode) => {
          const ModeIcon = mode.icon
          return (
            <SelectItem key={mode.id} value={mode.id}>
              <div className="flex items-start gap-2 py-0.5">
                <ModeIcon size={14} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{mode.label}</div>
                  <div className="text-[10px] text-text-tertiary leading-snug">
                    {mode.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
```

---

# 📦 SECTION 9: Model Selector

## Task 9.1: Create Model Dropdown

**File path:** `src/renderer/src/components/Toolbar/ModelSelector.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/Select'
import { useSettingsStore } from '../../stores'
import { AVAILABLE_MODELS, PROVIDER_LABELS } from '../../lib/models'

export default function ModelSelector(): JSX.Element {
  const primaryModel = useSettingsStore((s) => s.primaryModel)
  const setPrimaryModel = useSettingsStore((s) => s.setPrimaryModel)

  // Group models by provider
  const grouped: Record<string, typeof AVAILABLE_MODELS> = {}
  for (const m of AVAILABLE_MODELS) {
    if (!grouped[m.provider]) grouped[m.provider] = []
    grouped[m.provider].push(m)
  }

  return (
    <Select value={primaryModel} onValueChange={setPrimaryModel}>
      <SelectTrigger className="h-7 w-auto min-w-[150px] px-2 text-xs gap-1">
        <SelectValue />
        <ChevronDown size={12} className="opacity-50 ml-auto" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(grouped).map(([provider, models]) => (
          <div key={provider}>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">
              {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}
            </div>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex items-center justify-between gap-3">
                  <span>{m.label}</span>
                  <span className="text-[10px] text-text-tertiary">
                    {(m.contextWindow / 1000).toFixed(0)}k
                  </span>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}
```

---

# 📦 SECTION 10: Execution Mode Toggle

## Task 10.1: Create Execution Mode Toggle

**File path:** `src/renderer/src/components/Toolbar/ExecutionModeToggle.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ListOrdered, Layers } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'
import { useSettingsStore } from '../../stores'
import { cn } from '../../lib/utils'

export default function ExecutionModeToggle(): JSX.Element {
  const executionMode = useSettingsStore((s) => s.executionMode)
  const setExecutionMode = useSettingsStore((s) => s.setExecutionMode)

  return (
    <div className="flex items-center bg-bg-deep border border-border rounded-md h-7 overflow-hidden">
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setExecutionMode('serial')}
            className={cn(
              'flex items-center gap-1 px-2 h-full text-xs transition-colors',
              executionMode === 'serial'
                ? 'bg-bg-elevated text-text-primary'
                : 'text-text-tertiary hover:text-text-primary'
            )}
            aria-label="Serial execution"
          >
            <ListOrdered size={12} />
            Serial
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Sub-agents run one after another</TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setExecutionMode('parallel')}
            className={cn(
              'flex items-center gap-1 px-2 h-full text-xs transition-colors',
              executionMode === 'parallel'
                ? 'bg-bg-elevated text-text-primary'
                : 'text-text-tertiary hover:text-text-primary'
            )}
            aria-label="Parallel execution"
          >
            <Layers size={12} />
            Parallel
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Sub-agents run simultaneously</TooltipContent>
      </Tooltip>
    </div>
  )
}
```

---

# 📦 SECTION 11: Stop Button

## Task 11.1: Create Stop Button

**File path:** `src/renderer/src/components/Toolbar/StopButton.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Square } from 'lucide-react'
import { Button } from '../ui/Button'
import { useSessionStore, useAgentStore } from '../../stores'

export default function StopButton(): JSX.Element | null {
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const setStreaming = useSessionStore((s) => s.setStreaming)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const agents = useAgentStore((s) =>
    activeSessionId ? s.agentsBySession[activeSessionId] ?? [] : []
  )

  const isWorking =
    isStreaming || agents.some((a) => a.status === 'thinking' || a.status === 'working')

  if (!isWorking) return null

  const handleStop = (): void => {
    // For now, just clear streaming flag.
    // Real cancellation will be added in the LLM Streaming chapter.
    setStreaming(false)
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleStop}
      className="h-7 gap-1.5 text-xs"
    >
      <Square size={10} className="fill-current" />
      Stop
    </Button>
  )
}
```

---

# 📦 SECTION 12: Chat Toolbar

## Task 12.1: Create Chat Toolbar

**File path:** `src/renderer/src/components/Toolbar/ChatToolbar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import ModelSelector from './ModelSelector'
import BrainModeSelector from './BrainModeSelector'
import ExecutionModeToggle from './ExecutionModeToggle'
import StopButton from './StopButton'

export default function ChatToolbar(): JSX.Element {
  return (
    <div className="flex items-center gap-2 h-10 px-3 bg-bg-deep border-b border-border-subtle flex-shrink-0">
      <ModelSelector />
      <BrainModeSelector />
      <ExecutionModeToggle />
      <div className="flex-1" />
      <StopButton />
    </div>
  )
}
```

---

# 📦 SECTION 13: Update Chat Tab Content

## Task 13.1: Add Toolbar to Chat Content

**File path:** `src/renderer/src/components/Tabs/contents/ChatTabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import ChatToolbar from '../../Toolbar/ChatToolbar'

interface ChatTabContentProps {
  sessionId?: string
}

export default function ChatTabContent({ sessionId }: ChatTabContentProps): JSX.Element {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatToolbar />
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">Chat View</h3>
          <p className="text-sm text-text-secondary mb-4">
            Chat conversation will render here. Real chat is built in later chapters.
          </p>
          {sessionId && (
            <p className="text-xs font-mono text-text-tertiary">Session: {sessionId}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 14: Demo: Inject Fake Stats

To make the status bar visibly reactive without real agents, add a small dev-only demo button.

## Task 14.1: Update Sessions Panel With Demo Stats

**File path:** `src/renderer/src/components/Sidebar/SessionsPanel.tsx`

**Action:** Find the `SessionsPanel` function. Locate the JSX `<div className="flex-1 overflow-y-auto">`. Just BEFORE the conditional rendering blocks (the `!activeProjectId ?` ternary), insert a demo button block.

**Use str_replace pattern.** Find this exact line:

```typescript
      <div className="flex-1 overflow-y-auto">
        {!activeProjectId ? (
```

Replace with:

```typescript
      <div className="flex-1 overflow-y-auto">
        <DemoStatsButton />
        {!activeProjectId ? (
```

Then ADD this import at the top of the file (after the other imports):

```typescript
import DemoStatsButton from './DemoStatsButton'
```

## Task 14.2: Create Demo Stats Button

**File path:** `src/renderer/src/components/Sidebar/DemoStatsButton.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Sparkles } from 'lucide-react'
import { useAgentStore, useSessionStore } from '../../stores'
import { Button } from '../ui/Button'

export default function DemoStatsButton(): JSX.Element | null {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const addAgent = useAgentStore((s) => s.addAgent)
  const setStreaming = useSessionStore((s) => s.setStreaming)

  if (!activeSessionId) return null

  const handleDemo = (): void => {
    const id = `agt_demo_${Date.now()}`
    addAgent({
      id,
      session_id: activeSessionId,
      name: 'Demo Agent',
      role: 'researcher',
      model: 'claude-opus',
      status: 'working',
      current_action: 'Demo task',
      tokens_used: Math.floor(1000 + Math.random() * 5000),
      cost: 0.05 + Math.random() * 0.5,
      metadata_json: '{}',
      created_at: new Date().toISOString()
    })
    setStreaming(true)
    setTimeout(() => setStreaming(false), 2500)
  }

  return (
    <div className="px-3 pt-2 pb-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDemo}
        className="w-full justify-start text-text-tertiary"
      >
        <Sparkles size={12} />
        Demo: Add fake agent
      </Button>
    </div>
  )
}
```

---

# 📦 SECTION 15: Tests

## Task 15.1: Create Formatter Tests

**File path:** `tests/unit/formatters.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import {
  formatTokens,
  formatCost,
  formatDuration,
  pluralize
} from '../../src/renderer/src/lib/formatters'

describe('formatTokens', () => {
  it('formats small numbers as-is', () => {
    expect(formatTokens(0)).toBe('0')
    expect(formatTokens(999)).toBe('999')
  })

  it('formats thousands with k suffix', () => {
    expect(formatTokens(1000)).toBe('1.0k')
    expect(formatTokens(1234)).toBe('1.2k')
    expect(formatTokens(999_999)).toBe('1000.0k')
  })

  it('formats millions with M suffix', () => {
    expect(formatTokens(1_000_000)).toBe('1.0M')
    expect(formatTokens(2_500_000)).toBe('2.5M')
  })
})

describe('formatCost', () => {
  it('formats zero', () => {
    expect(formatCost(0)).toBe('$0.00')
  })

  it('formats tiny amounts', () => {
    expect(formatCost(0.005)).toBe('<$0.01')
  })

  it('formats small amounts with 3 decimals', () => {
    expect(formatCost(0.123)).toBe('$0.123')
  })

  it('formats normal amounts with 2 decimals', () => {
    expect(formatCost(5.49)).toBe('$5.49')
  })

  it('formats large amounts as integer', () => {
    expect(formatCost(123)).toBe('$123')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(2500)).toBe('2.5s')
  })

  it('formats minutes', () => {
    expect(formatDuration(125_000)).toBe('2m 5s')
  })
})

describe('pluralize', () => {
  it('uses singular for 1', () => {
    expect(pluralize(1, 'agent')).toBe('1 agent')
  })

  it('uses plural for 0 and many', () => {
    expect(pluralize(0, 'agent')).toBe('0 agents')
    expect(pluralize(5, 'agent')).toBe('5 agents')
  })

  it('uses custom plural when given', () => {
    expect(pluralize(2, 'child', 'children')).toBe('2 children')
  })
})
```

---

# 📦 SECTION 16: Verification

## Task 16.1: Type Check

```bash
npm run typecheck
```

## Task 16.2: Lint

```bash
npm run lint
```

## Task 16.3: Format

```bash
npm run format
```

## Task 16.4: Tests

```bash
npm run test:run
```

## Task 16.5: Build

```bash
npm run build
```

## Task 16.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Status bar at bottom shows: status circle, brain mode, model name, "0 agents", "0 tok", "$0.00", "Local", "v0.1.0"
- [ ] Hover each status bar item → tooltip appears
- [ ] Click status bar "Brain mode" or "Model" → opens settings tab
- [ ] Click cost item → opens settings tab
- [ ] Open a chat tab → toolbar appears at top with Model selector, Brain Mode selector, Execution toggle
- [ ] Click Model selector → dropdown shows models grouped by provider with context window labels
- [ ] Pick a different model → status bar model name updates
- [ ] Click Brain Mode selector → dropdown shows 5 modes with descriptions
- [ ] Pick "Plan" → status bar shows "Plan"
- [ ] Click Execution mode "Parallel" → highlights, "Serial" un-highlights
- [ ] Open Sessions panel → "Demo: Add fake agent" button visible (only when active session)
- [ ] Click Demo button → status bar shows "1 agent", token count, cost
- [ ] Click Demo button several times → counts increase
- [ ] During the 2.5s after demo click, "Stop" button appears in toolbar
- [ ] After 2.5s "Stop" button disappears
- [ ] Status bar circle pulses yellow when working
- [ ] Selected brain mode/model persists after closing app and reopening

---

# 📦 SECTION 17: Git Commit

```bash
git add .
git commit -m "feat: live status bar and chat toolbar with selectors (Chapter 10)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Helper files exist

```bash
ls src/renderer/src/lib/formatters.ts src/renderer/src/lib/brainModes.ts src/renderer/src/lib/models.ts src/renderer/src/hooks/useSessionStats.ts
```

## ✅ Check 2: Status bar files exist

```bash
ls src/renderer/src/components/Layout/StatusBar.tsx src/renderer/src/components/Layout/StatusBarItem.tsx
```

## ✅ Check 3: Toolbar files exist

```bash
ls src/renderer/src/components/Toolbar/ChatToolbar.tsx src/renderer/src/components/Toolbar/ModelSelector.tsx src/renderer/src/components/Toolbar/BrainModeSelector.tsx src/renderer/src/components/Toolbar/ExecutionModeToggle.tsx src/renderer/src/components/Toolbar/StopButton.tsx
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

## ✅ Check 8: Status bar reactive (user confirmed)

## ✅ Check 9: Toolbar selectors work (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 10 Completion Report

```
✅ Chapter 10: Status Bar & Toolbar - COMPLETE

Acceptance Criteria Met:
✅ Live status bar with 9 items
✅ All status items reactive to store changes
✅ Tooltips on every item
✅ Click-through to settings on relevant items
✅ Chat toolbar with Model + BrainMode + Execution selectors
✅ Stop button (visible only when working)
✅ 5 brain modes with icons + descriptions
✅ 8 models grouped by provider
✅ Demo button to inject fake agent stats
✅ Status persists across launches
✅ All tests passing

Ready to proceed to Chapter 11.
```

---

# 🚨 Troubleshooting

## Status bar shows wrong stats

- The `useSessionStats` hook reads from agent store + message store. Verify Chapter 5 stores are working.
- Check that `activeSessionId` in `useSessionStore` is set when a chat tab is open.

## Selector dropdowns appear behind other content

- The Radix Select uses portals; make sure no parent has `overflow: hidden` on the body.

## Demo button doesn't appear

- It only shows when there's an active session. Click a session in the sidebar first.

## Stop button never appears

- Click the demo button - it sets `isStreaming` for 2.5s.
- Or, agents must have status `working` or `thinking`.

## "Cannot find module '../../hooks/useSessionStats'"

Verify the `hooks` folder was created (Section 6, Task 6.1).

---

**End of Chapter 10 Implementation Plan**
