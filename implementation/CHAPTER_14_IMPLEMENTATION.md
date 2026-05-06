# 📘 Chapter 14 Implementation Plan: Chat Interface — Composer & Input

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 14 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-13 must be complete with all verification checks passing.

---

## 🎯 Chapter 14 Goal

Build the chat **input composer** — the textarea + send button at the bottom of every chat tab. Supports auto-expanding height, slash commands, file attachments (drag/drop images and PDFs), keyboard shortcuts, and per-session draft persistence.

## 📋 What Will Exist When This Chapter Is Done

- Auto-expanding textarea (grows up to 200px, scrolls beyond)
- Send button that's disabled when input is empty or while streaming
- Enter to send, Shift+Enter for newline
- Slash command menu (`/clear`, `/model`, `/help`) with autocomplete
- Drag-and-drop file attachments with preview chips
- Image and PDF support (later chapters wire these into LLM calls)
- Per-session draft persistence (you can switch tabs without losing typed text)
- "Stop" hooks into the streaming machinery from Chapter 12
- Keyboard shortcut: Ctrl+L to focus the composer
- Character/token estimate counter

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

---

# 📦 SECTION 2: Composer Folder

## Task 2.1: Create Folder

```bash
mkdir -p src/renderer/src/components/Composer
```

---

# 📦 SECTION 3: Auto-Expanding Textarea

## Task 3.1: Create Auto-Resize Hook

**File path:** `src/renderer/src/hooks/useAutoResizeTextarea.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef } from 'react'

export function useAutoResizeTextarea(
  value: string,
  maxHeight = 200
): React.RefObject<HTMLTextAreaElement> {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${newHeight}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value, maxHeight])

  return ref
}
```

---

# 📦 SECTION 4: Slash Commands

## Task 4.1: Create Slash Commands Definition

**File path:** `src/renderer/src/components/Composer/slashCommands.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export interface SlashCommand {
  name: string
  description: string
  argsHint?: string
  handler: (args: string, ctx: SlashCommandContext) => void | Promise<void>
}

export interface SlashCommandContext {
  sessionId: string
  clearMessages: () => void | Promise<void>
  showHelp: () => void
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: 'clear',
    description: 'Clear all messages in this session',
    handler: (_args, ctx) => ctx.clearMessages()
  },
  {
    name: 'help',
    description: 'List available commands',
    handler: (_args, ctx) => ctx.showHelp()
  },
  {
    name: 'model',
    description: 'Change the current model',
    argsHint: '<model-id>',
    handler: () => {
      // Wired up in Chapter 18 (tool/agent integration). For now, no-op.
    }
  }
]

export function findCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase()
  return SLASH_COMMANDS.filter((c) => c.name.startsWith(q))
}

export function parseSlashInput(input: string): { name: string; args: string } | null {
  if (!input.startsWith('/')) return null
  const trimmed = input.slice(1).trimStart()
  const spaceIdx = trimmed.indexOf(' ')
  if (spaceIdx === -1) return { name: trimmed, args: '' }
  return { name: trimmed.slice(0, spaceIdx), args: trimmed.slice(spaceIdx + 1) }
}
```

## Task 4.2: Create Slash Command Menu

**File path:** `src/renderer/src/components/Composer/SlashCommandMenu.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef } from 'react'
import { Command } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { SlashCommand } from './slashCommands'

interface SlashCommandMenuProps {
  commands: SlashCommand[]
  selectedIndex: number
  onSelect: (cmd: SlashCommand) => void
  onHover: (index: number) => void
}

export default function SlashCommandMenu({
  commands,
  selectedIndex,
  onSelect,
  onHover
}: SlashCommandMenuProps): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sel = ref.current?.querySelector(`[data-idx="${selectedIndex}"]`)
    sel?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (commands.length === 0) return null

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 right-0 mb-1 max-h-60 overflow-y-auto rounded-md border border-border bg-bg-elevated shadow-lg"
    >
      {commands.map((cmd, i) => (
        <button
          key={cmd.name}
          data-idx={i}
          onMouseEnter={() => onHover(i)}
          onClick={() => onSelect(cmd)}
          className={cn(
            'w-full text-left flex items-center gap-2 px-3 py-2 transition-colors',
            i === selectedIndex && 'bg-bg-hover'
          )}
        >
          <Command size={12} className="text-text-tertiary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">/{cmd.name}</span>
              {cmd.argsHint && (
                <span className="text-xs text-text-tertiary font-mono">{cmd.argsHint}</span>
              )}
            </div>
            <div className="text-xs text-text-tertiary truncate">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
```

