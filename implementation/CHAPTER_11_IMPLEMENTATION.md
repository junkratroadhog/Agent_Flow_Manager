# 📘 Chapter 11 Implementation Plan: Settings Window & API Key Management

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 11 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-10 must be complete with all verification checks passing.

---

## 🎯 Chapter 11 Goal

Build a real Settings UI inside the Settings tab. Users can configure API keys (encrypted), select models, customize brain modes, manage general preferences, and view app info. API keys flow through the encrypted SecretStorage from Chapter 4.

## 📋 What Will Exist When This Chapter Is Done

- Settings tab with sub-navigation: General, API Keys, Models, Brain Modes, About
- **API Keys section:** Add/update/delete keys for Anthropic, OpenAI, Google, etc. Keys are masked when shown. Status badge shows if key is set.
- **Models section:** Choose primary model from list, see provider availability based on API keys
- **Brain Modes section:** For each mode, configure model, temperature, system prompt
- **General section:** Font size slider, theme switcher (dark only for now), auto-update toggle, telemetry toggle
- **About section:** App version, license, links
- All settings persist to DB via IPC
- "Test connection" button verifies API keys work (placeholder for now)

---

# 📦 SECTION 1: Pre-flight

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

---

# 📦 SECTION 2: Settings Page Structure

## Task 2.1: Create Settings Routes Folder

```bash
mkdir -p src/renderer/src/components/Settings
mkdir -p src/renderer/src/components/Settings/sections
```

---

# 📦 SECTION 3: Settings Sidebar

## Task 3.1: Create Settings Sub-Sidebar

**File path:** `src/renderer/src/components/Settings/SettingsSidebar.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Sliders, KeyRound, Zap, Brain, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

export type SettingsSection = 'general' | 'api-keys' | 'models' | 'brain-modes' | 'about'

interface NavItem {
  id: SettingsSection
  label: string
  icon: typeof Sliders
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  { id: 'models', label: 'Models', icon: Zap },
  { id: 'brain-modes', label: 'Brain Modes', icon: Brain },
  { id: 'about', label: 'About', icon: Info }
]

interface SettingsSidebarProps {
  activeSection: SettingsSection
  onChange: (section: SettingsSection) => void
}

export default function SettingsSidebar({
  activeSection,
  onChange
}: SettingsSidebarProps): JSX.Element {
  return (
    <nav className="w-56 shrink-0 border-r border-border-subtle bg-bg-deep py-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors',
              isActive
                ? 'bg-bg-elevated text-text-primary border-l-2 border-accent'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-2 border-transparent'
            )}
          >
            <Icon size={14} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
```

---

# 📦 SECTION 4: Settings Section Header

## Task 4.1: Create Section Header Component

**File path:** `src/renderer/src/components/Settings/SectionHeader.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
interface SectionHeaderProps {
  title: string
  description?: string
}

export default function SectionHeader({ title, description }: SectionHeaderProps): JSX.Element {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  )
}
```

---

# 📦 SECTION 5: Settings Row Component

## Task 5.1: Create Reusable Setting Row

**File path:** `src/renderer/src/components/Settings/SettingRow.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
}

export default function SettingRow({
  label,
  description,
  children
}: SettingRowProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border-subtle last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        {description && (
          <div className="text-xs text-text-tertiary mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
```

---

# 📦 SECTION 6: General Section

## Task 6.1: Create General Settings

**File path:** `src/renderer/src/components/Settings/sections/GeneralSection.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useSettingsStore } from '../../../stores'
import SectionHeader from '../SectionHeader'
import SettingRow from '../SettingRow'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../ui/Select'

export default function GeneralSection(): JSX.Element {
  const {
    fontSize,
    setFontSize,
    language,
    setLanguage,
    telemetryEnabled,
    setTelemetryEnabled,
    autoUpdate,
    setAutoUpdate
  } = useSettingsStore()

  return (
    <div>
      <SectionHeader title="General" description="App-wide preferences." />

      <SettingRow label="Theme" description="Light theme is coming in a future release.">
        <span className="text-sm text-text-tertiary">Dark (locked)</span>
      </SettingRow>

      <SettingRow label="Font size" description="Base font size for the UI.">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="11"
            max="16"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-mono w-10 text-right">{fontSize}px</span>
        </div>
      </SettingRow>

      <SettingRow label="Language" description="Interface language.">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        label="Auto-update"
        description="Automatically download and install updates."
      >
        <input
          type="checkbox"
          checked={autoUpdate}
          onChange={(e) => setAutoUpdate(e.target.checked)}
          className="cursor-pointer"
        />
      </SettingRow>

      <SettingRow
        label="Anonymous telemetry"
        description="Help improve the app by sharing usage statistics. No content or personal data is collected."
      >
        <input
          type="checkbox"
          checked={telemetryEnabled}
          onChange={(e) => setTelemetryEnabled(e.target.checked)}
          className="cursor-pointer"
        />
      </SettingRow>
    </div>
  )
}
```

