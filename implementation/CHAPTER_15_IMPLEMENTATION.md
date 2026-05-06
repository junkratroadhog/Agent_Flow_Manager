# 📘 Chapter 15 Implementation Plan: Streaming & Real-Time Updates

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 15 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-14 must be complete with all verification checks passing.

---

## 🎯 Chapter 15 Goal

Wire the **Composer (Ch 14) → LLM service (Ch 12) → Message list (Ch 13)** into a complete streaming chat loop. When the user sends a message, the assistant's response streams token-by-token into the chat. Cancellation works mid-stream. Failed streams can be retried. Errors are surfaced gracefully.

## 📋 What Will Exist When This Chapter Is Done

- A `ChatController` hook that owns the send → stream → persist loop
- Token-by-token rendering of assistant messages as they arrive
- Cancel button that aborts mid-stream and saves the partial response
- Retry/regenerate on failed or completed assistant messages
- Conversation history sent to the LLM (full prior message context)
- Token usage and cost saved to the assistant message in DB
- System prompts pulled from the active brain mode
- Stop on Escape key while streaming
- Streaming indicator in status bar reflects real activity (not the demo from Ch 10)
- Error toast on failure with one-click retry

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

## Task 1.2: Verify LLM Smoke Test Works

**Command:**

```bash
npm run dev
```

Press **Ctrl+Shift+L**, run a quick generate. If it works, an API key is properly configured. Close the app and proceed.

---

# 📦 SECTION 2: Update Message Service

The message service needs an "update" endpoint so we can patch a streaming message's content as deltas arrive.

## Task 2.1: Add Update Channel

**File path:** `src/shared/ipc-channels.ts`

**Action:** Find the line `MESSAGE_DELETE: 'messages:delete',` and ADD a new line directly above it.

Find this:

```typescript
  MESSAGE_LIST: 'messages:list',
  MESSAGE_CREATE: 'messages:create',
  MESSAGE_DELETE: 'messages:delete',
```

Replace with:

```typescript
  MESSAGE_LIST: 'messages:list',
  MESSAGE_CREATE: 'messages:create',
  MESSAGE_UPDATE: 'messages:update',
  MESSAGE_DELETE: 'messages:delete',
```

## Task 2.2: Add Update Method to Repository

**File path:** `src/main/db/repositories/MessageRepository.ts`

**Action:** Find the `delete(id: string)` method and ADD a new method directly above it.

Find this:

```typescript
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM messages WHERE id = ?').run(id)
    return result.changes > 0
  }
```

Replace with:

```typescript
  update(
    id: string,
    updates: {
      content?: string
      tokens_in?: number
      tokens_out?: number
      cost?: number
      metadata_json?: string
    }
  ): Message | null {
    const existing = this.findById(id)
    if (!existing) return null
    const merged = { ...existing, ...updates }
    this.db
      .prepare(
        `UPDATE messages SET content = ?, tokens_in = ?, tokens_out = ?, cost = ?, metadata_json = ? WHERE id = ?`
      )
      .run(
        merged.content,
        merged.tokens_in,
        merged.tokens_out,
        merged.cost,
        merged.metadata_json,
        id
      )
    return this.findById(id)
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM messages WHERE id = ?').run(id)
    return result.changes > 0
  }
```

## Task 2.3: Add Update Handler

**File path:** `src/main/ipc/messageHandlers.ts`