---

# 📦 SECTION 5: Attachment System

## Task 5.1: Create Attachment Types

**File path:** `src/renderer/src/components/Composer/attachmentTypes.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export type AttachmentKind = 'image' | 'pdf' | 'text' | 'unknown'

export interface ComposerAttachment {
  id: string
  kind: AttachmentKind
  name: string
  size: number
  mimeType: string
  // For images, a base64 data URL for inline preview.
  // For other types, undefined.
  preview?: string
  // The raw data URL for sending to the LLM.
  dataUrl: string
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const PDF_TYPES = ['application/pdf']
const TEXT_TYPES = ['text/plain', 'text/markdown', 'application/json']

export function detectKind(mimeType: string): AttachmentKind {
  if (IMAGE_TYPES.includes(mimeType)) return 'image'
  if (PDF_TYPES.includes(mimeType)) return 'pdf'
  if (TEXT_TYPES.includes(mimeType) || mimeType.startsWith('text/')) return 'text'
  return 'unknown'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function fileToAttachment(file: File): Promise<ComposerAttachment> {
  const kind = detectKind(file.type)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  return {
    id: generateAttachmentId(),
    kind,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    preview: kind === 'image' ? dataUrl : undefined,
    dataUrl
  }
}

export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024 // 20MB
export const MAX_ATTACHMENTS = 10
```

## Task 5.2: Create Attachment Chip

**File path:** `src/renderer/src/components/Composer/AttachmentChip.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { X, FileText, FileImage, File as FileIcon } from 'lucide-react'
import type { ComposerAttachment } from './attachmentTypes'
import { formatBytes } from './attachmentTypes'

interface AttachmentChipProps {
  attachment: ComposerAttachment
  onRemove: () => void
}

export default function AttachmentChip({
  attachment,
  onRemove
}: AttachmentChipProps): JSX.Element {
  const Icon =
    attachment.kind === 'image'
      ? FileImage
      : attachment.kind === 'pdf' || attachment.kind === 'text'
        ? FileText
        : FileIcon

  return (
    <div className="group inline-flex items-center gap-2 max-w-[200px] rounded-md border border-border bg-bg-elevated pl-1 pr-1 py-1">
      {attachment.preview ? (
        <img
          src={attachment.preview}
          alt=""
          className="w-8 h-8 rounded object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded bg-bg-deep flex items-center justify-center shrink-0">
          <Icon size={14} className="text-text-tertiary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{attachment.name}</div>
        <div className="text-[10px] text-text-tertiary">{formatBytes(attachment.size)}</div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-1 text-text-tertiary hover:text-text-primary rounded"
        aria-label="Remove attachment"
      >
        <X size={12} />
      </button>
    </div>
  )
}
```

---

# 📦 SECTION 6: Token Estimate

## Task 6.1: Create Token Estimator

**File path:** `src/renderer/src/lib/tokenEstimate.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Quick rough token estimator. Real tokenizer would require importing
 * the actual tokenizer for each model, which is heavy. This approximation
 * uses ~4 characters per token, which is accurate within ~15% for English.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  // Account for whitespace separating tokens, code being slightly denser, etc.
  return Math.ceil(text.length / 4)
}
```

---

# 📦 SECTION 7: Composer Component

## Task 7.1: Create Composer