---

# 📦 SECTION 7: API Keys Section

## Task 7.1: Create API Key Row Component

**File path:** `src/renderer/src/components/Settings/ApiKeyRow.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Eye, EyeOff, Trash2, Check, AlertCircle } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { apiKeyService } from '../../services'
import { cn } from '../../lib/utils'

interface ApiKeyRowProps {
  provider: string
  label: string
  description: string
  hasKey: boolean
  onChange: () => void
}

export default function ApiKeyRow({
  provider,
  label,
  description,
  hasKey,
  onChange
}: ApiKeyRowProps): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [showValue, setShowValue] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (): Promise<void> => {
    if (!value.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await apiKeyService.set(provider, value.trim())
      setValue('')
      setEditing(false)
      onChange()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!confirm(`Remove ${label} API key?`)) return
    try {
      await apiKeyService.delete(provider)
      onChange()
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleCancel = (): void => {
    setValue('')
    setEditing(false)
    setError(null)
  }

  return (
    <div className="py-4 border-b border-border-subtle last:border-b-0">
      <div className="flex items-start justify-between gap-6 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {hasKey ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-status-success/15 text-status-success">
                <Check size={10} /> Set
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-bg-elevated text-text-tertiary">
                <AlertCircle size={10} /> Not set
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        </div>
        {!editing && (
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              {hasKey ? 'Update' : 'Add'}
            </Button>
            {hasKey && (
              <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
      {editing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type={showValue ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste your API key here..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowValue(!showValue)}
              aria-label={showValue ? 'Hide' : 'Show'}
            >
              {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
          </div>
          {error && (
            <p className={cn('text-xs text-status-error')}>
              <AlertCircle size={12} className="inline mr-1" />
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!value.trim() || submitting} size="sm">
              {submitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Task 7.2: Create API Keys Section

**File path:** `src/renderer/src/components/Settings/sections/ApiKeysSection.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState, useCallback } from 'react'
import SectionHeader from '../SectionHeader'
import ApiKeyRow from '../ApiKeyRow'
import { apiKeyService } from '../../../services'

interface ProviderDef {
  id: string
  label: string
  description: string
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Claude Opus, Sonnet, Haiku models'
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o, GPT-4o Mini, and other OpenAI models'
  },
  {
    id: 'google',
    label: 'Google AI',
    description: 'Gemini Pro and Flash models'
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: 'Access to many models through one API'
  },
  {
    id: 'groq',
    label: 'Groq',
    description: 'Ultra-fast inference for open models'
  }
]