**Action:** OVERWRITE entire file.

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
        repos.sessions.touch(input.session_id)
        return ipcSuccess(msg)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.MESSAGE_UPDATE,
    async (
      _event,
      id: string,
      updates: {
        content?: string
        tokens_in?: number
        tokens_out?: number
        cost?: number
        metadata_json?: string
      }
    ): Promise<IPCResult<Message | null>> => {
      try {
        return ipcSuccess(repos.messages.update(id, updates))
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

## Task 2.4: Add Update Method to Renderer Service

**File path:** `src/renderer/src/services/messageService.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Message, CreateMessageInput } from '@shared/db-types'

export interface MessageUpdates {
  content?: string
  tokens_in?: number
  tokens_out?: number
  cost?: number
  metadata_json?: string
}

export const messageService = {
  list: (sessionId: string, limit?: number): Promise<Message[]> =>
    invoke<Message[]>(IPC.MESSAGE_LIST, sessionId, limit),
  create: (input: CreateMessageInput): Promise<Message> =>
    invoke<Message>(IPC.MESSAGE_CREATE, input),
  update: (id: string, updates: MessageUpdates): Promise<Message | null> =>
    invoke<Message | null>(IPC.MESSAGE_UPDATE, id, updates),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.MESSAGE_DELETE, id)
}
```

## Task 2.5: Add Update Action to Session Store

**File path:** `src/renderer/src/stores/sessionStore.ts`

**Action:** Find the `updateLastMessage` method definition. We need to add a more general `updateMessage` action.

Find this in the `SessionState` interface:

```typescript
  appendMessage: (sessionId: string, message: Message) => void
  updateLastMessage: (sessionId: string, content: string) => void
```

Replace with:

```typescript
  appendMessage: (sessionId: string, message: Message) => void
  updateLastMessage: (sessionId: string, content: string) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  removeMessage: (sessionId: string, messageId: string) => void
```

Then find this in the store implementation (the `updateLastMessage` action):

```typescript
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
```

Replace with:

```typescript
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

  updateMessage: (sessionId, messageId, updates): void =>
    set((s) => {
      const msgs = s.messagesBySession[sessionId] ?? []
      const idx = msgs.findIndex((m) => m.id === messageId)
      if (idx === -1) return s
      const updated = [...msgs]
      updated[idx] = { ...updated[idx], ...updates }
      return {
        messagesBySession: { ...s.messagesBySession, [sessionId]: updated }
      }
    }),

  removeMessage: (sessionId, messageId): void =>
    set((s) => {
      const msgs = s.messagesBySession[sessionId] ?? []
      return {
        messagesBySession: {
          ...s.messagesBySession,
          [sessionId]: msgs.filter((m) => m.id !== messageId)
        }
      }
    }),
```

---

# 📦 SECTION 3: Toast System

We need a toast container at the app level for streaming errors.

## Task 3.1: Add Toast Store

**File path:** `src/renderer/src/stores/toastStore.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { create } from 'zustand'
import type { ToastVariant } from '../components/ui/Toast'

export interface ToastEntry {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: ToastEntry[]
  showToast: (entry: Omit<ToastEntry, 'id'>) => string
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (entry): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ toasts: [...s.toasts, { ...entry, id }] }))
    return id
  },
  dismissToast: (id): void => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))
```

## Task 3.2: Add to Stores Index

**File path:** `src/renderer/src/stores/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
export * from './uiStore'
export * from './projectStore'
export * from './sessionStore'
export * from './agentStore'
export * from './flowStore'
export * from './settingsStore'
export * from './toolStore'
export * from './tabStore'
export * from './toastStore'
```

## Task 3.3: Create Toast Mount Point

**File path:** `src/renderer/src/components/Layout/AppToasts.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useToastStore } from '../../stores'
import { Toast } from '../ui/Toast'
import { Button } from '../ui/Button'

export default function AppToasts(): JSX.Element {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismissToast)

  return (
    <div className="fixed bottom-8 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <div key={t.id} className="relative">
            <Toast
              id={t.id}
              title={t.title}
              description={t.description}
              variant={t.variant}
              duration={t.duration}
              onDismiss={dismiss}
            />
            {t.action && (
              <div className="absolute right-12 bottom-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    t.action?.onClick()
                    dismiss(t.id)
                  }}
                >
                  {t.action.label}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Task 3.4: Mount Toasts in App

**File path:** `src/renderer/src/App.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import AppShell from './components/Layout/AppShell'
import AppToasts from './components/Layout/AppToasts'

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
      <AppToasts />
    </div>
  )
}

export default App
```

---

# 📦 SECTION 4: Conversation Builder

We need a helper to convert DB messages into the format the LLM service expects.

## Task 4.1: Create Conversation Builder

**File path:** `src/renderer/src/lib/conversationBuilder.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import type { Message } from '@shared/db-types'
import type { LLMMessage } from '@shared/llm-types'

/**
 * Converts DB messages into the format the LLM service expects.
 * Filters out system, tool, and any incomplete (placeholder) messages.
 */
export function buildLLMMessages(
  messages: Message[],
  excludeIds: Set<string> = new Set()
): LLMMessage[] {
  return messages
    .filter((m) => !excludeIds.has(m.id))
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
}

/**
 * Trims conversation history to fit within a target token budget.
 * Keeps the most recent messages first.
 * Uses the rough 4 chars/token estimate.
 */