**File path:** `src/renderer/src/components/Composer/Composer.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Paperclip, Square, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { useSessionStore } from '../../stores'
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea'
import { messageService } from '../../services'
import { estimateTokens } from '../../lib/tokenEstimate'
import {
  fileToAttachment,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  type ComposerAttachment
} from './attachmentTypes'
import AttachmentChip from './AttachmentChip'
import SlashCommandMenu from './SlashCommandMenu'
import {
  findCommands,
  parseSlashInput,
  SLASH_COMMANDS,
  type SlashCommand
} from './slashCommands'

interface ComposerProps {
  sessionId: string
}

export default function Composer({ sessionId }: ComposerProps): JSX.Element {
  const draft = useSessionStore((s) => s.draftBySession[sessionId] ?? '')
  const setDraft = useSessionStore((s) => s.setDraft)
  const clearDraft = useSessionStore((s) => s.clearDraft)
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const setMessages = useSessionStore((s) => s.setMessages)
  const messagesBySession = useSessionStore((s) => s.messagesBySession)
  const appendMessage = useSessionStore((s) => s.appendMessage)
  const setStreaming = useSessionStore((s) => s.setStreaming)

  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashSelected, setSlashSelected] = useState(0)

  const textareaRef = useAutoResizeTextarea(draft)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const slashQuery = draft.startsWith('/') ? draft.slice(1).split(' ')[0] : ''
  const slashMatches = showSlashMenu ? findCommands(slashQuery) : []

  // Open slash menu when input starts with /
  useEffect(() => {
    if (draft.startsWith('/') && !draft.includes(' ')) {
      setShowSlashMenu(true)
      setSlashSelected(0)
    } else {
      setShowSlashMenu(false)
    }
  }, [draft])

  // Focus textarea on Ctrl+L
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase()
        // Only steal focus if not already in an input
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault()
          textareaRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [textareaRef])

  const handleClearMessages = async (): Promise<void> => {
    if (!confirm('Clear all messages in this session?')) return
    const messages = messagesBySession[sessionId] ?? []
    for (const m of messages) {
      try {
        await messageService.delete(m.id)
      } catch {
        // continue
      }
    }
    setMessages(sessionId, [])
  }

  const handleShowHelp = (): void => {
    const helpText = SLASH_COMMANDS.map((c) => `/${c.name} — ${c.description}`).join('\n')
    alert(`Available commands:\n\n${helpText}`)
  }

  const handleSlashSelect = useCallback(
    (cmd: SlashCommand): void => {
      // Insert cmd name and a space, then close menu
      setDraft(sessionId, `/${cmd.name} `)
      setShowSlashMenu(false)
      textareaRef.current?.focus()
    },
    [sessionId, setDraft, textareaRef]
  )

  const handleSend = async (): Promise<void> => {
    const trimmed = draft.trim()
    if (!trimmed || isStreaming) return

    setError(null)

    // Slash command intercept
    const parsed = parseSlashInput(trimmed)
    if (parsed) {
      const cmd = SLASH_COMMANDS.find((c) => c.name === parsed.name)
      if (cmd) {
        clearDraft(sessionId)
        await cmd.handler(parsed.args, {
          sessionId,
          clearMessages: handleClearMessages,
          showHelp: handleShowHelp
        })
        return
      }
      setError(`Unknown command: /${parsed.name}`)
      return
    }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (showSlashMenu && slashMatches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSlashSelected((i) => (i + 1) % slashMatches.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSlashSelected((i) => (i - 1 + slashMatches.length) % slashMatches.length)
        return
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        handleSlashSelect(slashMatches[slashSelected])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowSlashMenu(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files) return
    setError(null)
    const remaining = MAX_ATTACHMENTS - attachments.length
    const arr = Array.from(files).slice(0, remaining)
    const next: ComposerAttachment[] = []
    for (const file of arr) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setError(`${file.name} exceeds the 20MB limit`)
        continue
      }
      try {
        next.push(await fileToAttachment(file))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to read file')
      }
    }
    setAttachments((prev) => [...prev, ...next])
  }

  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current <= 0) setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const tokenEstimate = estimateTokens(draft)
  const canSend = draft.trim().length > 0 && !isStreaming

  return (
    <div
      className={cn(
        'border-t border-border-subtle bg-bg-deep p-3 relative',
        isDragging && 'bg-accent/10 border-accent'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-md border-2 border-dashed border-accent">
          <p className="text-sm font-medium text-accent">Drop files here</p>
        </div>
      )}

      {error && (
        <div className="mb-2 flex items-start gap-2 px-2 py-1.5 rounded text-xs text-status-error bg-status-error/10 border border-status-error/30">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-status-error hover:opacity-80 shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <AttachmentChip
              key={att.id}
              attachment={att}
              onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
            />
          ))}
        </div>
      )}

      <div className="relative">
        <SlashCommandMenu
          commands={slashMatches}
          selectedIndex={slashSelected}
          onSelect={handleSlashSelect}
          onHover={setSlashSelected}
        />

        <div className="flex items-end gap-2 rounded-md border border-border bg-bg-deepest focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-shadow">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= MAX_ATTACHMENTS}
            className="p-2 text-text-tertiary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Attach files"
            title="Attach files"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/*,.md,.json"
            className="hidden"
            onChange={(e) => {
              handleFileSelect(e.target.files)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          />

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(sessionId, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline, / for commands)"
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none py-2 text-base placeholder:text-text-tertiary leading-relaxed"
            style={{ minHeight: '36px', maxHeight: '200px' }}
          />

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
          ) : (
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="icon"
              className="m-1"
              aria-label="Send"
            >
              <Send size={14} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        <p className="text-[10px] text-text-tertiary">
          Drag and drop files, or click 📎 to attach.
        </p>
        {tokenEstimate > 0 && (
          <p className="text-[10px] text-text-tertiary font-mono">
            ~{tokenEstimate} tokens
          </p>
        )}
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 8: Wire Composer Into Chat Tab

## Task 8.1: Update Chat Tab Content

**File path:** `src/renderer/src/components/Tabs/contents/ChatTabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect } from 'react'
import { useSessionStore } from '../../../stores'
import ChatToolbar from '../../Toolbar/ChatToolbar'
import MessageList from '../../Chat/MessageList'
import Composer from '../../Composer/Composer'

