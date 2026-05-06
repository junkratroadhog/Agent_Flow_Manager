# 📘 Chapter 12 Implementation Plan: LLM Provider Integration

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 12 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-11 must be complete with all verification checks passing.

---

## 🎯 Chapter 12 Goal

Wire up real LLM providers (Anthropic, OpenAI, Google) using the **Vercel AI SDK** as the abstraction layer. Build a provider registry that uses API keys from `SecretStorage` (Chapter 4), supports streaming text generation, and tracks token usage and cost per call.

## 📋 What Will Exist When This Chapter Is Done

- Vercel AI SDK and provider packages installed
- `LLMProvider` abstraction in `src/main/services/llm/`
- Three concrete providers: Anthropic, OpenAI, Google
- Provider registry that picks the right SDK based on model ID prefix
- Token + cost calculator with per-model pricing
- IPC handlers for `llm:generate` and `llm:streamGenerate`
- Renderer service `llmService` exposing `generateText` and `streamText`
- A "Test Connection" button on the API Keys settings page that actually calls the provider
- Provider status (online/offline) reflected in `useSettingsStore.providerStatus`

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

## Task 1.2: Verify Settings UI

**Command:**

```bash
npm run dev
```

**Expected:** Settings page from Chapter 11 works, can save API keys.

**Action:** Close the window. Proceed.

---

# 📦 SECTION 2: Install Dependencies

## Task 2.1: Install Vercel AI SDK Core

**Command:**

```bash
npm install ai
```

## Task 2.2: Install Provider Packages

**Command:**

```bash
npm install @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

## Task 2.3: Verify Installs

**Command:**

```bash
npm list ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

**Expected:** All four packages listed with versions.

---

# 📦 SECTION 3: Pricing Table

## Task 3.1: Create Pricing Constants

**File path:** `src/main/services/llm/pricing.ts`

**Command first:**

```bash
mkdir -p src/main/services/llm
```

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Per-million-token pricing in USD. Used for cost estimation.
 * Update these when providers change pricing.
 */

export interface ModelPricing {
  input: number // $ per 1M input tokens
  output: number // $ per 1M output tokens
}

const PRICING: Record<string, ModelPricing> = {
  // Anthropic
  'claude-opus': { input: 15, output: 75 },
  'claude-sonnet': { input: 3, output: 15 },
  'claude-haiku': { input: 0.25, output: 1.25 },

  // OpenAI
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },

  // Google
  'gemini-pro': { input: 1.25, output: 5 },
  'gemini-flash': { input: 0.075, output: 0.3 },
  'gemini-3-flash': { input: 0.075, output: 0.3 }
}

export function getPricing(modelId: string): ModelPricing {
  return PRICING[modelId] ?? { input: 0, output: 0 }
}

export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const pricing = getPricing(modelId)
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
}
```

---

# 📦 SECTION 4: Provider Resolver

## Task 4.1: Create Provider Mapping

**File path:** `src/main/services/llm/providerMap.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export type ProviderId = 'anthropic' | 'openai' | 'google'

export function getProviderForModel(modelId: string): ProviderId {
  if (modelId.startsWith('claude')) return 'anthropic'
  if (modelId.startsWith('gpt')) return 'openai'
  if (modelId.startsWith('gemini')) return 'google'
  // Default fallback
  return 'anthropic'
}

/**
 * Some providers expose a different model name internally than what we surface in our UI.
 * This maps our friendly id to the API id.
 */
const MODEL_ID_MAP: Record<string, string> = {
  // Anthropic — pinned versions
  'claude-opus': 'claude-opus-4-7',
  'claude-sonnet': 'claude-sonnet-4-6',
  'claude-haiku': 'claude-haiku-4-5-20251001',

  // OpenAI
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',

  // Google
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-flash': 'gemini-1.5-flash',
  'gemini-3-flash': 'gemini-2.0-flash-exp'
}

export function resolveApiModelId(modelId: string): string {
  return MODEL_ID_MAP[modelId] ?? modelId
}
```

---

# 📦 SECTION 5: Provider Factory

## Task 5.1: Create Provider Factory

**File path:** `src/main/services/llm/providerFactory.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'
import type { SecretStorage } from '../SecretStorage'
import { getProviderForModel, resolveApiModelId, type ProviderId } from './providerMap'