export function trimToTokenBudget(messages: LLMMessage[], maxTokens: number): LLMMessage[] {
  const result: LLMMessage[] = []
  let total = 0
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    const tokens = Math.ceil(msg.content.length / 4)
    if (total + tokens > maxTokens) break
    result.unshift(msg)
    total += tokens
  }
  return result
}
```

---

# 📦 SECTION 5: ChatController Hook

This is the heart of the chapter — the orchestrator that ties everything together.

## Task 5.1: Create ChatController

**File path:** `src/renderer/src/hooks/useChatController.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useCallback, useEffect, useRef } from 'react'
import { useSessionStore, useSettingsStore, useToastStore } from '../stores'
import { messageService, llmService } from '../services'
import { buildLLMMessages, trimToTokenBudget } from '../lib/conversationBuilder'
import { getBrainModeInfo } from '../lib/brainModes'
import type { Message } from '@shared/db-types'

const HISTORY_TOKEN_BUDGET = 100_000

interface SendOptions {
  // If provided, retry generation for this assistant message instead of creating a new one
  retryFor?: string
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

  // Refs to allow cancel from anywhere
  const cancelFnRef = useRef<(() => Promise<void>) | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const currentAssistantIdRef = useRef<string | null>(null)
  const streamingTextRef = useRef<string>('')

  // The active session id is captured at send time so cancel works even if user switches tabs
  const activeSendRef = useRef<{ sessionId: string; assistantId: string } | null>(null)