interface ChatTabContentProps {
  sessionId?: string
}

export default function ChatTabContent({ sessionId }: ChatTabContentProps): JSX.Element {
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  useEffect(() => {
    if (sessionId) setActiveSession(sessionId)
  }, [sessionId, setActiveSession])

  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <ChatToolbar />
        <div className="flex-1 flex items-center justify-center text-text-tertiary">
          No session associated with this tab.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatToolbar />
      <MessageList sessionId={sessionId} />
      <Composer sessionId={sessionId} />
    </div>
  )
}
```

---

# 📦 SECTION 9: Tests

## Task 9.1: Create Slash Command Tests

**File path:** `tests/unit/slashCommands.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import {
  findCommands,
  parseSlashInput
} from '../../src/renderer/src/components/Composer/slashCommands'

describe('findCommands', () => {
  it('returns all commands for empty query', () => {
    expect(findCommands('').length).toBeGreaterThanOrEqual(3)
  })

  it('filters by prefix', () => {
    const result = findCommands('cl')
    expect(result.some((c) => c.name === 'clear')).toBe(true)
    expect(result.every((c) => c.name.startsWith('cl'))).toBe(true)
  })

  it('returns empty for unknown prefix', () => {
    expect(findCommands('xyz')).toEqual([])
  })
})