export class ProviderFactory {
  constructor(private secretStorage: SecretStorage) {}

  /**
   * Returns the API key for a provider, preferring env vars then SecretStorage.
   */
  private getApiKey(provider: ProviderId): string | null {
    const envVar = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      google: 'GOOGLE_GENERATIVE_AI_API_KEY'
    }[provider]
    const fromEnv = process.env[envVar]
    if (fromEnv) return fromEnv
    return this.secretStorage.getApiKey(provider)
  }

  /**
   * Builds an AI SDK LanguageModel for the given model ID.
   * Throws if the API key is missing.
   */
  getLanguageModel(modelId: string): LanguageModel {
    const provider = getProviderForModel(modelId)
    const apiId = resolveApiModelId(modelId)
    const apiKey = this.getApiKey(provider)
    if (!apiKey) {
      throw new Error(`No API key configured for ${provider}. Add one in Settings → API Keys.`)
    }

    switch (provider) {
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey })
        return anthropic(apiId)
      }
      case 'openai': {
        const openai = createOpenAI({ apiKey })
        return openai(apiId)
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey })
        return google(apiId)
      }
    }
  }

  hasKey(provider: ProviderId): boolean {
    return this.getApiKey(provider) !== null
  }
}
```

---

# 📦 SECTION 6: LLM Service

## Task 6.1: Create LLM Service

**File path:** `src/main/services/llm/LLMService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { generateText, streamText, type CoreMessage } from 'ai'
import type { ProviderFactory } from './providerFactory'
import { calculateCost } from './pricing'
import type { ProviderId } from './providerMap'
import { getProviderForModel } from './providerMap'