  const cleanup = useCallback((): void => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    cancelFnRef.current = null
    currentAssistantIdRef.current = null
    streamingTextRef.current = ''
    activeSendRef.current = null
  }, [])

  const cancel = useCallback(async (): Promise<void> => {
    if (cancelFnRef.current) {
      await cancelFnRef.current()
    }
    // Persist whatever was streamed so far
    const ctx = activeSendRef.current
    if (ctx) {
      try {
        await messageService.update(ctx.assistantId, {
          content: streamingTextRef.current
        })
      } catch {
        // ignore
      }
    }
    setStreaming(false)
    cleanup()
  }, [cleanup, setStreaming])

  // Cancel on Escape while streaming
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

  const startStreamFor = useCallback(
    async (sessionId: string, assistantMessage: Message): Promise<void> => {
      const messages = messagesBySession[sessionId] ?? []
      // Build conversation history, EXCLUDING the placeholder assistant message
      const llmMessages = trimToTokenBudget(
        buildLLMMessages(messages, new Set([assistantMessage.id])),
        HISTORY_TOKEN_BUDGET
      )

      // Resolve model and system prompt from current brain mode
      const brainConfig = brainModes[currentBrainMode]
      const modelToUse = brainConfig.model || primaryModel
      const systemPrompt = brainConfig.systemPrompt || undefined
      const temperature = brainConfig.temperature

      streamingTextRef.current = ''
      currentAssistantIdRef.current = assistantMessage.id
      activeSendRef.current = { sessionId, assistantId: assistantMessage.id }
      setStreaming(true)

      try {
        const { cancel: cancelStream, unsubscribe } = await llmService.stream(
          {
            modelId: modelToUse,
            messages: llmMessages,
            systemPrompt,
            temperature
          },
          {
            onDelta: (text) => {
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
                // Mark the message with the error in metadata, but keep partial content
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
        // Remove the empty placeholder
        await messageService.delete(assistantMessage.id).catch(() => undefined)
        removeMessage(sessionId, assistantMessage.id)
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
      showToast
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ]
  )

  const send = useCallback(
    async (sessionId: string, content: string): Promise<void> => {
      if (isStreaming) return
      const trimmed = content.trim()
      if (!trimmed) return

      // 1. Persist user message
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

      // 2. Create empty assistant placeholder
      let assistantMsg: Message
      try {
        const brainConfig = brainModes[currentBrainMode]
        const modelToUse = brainConfig.model || primaryModel
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

      // 3. Start the streaming generation
      await startStreamFor(sessionId, assistantMsg)
    },
    [
      isStreaming,
      appendMessage,
      brainModes,
      currentBrainMode,
      primaryModel,
      showToast,
      startStreamFor
    ]
  )

  const retry = useCallback(
    async (sessionId: string, assistantMessageId: string): Promise<void> => {
      if (isStreaming) return
      const messages = messagesBySession[sessionId] ?? []
      const target = messages.find((m) => m.id === assistantMessageId)
      if (!target || target.role !== 'assistant') return

      // Reset the message content and stats
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

      await startStreamFor(sessionId, { ...target, content: '' })
    },
    [isStreaming, messagesBySession, updateMessage, showToast, startStreamFor]
  )

  return { send, retry, cancel, isStreaming }
}
```

---

# 📦 SECTION 6: Wire Composer to Controller

## Task 6.1: Update Composer to Use Controller

**File path:** `src/renderer/src/components/Composer/Composer.tsx`

**Action:** Find the `handleSend` function. We need to replace the placeholder timeout logic with the real controller.

Find this:

```typescript
    // Normal message — save user message via IPC. Real streaming response
    // generation is wired up in Chapter 15.
    try {
      const userMsg = await messageService.create({
        session_id: sessionId,
        role: 'user',
        content: trimmed,
        metadata_json: JSON.stringify({
          attachments: attachments.map((a) => ({
            kind: a.kind,
            name: a.name,
            mimeType: a.mimeType
          }))
        })
      })
      appendMessage(sessionId, userMsg)
      clearDraft(sessionId)
      setAttachments([])
      // Placeholder: real LLM call in Chapter 15
      setStreaming(true)
      setTimeout(() => setStreaming(false), 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }
```

Replace with:

```typescript
    // Normal message — delegate to ChatController for the full streaming pipeline
    clearDraft(sessionId)
    setAttachments([])
    try {
      await controller.send(sessionId, trimmed)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }
```

Then find the imports at the top of the file. Find:

```typescript
import { useSessionStore } from '../../stores'
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea'
import { messageService } from '../../services'
```

Replace with:

```typescript
import { useSessionStore } from '../../stores'
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea'
import { useChatController } from '../../hooks/useChatController'
import { messageService } from '../../services'
```

Then find this block at the top of the Composer function body:

```typescript
const draft = useSessionStore((s) => s.draftBySession[sessionId] ?? '')
const setDraft = useSessionStore((s) => s.setDraft)
const clearDraft = useSessionStore((s) => s.clearDraft)
const isStreaming = useSessionStore((s) => s.isStreaming)
const setMessages = useSessionStore((s) => s.setMessages)
const messagesBySession = useSessionStore((s) => s.messagesBySession)
const appendMessage = useSessionStore((s) => s.appendMessage)
const setStreaming = useSessionStore((s) => s.setStreaming)
```

Replace with:

```typescript
const draft = useSessionStore((s) => s.draftBySession[sessionId] ?? '')
const setDraft = useSessionStore((s) => s.setDraft)
const clearDraft = useSessionStore((s) => s.clearDraft)
const isStreaming = useSessionStore((s) => s.isStreaming)
const setMessages = useSessionStore((s) => s.setMessages)
const messagesBySession = useSessionStore((s) => s.messagesBySession)
const controller = useChatController()
```

Now find the Stop button's onClick — it currently calls `setStreaming(false)`:

```typescript
          {isStreaming ? (
            <Button
              onClick={() => setStreaming(false)}
              variant="danger"
              size="icon"
              className="m-1"
              aria-label="Stop"
            >
              <Square size={14} className="fill-current" />
            </Button>
```

Replace with:

```typescript
          {isStreaming ? (
            <Button
              onClick={() => controller.cancel()}
              variant="danger"
              size="icon"
              className="m-1"
              aria-label="Stop"
            >
              <Square size={14} className="fill-current" />
            </Button>
```

---

# 📦 SECTION 7: Wire Retry Into Message Footer

## Task 7.1: Update MessageFooter to Trigger Real Retry

**File path:** `src/renderer/src/components/Chat/MessageList.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { ArrowDown } from 'lucide-react'
import { useSessionStore } from '../../stores'
import { messageService } from '../../services'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useChatController } from '../../hooks/useChatController'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import Message from './Message'
import ChatEmptyState from './ChatEmptyState'

interface MessageListProps {
  sessionId: string
}

export default function MessageList({ sessionId }: MessageListProps): JSX.Element {
  const sessions = useSessionStore((s) => s.sessions)
  const messagesBySession = useSessionStore((s) => s.messagesBySession)
  const setMessages = useSessionStore((s) => s.setMessages)
  const removeMessage = useSessionStore((s) => s.removeMessage)
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const controller = useChatController()

  const [loading, setLoading] = useState(false)
  const messages = messagesBySession[sessionId] ?? []
  const session = sessions.find((s) => s.id === sessionId)
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([messages.length, isStreaming])

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const list = await messageService.list(sessionId)
      setMessages(sessionId, list)
    } catch (e) {
      console.error('Failed to load messages:', e)
    } finally {
      setLoading(false)
    }
  }, [sessionId, setMessages])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this message?')) return
    await messageService.delete(id)
    removeMessage(sessionId, id)
  }

  const handleRegenerate = async (id: string): Promise<void> => {
    if (controller.isStreaming) return
    await controller.retry(sessionId, id)
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5 animate-pulse">
              <div className="h-3 w-24 bg-bg-elevated rounded" />
              <div className="h-3 w-full bg-bg-elevated rounded" />
              <div className="h-3 w-3/4 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return <ChatEmptyState sessionTitle={session?.title} />
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 overflow-y-auto">
        {messages.map((m, idx) => {
          const isLastAssistant =
            idx === messages.length - 1 && m.role === 'assistant' && isStreaming
          return (
            <Message
              key={m.id}
              message={m}
              isStreaming={isLastAssistant}
              onDelete={() => handleDelete(m.id)}
              onRegenerate={
                m.role === 'assistant' ? () => handleRegenerate(m.id) : undefined
              }
            />
          )
        })}
        <div className="h-4" />
      </div>
      <div
        className={cn(
          'absolute bottom-3 right-3 transition-opacity pointer-events-none',
          isAtBottom ? 'opacity-0' : 'opacity-100'
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scrollToBottom('smooth')}
          className="rounded-full shadow-lg pointer-events-auto"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={14} />
        </Button>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 8: Tests

## Task 8.1: Conversation Builder Tests

**File path:** `tests/unit/conversationBuilder.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import { buildLLMMessages, trimToTokenBudget } from '../../src/renderer/src/lib/conversationBuilder'
import type { Message } from '../../src/shared/db-types'

const mkMsg = (id: string, role: Message['role'], content: string): Message => ({
  id,
  session_id: 's1',
  role,
  content,
  tokens_in: 0,
  tokens_out: 0,
  cost: 0,
  metadata_json: '{}',
  created_at: '2026-01-01'
})

describe('buildLLMMessages', () => {
  it('keeps user and assistant messages', () => {
    const msgs = [mkMsg('1', 'user', 'hi'), mkMsg('2', 'assistant', 'hello')]
    const result = buildLLMMessages(msgs)
    expect(result.length).toBe(2)
  })

  it('drops system and tool messages', () => {
    const msgs = [
      mkMsg('1', 'user', 'hi'),
      mkMsg('2', 'system', 'sys'),
      mkMsg('3', 'tool', 'tool result')
    ]
    expect(buildLLMMessages(msgs).length).toBe(1)
  })

  it('excludes ids in the exclusion set', () => {
    const msgs = [mkMsg('1', 'user', 'hi'), mkMsg('2', 'assistant', 'hello')]
    expect(buildLLMMessages(msgs, new Set(['2'])).length).toBe(1)
  })
})

describe('trimToTokenBudget', () => {
  it('keeps all messages if within budget', () => {
    const msgs = [
      { role: 'user' as const, content: 'short' },
      { role: 'assistant' as const, content: 'reply' }
    ]
    expect(trimToTokenBudget(msgs, 1000).length).toBe(2)
  })

  it('drops oldest messages first when over budget', () => {
    const msgs = [
      { role: 'user' as const, content: 'a'.repeat(400) }, // ~100 tokens
      { role: 'user' as const, content: 'b'.repeat(400) },
      { role: 'user' as const, content: 'c'.repeat(400) }
    ]
    // Budget for ~150 tokens — only one fits
    const result = trimToTokenBudget(msgs, 150)
    expect(result.length).toBe(1)
    expect(result[0].content[0]).toBe('c')
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

## Task 9.4: Tests

```bash
npm run test:run
```

## Task 9.5: Build

```bash
npm run build
```

## Task 9.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

**This requires a working API key for Anthropic, OpenAI, or Google.**

- [ ] Open or create a session
- [ ] In the bottom-right brain mode selector, pick a mode whose model you have a key for
- [ ] Type "Hello, please respond in one short sentence." → press Enter
- [ ] User message appears immediately
- [ ] Empty assistant placeholder appears below
- [ ] Within 1-3 seconds, text starts streaming token-by-token into the placeholder
- [ ] During streaming, status bar circle pulses
- [ ] During streaming, send button becomes a Stop button
- [ ] When complete, token counts and cost appear at the bottom of the message
- [ ] Status bar shows updated agent count = 0 (this stays 0 until Ch 16) but tokens and cost increment

**Cancel test:**

- [ ] Send a longer prompt: "Write a 500-word story about an astronaut"
- [ ] After ~2 seconds of streaming, click the Stop button
- [ ] Stream halts immediately. Whatever was generated stays visible
- [ ] Send button returns

**Cancel via Escape:**

- [ ] Send another long prompt
- [ ] Press Escape mid-stream → cancels

**Retry test:**

- [ ] Hover the assistant message → "Regenerate" appears in footer actions
- [ ] Click Regenerate → message clears and re-streams a new response

**Error test:**

- [ ] Open Settings → API Keys → delete your Anthropic/OpenAI key (whichever is currently selected)
- [ ] Try to send a message → toast appears: "Could not start generation" with "Retry" button
- [ ] Click Retry → fails again with same toast
- [ ] Re-add the key → Retry → succeeds

**Conversation history test:**

- [ ] Send: "My favorite color is blue"
- [ ] Wait for response
- [ ] Send: "What did I just say my favorite color was?"
- [ ] Response references "blue" — proves history was sent

**Brain mode model test:**

- [ ] Switch brain mode to "Fast" (gemini-flash by default)
- [ ] Send a message → uses gemini-flash
- [ ] Verify in Settings → Brain Modes that Fast's model appears in the metadata

---

# 📦 SECTION 10: Git Commit

```bash
git add .
git commit -m "feat: end-to-end streaming chat with cancel and retry (Chapter 15)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: ChatController exists

```bash
ls src/renderer/src/hooks/useChatController.ts
```

## ✅ Check 2: Toast store exists

```bash
ls src/renderer/src/stores/toastStore.ts src/renderer/src/components/Layout/AppToasts.tsx
```

## ✅ Check 3: Conversation builder exists

```bash
ls src/renderer/src/lib/conversationBuilder.ts
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

## ✅ Check 8: End-to-end stream works (user confirmed)

## ✅ Check 9: Cancel + Retry work (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline | head -3
```

---

# 📊 Chapter 15 Completion Report

```
✅ Chapter 15: Streaming & Real-Time Updates - COMPLETE

Acceptance Criteria Met:
✅ ChatController orchestrates send → stream → persist
✅ Token-by-token rendering
✅ Cancellation mid-stream (button, Escape key)
✅ Retry/regenerate failed and completed messages
✅ Conversation history sent to LLM
✅ Token + cost tracked per message
✅ System prompts from brain mode
✅ Toast notifications for errors
✅ One-click retry from error toast
✅ Tests passing
✅ Build works

Ready for Chapter 16: Agent System Foundation.
```

---

# 🚨 Troubleshooting

## "Streaming text doesn't appear"

- Open DevTools → Network → no requests visible because IPC is internal. Check the main process console (the terminal running `npm run dev`) for LLM service errors.
- Verify `IPC_EVENTS.LLM_STREAM_DELTA` is being broadcast — add a console.log in `llmHandlers.ts` `onDelta`.

## "Retry button does nothing"

- The retry only fires when not currently streaming. If `isStreaming` is stuck `true`, the cancel logic didn't clean up.
- Check `useSessionStore.getState().isStreaming` in DevTools — it should be `false` after a stream completes.

## "Conversation history not used (assistant doesn't remember)"

- Verify `buildLLMMessages` is being called with the actual messages array
- Check that the LLM call payload (in main process console) includes prior turns

## "Toast doesn't show retry button"

- The `action` prop only shows when provided. Confirm the `onError` handler is passing `action: { label: 'Retry', onClick: ... }`.

## "Cancel doesn't actually stop the stream"

- The AbortController in LLMService aborts the AI SDK stream
- If deltas keep arriving after cancel, the AI SDK version might have a known bug. Update with `npm install ai@latest`.

## "Empty placeholder remains after cancel"

- This is intentional: partial content is preserved. If you'd rather delete empty placeholders, modify `cancel()` in the controller to delete instead of update when content is empty.

---

**End of Chapter 15 Implementation Plan**