describe('parseSlashInput', () => {
  it('returns null for non-slash inputs', () => {
    expect(parseSlashInput('hello')).toBeNull()
  })

  it('parses command with no args', () => {
    expect(parseSlashInput('/clear')).toEqual({ name: 'clear', args: '' })
  })

  it('parses command with args', () => {
    expect(parseSlashInput('/model gpt-4o')).toEqual({ name: 'model', args: 'gpt-4o' })
  })

  it('handles extra spaces', () => {
    expect(parseSlashInput('/  clear')).toEqual({ name: '', args: ' clear' })
  })
})
```

## Task 9.2: Create Token Estimate Tests

**File path:** `tests/unit/tokenEstimate.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import { estimateTokens } from '../../src/renderer/src/lib/tokenEstimate'

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('approximates ~4 chars per token', () => {
    // 100 chars → ~25 tokens
    expect(estimateTokens('a'.repeat(100))).toBe(25)
  })

  it('handles short text', () => {
    expect(estimateTokens('Hello world')).toBe(3)
  })
})
```

---

# 📦 SECTION 10: Verification

## Task 10.1: Type Check

```bash
npm run typecheck
```

## Task 10.2: Lint

```bash
npm run lint
```

## Task 10.3: Format

```bash
npm run format
```

## Task 10.4: Tests

```bash
npm run test:run
```

## Task 10.5: Build

```bash
npm run build
```

## Task 10.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Open a chat tab → composer appears at bottom with paperclip + textarea + send button
- [ ] Send button is disabled when textarea is empty
- [ ] Type "Hello" → send button enables
- [ ] Press Enter → message sends, appears in message list as user message
- [ ] Type a multi-line message using Shift+Enter → newlines preserved
- [ ] Type a long message → textarea auto-grows up to ~200px then scrolls
- [ ] Type "/" → slash menu appears with `/clear`, `/help`, `/model`
- [ ] Type "/cl" → menu filters to just "/clear"
- [ ] Press ArrowDown / ArrowUp → selection moves
- [ ] Press Tab → selected command inserted with trailing space
- [ ] Press Escape → menu closes
- [ ] Type "/help" + Enter → alert with command list
- [ ] Type "/clear" + Enter → confirms then clears messages
- [ ] Click paperclip → file dialog opens
- [ ] Select an image → chip appears with image preview
- [ ] Drag a file from desktop onto composer → border highlights, drop adds chip
- [ ] Click X on chip → attachment removed
- [ ] Try to attach >10 files → only first 10 added
- [ ] Try to attach a file >20MB → error message shows
- [ ] Switch to a different tab and back → typed draft preserved per session
- [ ] Press **Ctrl+L** → composer textarea focuses
- [ ] Token estimate shows next to placeholder hint as you type
- [ ] During simulated streaming (after sending), Send button becomes a Stop button
- [ ] No console errors

---

# 📦 SECTION 11: Git Commit

```bash
git add .
git commit -m "feat: chat composer with slash commands and attachments (Chapter 14)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Composer files exist

```bash
ls src/renderer/src/components/Composer/Composer.tsx src/renderer/src/components/Composer/AttachmentChip.tsx src/renderer/src/components/Composer/SlashCommandMenu.tsx src/renderer/src/components/Composer/slashCommands.ts src/renderer/src/components/Composer/attachmentTypes.ts
```

## ✅ Check 2: Helper files exist

```bash
ls src/renderer/src/hooks/useAutoResizeTextarea.ts src/renderer/src/lib/tokenEstimate.ts
```

## ✅ Check 3: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 4: Tests pass

```bash
npm run test:run
```

## ✅ Check 5: Build works

```bash
npm run build
```

## ✅ Check 6-9: User confirmed all visual checks

## ✅ Check 10: Git commit

```bash
git log --oneline | head -3
```

---

# 📊 Chapter 14 Completion Report

```
✅ Chapter 14: Composer & Input - COMPLETE

Acceptance Criteria Met:
✅ Auto-expanding textarea
✅ Send/Stop button toggling on streaming
✅ Slash command menu with keyboard nav
✅ File attachments via click and drag-drop
✅ Image preview thumbnails
✅ Per-session draft persistence
✅ Token estimate counter
✅ Ctrl+L focuses composer
✅ Size limits enforced (20MB / 10 files)
✅ Tests passing
✅ Build works

Ready for Chapter 15: Streaming & Real-Time Updates.
```

---

# 🚨 Troubleshooting

## Drafts don't persist across tabs

- Verify `useSessionStore.draftBySession` is being read with the correct sessionId
- Check that the session store is the same instance across tabs (it's a singleton)

## Slash menu doesn't appear

- The trigger is: input starts with `/` AND has no space yet
- Check `slashQuery` derivation in Composer.tsx

## Attachment preview doesn't show for images

- Check that `kind === 'image'` is set correctly in `detectKind`
- Verify base64 data URL is being generated (open DevTools → Network → none, check Memory)

## Drag-and-drop doesn't trigger

- The `dragCounter` ref handles nested elements. If DnD doesn't trigger, check that `e.preventDefault()` is called in all four handlers

## Auto-resize textarea jumps

- Ensure `useAutoResizeTextarea` runs on every value change
- Check that line-height is consistent

---

**End of Chapter 14 Implementation Plan**