export default function ApiKeysSection(): JSX.Element {
  const [providersWithKeys, setProvidersWithKeys] = useState<Set<string>>(new Set())

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const list = await apiKeyService.listProviders()
      setProvidersWithKeys(new Set(list))
    } catch (e) {
      console.error('Failed to load API keys:', e)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div>
      <SectionHeader
        title="API Keys"
        description="Encrypted with OS-level keychain. Keys are never logged or transmitted to anyone except the listed provider."
      />
      <div className="rounded-lg border border-border bg-bg-deep px-4">
        {PROVIDERS.map((p) => (
          <ApiKeyRow
            key={p.id}
            provider={p.id}
            label={p.label}
            description={p.description}
            hasKey={providersWithKeys.has(p.id)}
            onChange={refresh}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary mt-3">
        💡 Tip: You can also use environment variables (e.g. <code>ANTHROPIC_API_KEY</code>) which take precedence over keys saved here.
      </p>
    </div>
  )
}
```

---

# 📦 SECTION 8: Models Section

## Task 8.1: Create Models Section

**File path:** `src/renderer/src/components/Settings/sections/ModelsSection.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '../../../stores'
import { AVAILABLE_MODELS, PROVIDER_LABELS } from '../../../lib/models'
import { apiKeyService } from '../../../services'
import SectionHeader from '../SectionHeader'
import { cn } from '../../../lib/utils'

export default function ModelsSection(): JSX.Element {
  const primaryModel = useSettingsStore((s) => s.primaryModel)
  const setPrimaryModel = useSettingsStore((s) => s.setPrimaryModel)
  const [providersWithKeys, setProvidersWithKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    apiKeyService
      .listProviders()
      .then((list) => setProvidersWithKeys(new Set(list)))
      .catch(() => undefined)
  }, [])

  // Group models by provider
  const grouped: Record<string, typeof AVAILABLE_MODELS> = {}
  for (const m of AVAILABLE_MODELS) {
    if (!grouped[m.provider]) grouped[m.provider] = []
    grouped[m.provider].push(m)
  }

  return (
    <div>
      <SectionHeader
        title="Models"
        description="Choose your default model. Brain Modes can override this per task."
      />
      <div className="space-y-6">
        {Object.entries(grouped).map(([provider, models]) => {
          const hasKey = providersWithKeys.has(provider)
          return (
            <section key={provider}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold">
                  {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}
                </h3>
                {hasKey ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-status-success/15 text-status-success">
                    <Check size={10} /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-status-warning/15 text-status-warning">
                    <AlertCircle size={10} /> Needs API key
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPrimaryModel(m.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md border text-left transition-colors',
                      primaryModel === m.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:bg-bg-hover'
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-[10px] text-text-tertiary font-mono">{m.id}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary">
                      <span>{(m.contextWindow / 1000).toFixed(0)}k context</span>
                      {primaryModel === m.id && <Check size={14} className="text-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 9: Brain Modes Section

## Task 9.1: Create Brain Modes Section

**File path:** `src/renderer/src/components/Settings/sections/BrainModesSection.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useSettingsStore } from '../../../stores'
import { BRAIN_MODES } from '../../../lib/brainModes'
import { AVAILABLE_MODELS } from '../../../lib/models'
import SectionHeader from '../SectionHeader'
import { Textarea } from '../../ui/Textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../ui/Select'

export default function BrainModesSection(): JSX.Element {
  const brainModes = useSettingsStore((s) => s.brainModes)
  const setBrainModeConfig = useSettingsStore((s) => s.setBrainModeConfig)

  return (
    <div>
      <SectionHeader
        title="Brain Modes"
        description="Configure each thinking mode independently. Each mode can use a different model and parameters."
      />
      <div className="space-y-6">
        {BRAIN_MODES.map((info) => {
          const Icon = info.icon
          const config = brainModes[info.id]
          return (
            <section
              key={info.id}
              className="rounded-lg border border-border bg-bg-deep p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-accent" />
                <h3 className="text-sm font-semibold">{info.label}</h3>
              </div>
              <p className="text-xs text-text-tertiary mb-4">{info.description}</p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Model</label>
                  <Select
                    value={config.model}
                    onValueChange={(v) => setBrainModeConfig(info.id, { ...config, model: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-medium text-text-secondary">Temperature</label>
                    <span className="text-text-tertiary font-mono">
                      {config.temperature ?? 0.7}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature ?? 0.7}
                    onChange={(e) =>
                      setBrainModeConfig(info.id, {
                        ...config,
                        temperature: Number(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    System Prompt (optional)
                  </label>
                  <Textarea
                    value={config.systemPrompt ?? ''}
                    onChange={(e) =>
                      setBrainModeConfig(info.id, {
                        ...config,
                        systemPrompt: e.target.value
                      })
                    }
                    placeholder={`Custom instructions for ${info.label} mode...`}
                    rows={3}
                  />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 10: About Section

## Task 10.1: Create About Section

**File path:** `src/renderer/src/components/Settings/sections/AboutSection.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import SectionHeader from '../SectionHeader'

export default function AboutSection(): JSX.Element {
  const [version, setVersion] = useState('0.1.0')
  const [platformName, setPlatformName] = useState('')

  useEffect(() => {
    if (window.platform) {
      window.platform.getVersion().then(setVersion)
      window.platform.get().then(setPlatformName)
    }
  }, [])

  const links = [
    { label: 'Documentation', url: 'https://github.com/agentflow/docs' },
    { label: 'Report an Issue', url: 'https://github.com/agentflow/issues' },
    { label: 'Changelog', url: 'https://github.com/agentflow/changelog' },
    { label: 'License (MIT)', url: 'https://github.com/agentflow/license' }
  ]

  return (
    <div>
      <SectionHeader title="About" description="Application info and resources." />
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-bg-deep p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/15 mb-3">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="text-xl font-semibold">Agent Flow Manager</h2>
          <p className="text-sm text-text-secondary mt-1">Version {version}</p>
          <p className="text-xs text-text-tertiary mt-2 font-mono">Platform: {platformName}</p>
        </div>

        <div className="rounded-lg border border-border bg-bg-deep p-4">
          <h3 className="text-sm font-semibold mb-3">Resources</h3>
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => (
              <button
                key={link.url}
                onClick={() => {
                  if (window.electron?.ipcRenderer) {
                    // Open in default browser via shell.openExternal in main
                    // For now, fallback to window.open
                    window.open(link.url, '_blank')
                  }
                }}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-bg-hover transition-colors"
              >
                <span>{link.label}</span>
                <ExternalLink size={12} className="text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-tertiary text-center">
          Made with ❤️ • MIT License • © 2026
        </p>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 11: Settings Page Container

## Task 11.1: Create Settings Page

**File path:** `src/renderer/src/components/Settings/SettingsPage.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import SettingsSidebar, { type SettingsSection } from './SettingsSidebar'
import GeneralSection from './sections/GeneralSection'
import ApiKeysSection from './sections/ApiKeysSection'
import ModelsSection from './sections/ModelsSection'
import BrainModesSection from './sections/BrainModesSection'
import AboutSection from './sections/AboutSection'

interface SettingsPageProps {
  initialSection?: SettingsSection
}

export default function SettingsPage({
  initialSection = 'general'
}: SettingsPageProps): JSX.Element {
  const [section, setSection] = useState<SettingsSection>(initialSection)

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <SettingsSidebar activeSection={section} onChange={setSection} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {section === 'general' && <GeneralSection />}
          {section === 'api-keys' && <ApiKeysSection />}
          {section === 'models' && <ModelsSection />}
          {section === 'brain-modes' && <BrainModesSection />}
          {section === 'about' && <AboutSection />}
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 12: Update Settings Tab Content

## Task 12.1: Replace Settings Tab Content

**File path:** `src/renderer/src/components/Tabs/contents/SettingsTabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import SettingsPage from '../../Settings/SettingsPage'
import type { SettingsSection } from '../../Settings/SettingsSidebar'

interface SettingsTabContentProps {
  contextId?: string
}

const VALID_SECTIONS: SettingsSection[] = [
  'general',
  'api-keys',
  'models',
  'brain-modes',
  'about'
]

export default function SettingsTabContent({
  contextId
}: SettingsTabContentProps): JSX.Element {
  const initialSection = (
    contextId && VALID_SECTIONS.includes(contextId as SettingsSection)
      ? (contextId as SettingsSection)
      : 'general'
  ) as SettingsSection

  return <SettingsPage initialSection={initialSection} />
}
```

## Task 12.2: Update Tab Content Router to Pass Context

**File path:** `src/renderer/src/components/Tabs/TabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import type { Tab } from '../../stores/tabStore'
import ChatTabContent from './contents/ChatTabContent'
import FlowTabContent from './contents/FlowTabContent'
import PlanTabContent from './contents/PlanTabContent'
import DiffTabContent from './contents/DiffTabContent'
import TerminalTabContent from './contents/TerminalTabContent'
import SettingsTabContent from './contents/SettingsTabContent'

interface TabContentProps {
  tab: Tab
}

export default function TabContent({ tab }: TabContentProps): JSX.Element {
  switch (tab.type) {
    case 'chat':
      return <ChatTabContent sessionId={tab.contextId} />
    case 'flow':
      return <FlowTabContent />
    case 'plan':
      return <PlanTabContent />
    case 'diff':
      return <DiffTabContent />
    case 'terminal':
      return <TerminalTabContent />
    case 'settings':
      return <SettingsTabContent contextId={tab.contextId} />
    default:
      return <div className="flex-1 p-8 text-text-tertiary">Unknown tab type</div>
  }
}
```

---

# 📦 SECTION 13: Update Settings Section ID Mapping

The Settings sidebar in the left panel uses IDs like `api-keys`. The SettingsPage expects the same. We need to make sure the contextId from the sidebar matches.

## Task 13.1: Verify Sidebar Settings Panel IDs

**File path:** `src/renderer/src/components/Sidebar/SettingsPanel.tsx`

**Action:** OVERWRITE entire file (ensures IDs match).

**Exact content:**

```typescript
import { Settings as SettingsIcon, KeyRound, Zap, Sliders, Info, Brain } from 'lucide-react'
import { useTabStore } from '../../stores'
import SidebarHeader from './SidebarHeader'
import { useState } from 'react'
import { cn } from '../../lib/utils'

interface SettingsItem {
  id: string
  label: string
  icon: typeof SettingsIcon
}

const ITEMS: SettingsItem[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  { id: 'models', label: 'Models', icon: Zap },
  { id: 'brain-modes', label: 'Brain Modes', icon: Brain },
  { id: 'about', label: 'About', icon: Info }
]

export default function SettingsPanel(): JSX.Element {
  const [q, setQ] = useState('')
  const openTab = useTabStore((s) => s.openTab)

  const filtered = ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))

  const handleOpen = (item: SettingsItem): void => {
    openTab({
      id: undefined as unknown as string,
      type: 'settings',
      title: `Settings: ${item.label}`,
      contextId: item.id
    })
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader title="Settings" searchQuery={q} onSearchChange={setQ} />
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleOpen(item)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors'
              )}
            >
              <Icon size={14} className="shrink-0 text-text-tertiary" />
              <span className="text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 14: Verification

## Task 14.1: Type Check

```bash
npm run typecheck
```

## Task 14.2: Lint

```bash
npm run lint
```

## Task 14.3: Format

```bash
npm run format
```

## Task 14.4: Tests

```bash
npm run test:run
```

## Task 14.5: Build

```bash
npm run build
```

## Task 14.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Click Settings icon in activity bar → Settings panel shows General/API Keys/Models/Brain Modes/About
- [ ] Click "API Keys" → settings tab opens with API Keys section visible
- [ ] Click sub-sidebar "General" → switches to General section
- [ ] Slide font size → updates value display (visual only for now)
- [ ] Toggle Auto-update / Telemetry → checkboxes work
- [ ] Switch language → dropdown updates
- [ ] Go to API Keys section
- [ ] Click "Add" next to Anthropic → input appears
- [ ] Paste a fake key (e.g., "sk-test-xxx") → click Save → "Set" badge appears
- [ ] Click eye icon → key visibility toggles
- [ ] Click "Update" → new input appears, can paste new key
- [ ] Click Trash icon → confirmation, then "Not set" badge
- [ ] Add fake keys for 2-3 providers
- [ ] Close app, reopen → keys still saved (encrypted), badges still "Set"
- [ ] Go to Models section → providers with keys show "Configured" green badge, others show "Needs API key" yellow
- [ ] Click a model → it becomes selected (accent border)
- [ ] Status bar at bottom shows new model
- [ ] Go to Brain Modes section → 5 cards
- [ ] Change model for "Plan" mode → persists in store
- [ ] Adjust temperature slider → number updates live
- [ ] Type in System Prompt textarea → saves
- [ ] Go to About → version, platform, links visible
- [ ] Verify settings persist after app restart

---

# 📦 SECTION 15: Git Commit

```bash
git add .
git commit -m "feat: settings page with API keys, models, brain modes (Chapter 11)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Settings components exist

```bash
ls src/renderer/src/components/Settings/SettingsPage.tsx src/renderer/src/components/Settings/SettingsSidebar.tsx src/renderer/src/components/Settings/SettingRow.tsx src/renderer/src/components/Settings/SectionHeader.tsx src/renderer/src/components/Settings/ApiKeyRow.tsx
```

## ✅ Check 2: All section files exist

```bash
ls src/renderer/src/components/Settings/sections/GeneralSection.tsx src/renderer/src/components/Settings/sections/ApiKeysSection.tsx src/renderer/src/components/Settings/sections/ModelsSection.tsx src/renderer/src/components/Settings/sections/BrainModesSection.tsx src/renderer/src/components/Settings/sections/AboutSection.tsx
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

## ✅ Check 7: API keys save & persist (user confirmed)

## ✅ Check 8: All 5 sections render (user confirmed)

## ✅ Check 9: Model selection updates status bar (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 11 Completion Report

```
✅ Chapter 11: Settings Window & API Key Management - COMPLETE

Acceptance Criteria Met:
✅ 5 settings sections (General, API Keys, Models, Brain Modes, About)
✅ Sub-sidebar navigation
✅ API key add/update/delete with encrypted storage
✅ Provider availability based on configured keys
✅ Model selector reflects selection across app
✅ Brain mode customization (model, temp, system prompt)
✅ All settings persist
✅ Build works
✅ Tests passing

Ready to proceed to Chapter 12.
```

---

# 🚨 Troubleshooting

## API key save fails with "Encryption not available"

On Linux, this requires libsecret. On macOS/Windows it should work out of the box. For dev environments without keychain access, the key save will fail. Acceptable for now.

## Settings tab title shows "Settings: X" but section is wrong

Ensure the contextId in the sidebar matches the SettingsSection union: `general`, `api-keys`, `models`, `brain-modes`, `about` (with the dashes).

## "Configured" badge not appearing after saving key

Click away from the input, then refresh the section by clicking another section and back. The list refresh runs on `onChange`.

## window.open in Electron production

External links may not open. This will be replaced with shell.openExternal IPC call in a polish chapter.

---

**End of Chapter 11 Implementation Plan**