export interface LLMGenerateInput {
  modelId: string
  messages: CoreMessage[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMGenerateResult {
  text: string
  inputTokens: number
  outputTokens: number
  cost: number
  modelId: string
  finishReason: string
}

export interface StreamCallbacks {
  onDelta: (text: string) => void
  onFinish: (result: LLMGenerateResult) => void
  onError: (error: Error) => void
}

export class LLMService {
  constructor(private providerFactory: ProviderFactory) {}

  /**
   * Generate a non-streaming text response.
   */
  async generate(input: LLMGenerateInput): Promise<LLMGenerateResult> {
    const model = this.providerFactory.getLanguageModel(input.modelId)
    const result = await generateText({
      model,
      messages: input.messages,
      system: input.systemPrompt,
      temperature: input.temperature ?? 0.7,
      maxTokens: input.maxTokens
    })
    const inputTokens = result.usage?.promptTokens ?? 0
    const outputTokens = result.usage?.completionTokens ?? 0
    return {
      text: result.text,
      inputTokens,
      outputTokens,
      cost: calculateCost(input.modelId, inputTokens, outputTokens),
      modelId: input.modelId,
      finishReason: String(result.finishReason ?? 'stop')
    }
  }

  /**
   * Stream a text response, calling callbacks as deltas arrive.
   * Returns an AbortController that can be used to cancel mid-stream.
   */
  stream(input: LLMGenerateInput, callbacks: StreamCallbacks): AbortController {
    const controller = new AbortController()
    const start = async (): Promise<void> => {
      try {
        const model = this.providerFactory.getLanguageModel(input.modelId)
        const result = await streamText({
          model,
          messages: input.messages,
          system: input.systemPrompt,
          temperature: input.temperature ?? 0.7,
          maxTokens: input.maxTokens,
          abortSignal: controller.signal
        })

        for await (const delta of result.textStream) {
          callbacks.onDelta(delta)
        }

        const usage = await result.usage
        const inputTokens = usage?.promptTokens ?? 0
        const outputTokens = usage?.completionTokens ?? 0

        callbacks.onFinish({
          text: await result.text,
          inputTokens,
          outputTokens,
          cost: calculateCost(input.modelId, inputTokens, outputTokens),
          modelId: input.modelId,
          finishReason: String((await result.finishReason) ?? 'stop')
        })
      } catch (error) {
        if (controller.signal.aborted) {
          callbacks.onError(new Error('Aborted'))
        } else {
          callbacks.onError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }

    void start()
    return controller
  }

  /**
   * A cheap "ping" that sends a 1-token request to verify the API key works.
   */
  async testConnection(modelId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const model = this.providerFactory.getLanguageModel(modelId)
      await generateText({
        model,
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 1
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Returns a default test model for each provider.
   */
  getDefaultTestModel(provider: ProviderId): string {
    switch (provider) {
      case 'anthropic':
        return 'claude-haiku'
      case 'openai':
        return 'gpt-4o-mini'
      case 'google':
        return 'gemini-flash'
    }
  }

  resolveProvider(modelId: string): ProviderId {
    return getProviderForModel(modelId)
  }
}
```

---

# 📦 SECTION 7: IPC Channels & Types

## Task 7.1: Add LLM Channels

**File path:** `src/shared/ipc-channels.ts`

**Action:** Find the line `// API Keys` and ABOVE it (after `SETTINGS_GET_ALL`), insert these new constants. Use str_replace.

Find this:

```typescript
  SETTINGS_GET_ALL: 'settings:getAll',

  // API Keys
```

Replace with:

```typescript
  SETTINGS_GET_ALL: 'settings:getAll',

  // LLM
  LLM_GENERATE: 'llm:generate',
  LLM_STREAM_START: 'llm:streamStart',
  LLM_STREAM_CANCEL: 'llm:streamCancel',
  LLM_TEST_CONNECTION: 'llm:testConnection',

  // API Keys
```

Then find this:

```typescript
  TOOL_CALL_REQUESTED: 'event:tool:requested',
  TOOL_CALL_COMPLETED: 'event:tool:completed',
  WINDOW_MAXIMIZED: 'window:maximized'
```

Replace with:

```typescript
  TOOL_CALL_REQUESTED: 'event:tool:requested',
  TOOL_CALL_COMPLETED: 'event:tool:completed',
  LLM_STREAM_DELTA: 'event:llm:streamDelta',
  LLM_STREAM_FINISH: 'event:llm:streamFinish',
  LLM_STREAM_ERROR: 'event:llm:streamError',
  WINDOW_MAXIMIZED: 'window:maximized'
```

## Task 7.2: Add LLM Types

**File path:** `src/shared/llm-types.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMGenerateRequest {
  modelId: string
  messages: LLMMessage[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMGenerateResponse {
  text: string
  inputTokens: number
  outputTokens: number
  cost: number
  modelId: string
  finishReason: string
}

export interface LLMStreamStartRequest extends LLMGenerateRequest {
  streamId: string
}

export interface LLMStreamDelta {
  streamId: string
  text: string
}

export interface LLMStreamFinish {
  streamId: string
  result: LLMGenerateResponse
}

export interface LLMStreamError {
  streamId: string
  error: string
}

export interface LLMTestRequest {
  provider: 'anthropic' | 'openai' | 'google'
  modelId?: string
}

export interface LLMTestResponse {
  ok: boolean
  error?: string
  durationMs?: number
}
```

---

# 📦 SECTION 8: LLM IPC Handlers

## Task 8.1: Create LLM Handler

**File path:** `src/main/ipc/llmHandlers.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { ipcMain, BrowserWindow } from 'electron'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type {
  LLMGenerateRequest,
  LLMGenerateResponse,
  LLMStreamStartRequest,
  LLMTestRequest,
  LLMTestResponse
} from '@shared/llm-types'
import type { LLMService } from '../services/llm/LLMService'

// Track active streams so we can cancel them
const activeStreams = new Map<string, AbortController>()

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

export function registerLLMHandlers(llm: LLMService): void {
  ipcMain.handle(
    IPC.LLM_GENERATE,
    async (_event, req: LLMGenerateRequest): Promise<IPCResult<LLMGenerateResponse>> => {
      try {
        const result = await llm.generate({
          modelId: req.modelId,
          messages: req.messages,
          systemPrompt: req.systemPrompt,
          temperature: req.temperature,
          maxTokens: req.maxTokens
        })
        return ipcSuccess(result)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.LLM_STREAM_START,
    async (_event, req: LLMStreamStartRequest): Promise<IPCResult<{ streamId: string }>> => {
      try {
        const { streamId } = req
        const controller = llm.stream(
          {
            modelId: req.modelId,
            messages: req.messages,
            systemPrompt: req.systemPrompt,
            temperature: req.temperature,
            maxTokens: req.maxTokens
          },
          {
            onDelta: (text) => {
              broadcastToWindows(IPC_EVENTS.LLM_STREAM_DELTA, { streamId, text })
            },
            onFinish: (result) => {
              broadcastToWindows(IPC_EVENTS.LLM_STREAM_FINISH, { streamId, result })
              activeStreams.delete(streamId)
            },
            onError: (err) => {
              broadcastToWindows(IPC_EVENTS.LLM_STREAM_ERROR, {
                streamId,
                error: err.message
              })
              activeStreams.delete(streamId)
            }
          }
        )
        activeStreams.set(streamId, controller)
        return ipcSuccess({ streamId })
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.LLM_STREAM_CANCEL,
    async (_event, streamId: string): Promise<IPCResult<boolean>> => {
      try {
        const controller = activeStreams.get(streamId)
        if (!controller) return ipcSuccess(false)
        controller.abort()
        activeStreams.delete(streamId)
        return ipcSuccess(true)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.LLM_TEST_CONNECTION,
    async (_event, req: LLMTestRequest): Promise<IPCResult<LLMTestResponse>> => {
      const start = Date.now()
      try {
        const modelId = req.modelId ?? llm.getDefaultTestModel(req.provider)
        const test = await llm.testConnection(modelId)
        return ipcSuccess({ ...test, durationMs: Date.now() - start })
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
```

## Task 8.2: Register Handler in IPC Index

**File path:** `src/main/ipc/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import type { Repositories } from '../db/repositories'
import type { SecretStorage } from '../services/SecretStorage'
import type { LLMService } from '../services/llm/LLMService'
import { registerProjectHandlers } from './projectHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerMessageHandlers } from './messageHandlers'
import { registerAgentHandlers } from './agentHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerApiKeyHandlers } from './apiKeyHandlers'
import { registerAppHandlers } from './appHandlers'
import { registerLLMHandlers } from './llmHandlers'

export function registerAllIpcHandlers(
  repos: Repositories,
  secretStorage: SecretStorage,
  llm: LLMService
): void {
  registerProjectHandlers(repos)
  registerSessionHandlers(repos)
  registerMessageHandlers(repos)
  registerAgentHandlers(repos)
  registerSettingsHandlers(repos)
  registerApiKeyHandlers(secretStorage)
  registerAppHandlers()
  registerLLMHandlers(llm)
}
```

---

# 📦 SECTION 9: Wire Into Main Entry

## Task 9.1: Update Main Index

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
      registerAllIpcHandlers(repos, secretStorage, llmService)
      console.info('Database, IPC, and LLM service initialized')
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

# 📦 SECTION 10: Renderer LLM Service

## Task 10.1: Create LLM Service in Renderer

**File path:** `src/renderer/src/services/llmService.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { invoke, subscribe } from './bridge'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import type {
  LLMGenerateRequest,
  LLMGenerateResponse,
  LLMStreamStartRequest,
  LLMStreamDelta,
  LLMStreamFinish,
  LLMStreamError,
  LLMTestRequest,
  LLMTestResponse
} from '@shared/llm-types'

let streamCounter = 0
function generateStreamId(): string {
  streamCounter++
  return `stream_${Date.now()}_${streamCounter}`
}

export interface StreamHandlers {
  onDelta?: (text: string) => void
  onFinish?: (result: LLMGenerateResponse) => void
  onError?: (error: string) => void
}

export const llmService = {
  generate: (req: LLMGenerateRequest): Promise<LLMGenerateResponse> =>
    invoke<LLMGenerateResponse>(IPC.LLM_GENERATE, req),

  /**
   * Starts a streaming generation. Returns the streamId and an unsubscribe function
   * that detaches the listeners (use it in cleanup).
   */
  stream: async (
    req: Omit<LLMStreamStartRequest, 'streamId'>,
    handlers: StreamHandlers
  ): Promise<{ streamId: string; cancel: () => Promise<void>; unsubscribe: () => void }> => {
    const streamId = generateStreamId()

    const unsubDelta = subscribe(IPC_EVENTS.LLM_STREAM_DELTA, (...args) => {
      const payload = args[0] as LLMStreamDelta
      if (payload.streamId === streamId && handlers.onDelta) {
        handlers.onDelta(payload.text)
      }
    })
    const unsubFinish = subscribe(IPC_EVENTS.LLM_STREAM_FINISH, (...args) => {
      const payload = args[0] as LLMStreamFinish
      if (payload.streamId === streamId && handlers.onFinish) {
        handlers.onFinish(payload.result)
      }
    })
    const unsubError = subscribe(IPC_EVENTS.LLM_STREAM_ERROR, (...args) => {
      const payload = args[0] as LLMStreamError
      if (payload.streamId === streamId && handlers.onError) {
        handlers.onError(payload.error)
      }
    })

    const unsubscribe = (): void => {
      unsubDelta()
      unsubFinish()
      unsubError()
    }

    await invoke<{ streamId: string }>(IPC.LLM_STREAM_START, { ...req, streamId })

    const cancel = async (): Promise<void> => {
      await invoke<boolean>(IPC.LLM_STREAM_CANCEL, streamId)
      unsubscribe()
    }

    return { streamId, cancel, unsubscribe }
  },

  testConnection: (req: LLMTestRequest): Promise<LLMTestResponse> =>
    invoke<LLMTestResponse>(IPC.LLM_TEST_CONNECTION, req)
}
```

## Task 10.2: Add to Services Index

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
```

---

# 📦 SECTION 11: "Test Connection" Button in API Keys

## Task 11.1: Update ApiKeyRow

**File path:** `src/renderer/src/components/Settings/ApiKeyRow.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Eye, EyeOff, Trash2, Check, AlertCircle, Loader2, Plug } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { apiKeyService, llmService } from '../../services'
import { cn } from '../../lib/utils'
import { useSettingsStore } from '../../stores'

interface ApiKeyRowProps {
  provider: 'anthropic' | 'openai' | 'google' | string
  label: string
  description: string
  hasKey: boolean
  onChange: () => void
}

const TESTABLE_PROVIDERS = new Set(['anthropic', 'openai', 'google'])

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
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    ok: boolean
    error?: string
    durationMs?: number
  } | null>(null)
  const setProviderStatus = useSettingsStore((s) => s.setProviderStatus)

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
      setProviderStatus(provider, 'unknown')
      setTestResult(null)
      onChange()
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleTest = async (): Promise<void> => {
    if (!TESTABLE_PROVIDERS.has(provider)) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await llmService.testConnection({
        provider: provider as 'anthropic' | 'openai' | 'google'
      })
      setTestResult(result)
      setProviderStatus(provider, result.ok ? 'online' : 'error')
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      setTestResult({ ok: false, error })
      setProviderStatus(provider, 'error')
    } finally {
      setTesting(false)
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
          <div className="flex items-center gap-2 flex-wrap">
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
            {testResult && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]',
                  testResult.ok
                    ? 'bg-status-success/15 text-status-success'
                    : 'bg-status-error/15 text-status-error'
                )}
              >
                {testResult.ok
                  ? `Connected (${testResult.durationMs}ms)`
                  : 'Connection failed'}
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
          {testResult?.error && (
            <p className="text-xs text-status-error mt-1 font-mono leading-snug break-all">
              {testResult.error}
            </p>
          )}
        </div>
        {!editing && (
          <div className="flex gap-2 shrink-0">
            {hasKey && TESTABLE_PROVIDERS.has(provider) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTest}
                disabled={testing}
                className="gap-1.5"
              >
                {testing ? <Loader2 size={12} className="animate-spin" /> : <Plug size={12} />}
                Test
              </Button>
            )}
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
            <p className="text-xs text-status-error">
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

---

# 📦 SECTION 12: LLM Smoke Test Route

## Task 12.1: Create Test Page

**File path:** `src/renderer/src/routes/LLMSmokeTest.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../components/ui/Select'
import { llmService } from '../services'
import { AVAILABLE_MODELS } from '../lib/models'
import { formatCost, formatTokens } from '../lib/formatters'

export default function LLMSmokeTest(): JSX.Element {
  const [model, setModel] = useState('claude-haiku')
  const [prompt, setPrompt] = useState('Say hello in one sentence.')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<{
    inputTokens: number
    outputTokens: number
    cost: number
  } | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<(() => Promise<void>) | null>(null)

  const handleGenerate = async (): Promise<void> => {
    setOutput('')
    setStats(null)
    setError(null)
    try {
      const result = await llmService.generate({
        modelId: model,
        messages: [{ role: 'user', content: prompt }]
      })
      setOutput(result.text)
      setStats({
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        cost: result.cost
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleStream = async (): Promise<void> => {
    setOutput('')
    setStats(null)
    setError(null)
    setStreaming(true)
    try {
      const { cancel, unsubscribe } = await llmService.stream(
        {
          modelId: model,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          onDelta: (delta) => setOutput((prev) => prev + delta),
          onFinish: (result) => {
            setStats({
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              cost: result.cost
            })
            setStreaming(false)
            unsubscribe()
            cancelRef.current = null
          },
          onError: (err) => {
            setError(err)
            setStreaming(false)
            unsubscribe()
            cancelRef.current = null
          }
        }
      )
      cancelRef.current = cancel
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStreaming(false)
    }
  }

  const handleCancel = async (): Promise<void> => {
    if (cancelRef.current) {
      await cancelRef.current()
      cancelRef.current = null
      setStreaming(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">LLM Smoke Test</h1>
          <p className="text-sm text-text-secondary">
            Verify that the LLM provider is wired up correctly. Requires an API key for the
            selected provider.
          </p>
        </header>

        <div className="space-y-3">
          <label className="text-xs font-medium text-text-secondary">Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label} ({m.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-text-secondary">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={streaming}>
            Generate
          </Button>
          <Button variant="secondary" onClick={handleStream} disabled={streaming}>
            Stream
          </Button>
          {streaming && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {output && (
          <div className="rounded-md border border-border bg-bg-deep p-4 whitespace-pre-wrap font-sans text-sm">
            {output}
            {streaming && <span className="animate-pulse">▌</span>}
          </div>
        )}

        {stats && (
          <div className="text-xs text-text-tertiary flex gap-4">
            <span>{formatTokens(stats.inputTokens)} in</span>
            <span>{formatTokens(stats.outputTokens)} out</span>
            <span>{formatCost(stats.cost)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Task 12.2: Register a Way to Open the Smoke Test

For ad-hoc testing, we'll add a hidden command. Add a keyboard shortcut Ctrl+Shift+L to open the LLM smoke test as a tab.

**File path:** `src/renderer/src/components/Tabs/TabWorkspace.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect } from 'react'
import { useTabStore } from '../../stores'
import TabBar from './TabBar'
import TabContent from './TabContent'
import EmptyTabState from './EmptyTabState'

export default function TabWorkspace(): JSX.Element {
  const { tabs, activeTabId, openTab, closeTab, cycleNext, cyclePrevious } = useTabStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        if (activeTabId) closeTab(activeTabId)
      } else if (ctrl && e.key.toLowerCase() === 't') {
        e.preventDefault()
        openTab({
          id: undefined as unknown as string,
          type: 'chat',
          title: 'New Chat'
        })
      } else if (ctrl && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        cycleNext()
      } else if (ctrl && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        cyclePrevious()
      } else if (ctrl && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        openTab({
          id: undefined as unknown as string,
          type: 'settings',
          title: 'LLM Smoke Test',
          contextId: '__llm_smoke_test__'
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, closeTab, openTab, cycleNext, cyclePrevious])

  if (tabs.length === 0) {
    return <EmptyTabState />
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  return (
    <div className="flex flex-col h-full bg-bg-deepest">
      <TabBar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <TabContent tab={activeTab} />
      </div>
    </div>
  )
}
```

## Task 12.3: Update Settings Tab Content to Handle LLM Smoke Test

**File path:** `src/renderer/src/components/Tabs/contents/SettingsTabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import SettingsPage from '../../Settings/SettingsPage'
import LLMSmokeTest from '../../../routes/LLMSmokeTest'
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
  if (contextId === '__llm_smoke_test__') {
    return <LLMSmokeTest />
  }

  const initialSection = (
    contextId && VALID_SECTIONS.includes(contextId as SettingsSection)
      ? (contextId as SettingsSection)
      : 'general'
  ) as SettingsSection

  return <SettingsPage initialSection={initialSection} />
}
```

---

# 📦 SECTION 13: Tests

## Task 13.1: Create Pricing Tests

**File path:** `tests/unit/pricing.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import { calculateCost, getPricing } from '../../src/main/services/llm/pricing'

describe('pricing', () => {
  it('returns known pricing for claude-opus', () => {
    expect(getPricing('claude-opus')).toEqual({ input: 15, output: 75 })
  })

  it('returns zero pricing for unknown models', () => {
    expect(getPricing('made-up-model')).toEqual({ input: 0, output: 0 })
  })

  it('calculates cost correctly', () => {
    // claude-haiku: $0.25 input, $1.25 output per 1M
    // 1000 input, 1000 output = $0.00025 + $0.00125 = $0.0015
    const cost = calculateCost('claude-haiku', 1000, 1000)
    expect(cost).toBeCloseTo(0.0015, 6)
  })

  it('returns 0 for unknown model', () => {
    expect(calculateCost('unknown', 1000, 1000)).toBe(0)
  })
})

describe('providerMap', () => {
  it('maps model prefixes to providers', async () => {
    const { getProviderForModel } = await import('../../src/main/services/llm/providerMap')
    expect(getProviderForModel('claude-opus')).toBe('anthropic')
    expect(getProviderForModel('gpt-4o')).toBe('openai')
    expect(getProviderForModel('gemini-flash')).toBe('google')
  })
})
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

**Note:** This requires at least one valid API key. If you don't have one, install Ollama or use a free-tier Google AI key.

- [ ] App launches without errors. Terminal shows "Database, IPC, and LLM service initialized"
- [ ] Open Settings → API Keys
- [ ] If a key for Anthropic/OpenAI/Google is already configured: click "Test" → loading spinner → green badge "Connected (XXXms)"
- [ ] If test fails (invalid key) → red badge "Connection failed", error displayed
- [ ] Press **Ctrl+Shift+L** → tab opens with "LLM Smoke Test"
- [ ] Pick a model whose key is set → click "Generate" → response appears within ~2-10 seconds
- [ ] Token counts and cost shown below response
- [ ] Click "Stream" → text appears progressively, cursor blinks
- [ ] During streaming, click "Cancel" → stream stops mid-generation
- [ ] No console errors in DevTools

**Stop the app after verification.**

---

# 📦 SECTION 15: Git Commit

```bash
git add .
git commit -m "feat: LLM provider integration with streaming (Chapter 12)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: LLM service files exist

```bash
ls src/main/services/llm/LLMService.ts src/main/services/llm/providerFactory.ts src/main/services/llm/providerMap.ts src/main/services/llm/pricing.ts
```

## ✅ Check 2: IPC handler exists

```bash
ls src/main/ipc/llmHandlers.ts
```

## ✅ Check 3: Renderer service & types exist

```bash
ls src/renderer/src/services/llmService.ts src/shared/llm-types.ts
```

## ✅ Check 4: Smoke test route exists

```bash
ls src/renderer/src/routes/LLMSmokeTest.tsx
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

## ✅ Check 8: Test connection works (user confirmed with valid key)

## ✅ Check 9: Streaming works with cancel (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 12 Completion Report

```
✅ Chapter 12: LLM Provider Integration - COMPLETE

Acceptance Criteria Met:
✅ Vercel AI SDK + 3 providers installed
✅ Provider factory with API key resolution
✅ LLMService with generate + stream
✅ Cost calculator with per-model pricing
✅ IPC handlers for generate, stream, cancel, test
✅ Renderer service with streaming subscriptions
✅ Test connection button on API Keys page
✅ Provider status reflected in settingsStore
✅ LLM smoke test route (Ctrl+Shift+L)
✅ Stream cancellation works
✅ Tests passing
✅ Build works

Ready to proceed to Chapter 13: Chat Interface — Message Rendering.
```

---

# 🚨 Troubleshooting

## "No API key configured"

Verify a key was saved in Settings → API Keys. Or set the env var (`ANTHROPIC_API_KEY`) before launching.

## Stream callbacks fire on the wrong streamId

The streamId is included in every event payload; the renderer filters by streamId. If you see crosstalk, verify `IPC_EVENTS.LLM_STREAM_DELTA` is unique.

## "Cannot find module '@ai-sdk/anthropic'"

Re-run `npm install @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google`.

## Generate works but Stream doesn't

- Check DevTools console for errors on each delta
- Verify `subscribe()` is called BEFORE `LLM_STREAM_START`
- Inspect main process console for stream errors

## Streaming aborts immediately

- Some Vercel AI SDK versions have bugs with abort signals. Update with `npm install ai@latest`.

## Cost shows $0

- Verify the model ID matches an entry in `pricing.ts`
- For unknown/local models, cost will be $0 by design

---

**End of Chapter 12 Implementation Plan**
