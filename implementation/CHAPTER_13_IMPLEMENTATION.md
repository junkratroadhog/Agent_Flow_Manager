# 📘 Chapter 13 Implementation Plan: Chat Interface — Message Rendering

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 13 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-12 must be complete with all verification checks passing.

---

## 🎯 Chapter 13 Goal

Build the chat **message renderer** — a document-style continuous flow (NOT bubbles). User and assistant messages each have distinct styling. Markdown is rendered with syntax-highlighted code blocks, copy buttons, and proper styling. Messages auto-scroll on new content.

## 📋 What Will Exist When This Chapter Is Done

- Markdown rendering via `react-markdown` with GFM (tables, task lists, strikethrough)
- Syntax-highlighted code blocks via `shiki` or `react-syntax-highlighter`
- Copy button on every code block
- Distinct user vs assistant message styling (no chat bubbles — document flow)
- Role indicator (user avatar / "Claude" / model name)
- Per-message metadata: timestamp, token count, cost, model
- Auto-scroll to bottom on new messages (with "scroll to bottom" button when scrolled up)
- Empty state when no messages
- Loading skeleton while messages fetch
- Hover actions per message: copy text, regenerate (placeholder), delete
- Real messages loaded from DB via Chapter 6 services

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

---

# 📦 SECTION 2: Install Dependencies

## Task 2.1: Install Markdown & Syntax Highlighting

**Command:**

```bash
npm install react-markdown remark-gfm rehype-raw react-syntax-highlighter
```

## Task 2.2: Install Type Definitions

**Command:**

```bash
npm install -D @types/react-syntax-highlighter
```

## Task 2.3: Verify Installs

**Command:**

```bash
npm list react-markdown remark-gfm react-syntax-highlighter
```

**Expected:** All packages listed.

---

# 📦 SECTION 3: Markdown Renderer

## Task 3.1: Create Folder

**Command:**

```bash
mkdir -p src/renderer/src/components/Chat
```

## Task 3.2: Create Code Block Component

**File path:** `src/renderer/src/components/Chat/CodeBlock.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CodeBlockProps {
  language?: string
  value: string
  className?: string
}

export default function CodeBlock({ language, value, className }: CodeBlockProps): JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'relative my-3 rounded-md border border-border bg-bg-deepest overflow-hidden group',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle bg-bg-deep">
        <span className="text-xs text-text-tertiary font-mono">{language || 'plaintext'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '0.75rem 1rem',
          background: 'transparent',
          fontSize: '12.5px',
          lineHeight: '1.5'
        }}
        codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace' } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
```

## Task 3.3: Create Markdown Renderer

**File path:** `src/renderer/src/components/Chat/MarkdownRenderer.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import CodeBlock from './CodeBlock'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({
  content,
  className
}: MarkdownRendererProps): JSX.Element {
  return (
    <div className={cn('markdown-content text-base leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="text-xl font-semibold mt-4 mb-2" {...props} />,
          h2: (props) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          h3: (props) => <h3 className="text-md font-semibold mt-3 mb-1.5" {...props} />,
          h4: (props) => <h4 className="text-base font-semibold mt-2 mb-1" {...props} />,
          p: (props) => <p className="my-2" {...props} />,
          ul: (props) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
          li: (props) => <li {...props} />,
          a: (props) => (
            <a
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-border pl-3 my-2 italic text-text-secondary"
              {...props}
            />
          ),
          hr: () => <hr className="my-4 border-border-subtle" />,
          table: (props) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-border bg-bg-elevated px-2 py-1.5 text-left text-xs font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-border px-2 py-1.5 text-sm" {...props} />
          ),
          code: ({ className, children, node, ...props }) => {
            const isInline = !className
            const match = /language-(\w+)/.exec(className || '')
            const value = String(children).replace(/\n$/, '')
            if (isInline) {
              return (
                <code
                  className="rounded px-1 py-0.5 bg-bg-elevated text-accent font-mono text-[12.5px]"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <CodeBlock language={match?.[1]} value={value} />
          },
          pre: ({ children }) => <>{children}</>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

---

# 📦 SECTION 4: Message Header

## Task 4.1: Create Message Header

**File path:** `src/renderer/src/components/Chat/MessageHeader.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { User, Sparkles, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getModelInfo } from '../../lib/models'
import type { Message } from '@shared/db-types'

interface MessageHeaderProps {
  message: Message
}

export default function MessageHeader({ message }: MessageHeaderProps): JSX.Element {
  const role = message.role
  const Icon = role === 'user' ? User : role === 'tool' ? Wrench : Sparkles
  const modelInfo = message.model ? getModelInfo(message.model) : null

  let displayName = 'Assistant'
  if (role === 'user') displayName = 'You'
  else if (role === 'system') displayName = 'System'
  else if (role === 'tool') displayName = 'Tool'
  else if (modelInfo) displayName = modelInfo.label

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full shrink-0',
          role === 'user' && 'bg-bg-elevated',
          role === 'assistant' && 'bg-accent/20 text-accent',
          role === 'system' && 'bg-bg-elevated text-text-tertiary',
          role === 'tool' && 'bg-status-warning/20 text-status-warning'
        )}
      >
        <Icon size={12} />
      </div>
      <span className="text-sm font-semibold">{displayName}</span>
      <span className="text-xs text-text-tertiary">{time}</span>
    </div>
  )
}
```

---

# 📦 SECTION 5: Message Footer (Metadata + Actions)

## Task 5.1: Create Message Footer

**File path:** `src/renderer/src/components/Chat/MessageFooter.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import { Copy, Check, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatTokens, formatCost } from '../../lib/formatters'
import type { Message } from '@shared/db-types'

interface MessageFooterProps {
  message: Message
  onDelete?: () => void
  onRegenerate?: () => void
}

export default function MessageFooter({
  message,
  onDelete,
  onRegenerate
}: MessageFooterProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const tokens = message.tokens_in + message.tokens_out
  const showStats = tokens > 0 || message.cost > 0

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 hover:text-text-primary transition-colors"
      >
        {copied ? (
          <>
            <Check size={12} /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy
          </>
        )}
      </button>
      {message.role === 'assistant' && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <RefreshCw size={12} /> Regenerate
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className={cn('flex items-center gap-1 hover:text-status-error transition-colors')}
        >
          <Trash2 size={12} /> Delete
        </button>
      )}
      <div className="flex-1" />
      {showStats && (
        <div className="flex items-center gap-3 font-mono">
          {message.tokens_in > 0 && <span>{formatTokens(message.tokens_in)} in</span>}
          {message.tokens_out > 0 && <span>{formatTokens(message.tokens_out)} out</span>}
          {message.cost > 0 && <span>{formatCost(message.cost)}</span>}
        </div>
      )}
    </div>
  )
}
```

---

# 📦 SECTION 6: Single Message Component

## Task 6.1: Create Message Component

**File path:** `src/renderer/src/components/Chat/Message.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { cn } from '../../lib/utils'
import type { Message as DbMessage } from '@shared/db-types'
import MessageHeader from './MessageHeader'
import MessageFooter from './MessageFooter'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageProps {
  message: DbMessage
  onDelete?: () => void
  onRegenerate?: () => void
  isStreaming?: boolean
}

export default function Message({
  message,
  onDelete,
  onRegenerate,
  isStreaming
}: MessageProps): JSX.Element {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div
      className={cn(
        'group py-4 px-6 border-b border-border-subtle/50 transition-colors',
        isUser && 'bg-transparent',
        !isUser && !isSystem && 'bg-bg-deep/40',
        isSystem && 'bg-bg-elevated/40 border-dashed'
      )}
    >
      <div className="max-w-3xl mx-auto">
        <MessageHeader message={message} />
        <div className="ml-8">
          {isUser ? (
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {message.content}
            </div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
              )}
            </>
          )}
          <MessageFooter
            message={message}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
          />
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 7: Empty State for Chat

## Task 7.1: Create Empty State

**File path:** `src/renderer/src/components/Chat/ChatEmptyState.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Sparkles } from 'lucide-react'

interface ChatEmptyStateProps {
  sessionTitle?: string
}

export default function ChatEmptyState({ sessionTitle }: ChatEmptyStateProps): JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/15 mb-4">
          <Sparkles size={24} className="text-accent" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {sessionTitle ? `Ready to start: ${sessionTitle}` : 'Start a conversation'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Ask a question, paste code for review, or describe a task. The agent will spawn
          sub-agents as needed.
        </p>
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="rounded-md border border-border bg-bg-deep p-3">
            <p className="text-xs font-medium mb-1">💬 Quick chat</p>
            <p className="text-[10px] text-text-tertiary">
              Single-shot questions and answers.
            </p>
          </div>
          <div className="rounded-md border border-border bg-bg-deep p-3">
            <p className="text-xs font-medium mb-1">🛠 Build something</p>
            <p className="text-[10px] text-text-tertiary">
              Multi-step tasks with tool use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 8: Scroll-to-Bottom Hook

## Task 8.1: Create Auto-Scroll Hook

**File path:** `src/renderer/src/hooks/useAutoScroll.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef, useState } from 'react'

export interface AutoScrollResult {
  containerRef: React.RefObject<HTMLDivElement>
  isAtBottom: boolean
  scrollToBottom: (behavior?: 'auto' | 'smooth') => void
}

/**
 * Tracks scroll position and provides imperative scrollToBottom.
 * Auto-scrolls only if the user was already at (or near) the bottom.
 */
export function useAutoScroll(deps: unknown[]): AutoScrollResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth'): void => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = (): void => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setIsAtBottom(distanceFromBottom < 100)
    }
    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll on new content if at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('auto')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { containerRef, isAtBottom, scrollToBottom }
}
```

---

# 📦 SECTION 9: Message List Container

## Task 9.1: Create Message List

**File path:** `src/renderer/src/components/Chat/MessageList.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { ArrowDown } from 'lucide-react'
import { useSessionStore } from '../../stores'
import { messageService } from '../../services'
import { useAutoScroll } from '../../hooks/useAutoScroll'
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
  const isStreaming = useSessionStore((s) => s.isStreaming)

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
    setMessages(
      sessionId,
      messages.filter((m) => m.id !== id)
    )
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

# 📦 SECTION 10: Update Chat Tab Content

## Task 10.1: Wire Message List Into Chat Tab

**File path:** `src/renderer/src/components/Tabs/contents/ChatTabContent.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect } from 'react'
import { useSessionStore } from '../../../stores'
import ChatToolbar from '../../Toolbar/ChatToolbar'
import MessageList from '../../Chat/MessageList'

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
    </div>
  )
}
```

---

# 📦 SECTION 11: Demo: Inject Sample Messages

To test rendering without a working composer (Chapter 14), add a demo button.

## Task 11.1: Add Demo Messages Helper

**File path:** `src/renderer/src/components/Sidebar/DemoMessagesButton.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Sparkles } from 'lucide-react'
import { useSessionStore } from '../../stores'
import { messageService } from '../../services'
import { Button } from '../ui/Button'

const SAMPLE_MARKDOWN = `Here is a sample assistant reply with **markdown**.

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
\`\`\`

### Features Demo

- **Lists** with bullets
- **Tables**:

| Feature | Status |
|---------|--------|
| Streaming | ✅ |
| Tool use | 🚧 |

### Inline code: \`const x = 42\`

> Blockquote example with *italic* and **bold**.

[Link to docs](https://example.com)
`

export default function DemoMessagesButton(): JSX.Element | null {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const messagesBySession = useSessionStore((s) => s.messagesBySession)
  const appendMessage = useSessionStore((s) => s.appendMessage)

  if (!activeSessionId) return null

  const handleAdd = async (): Promise<void> => {
    const sessionId = activeSessionId
    try {
      const userMsg = await messageService.create({
        session_id: sessionId,
        role: 'user',
        content: 'Show me a sample of all your formatting capabilities.'
      })
      appendMessage(sessionId, userMsg)

      const assistantMsg = await messageService.create({
        session_id: sessionId,
        role: 'assistant',
        content: SAMPLE_MARKDOWN,
        model: 'claude-opus',
        tokens_in: 12,
        tokens_out: 156,
        cost: 0.0021
      })
      appendMessage(sessionId, assistantMsg)
    } catch (e) {
      console.error('Demo message failed:', e)
    }
  }

  if ((messagesBySession[activeSessionId] ?? []).length > 0) return null

  return (
    <div className="px-3 pt-2 pb-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        className="w-full justify-start text-text-tertiary"
      >
        <Sparkles size={12} />
        Demo: Add sample messages
      </Button>
    </div>
  )
}
```

## Task 11.2: Add to Sessions Panel

**File path:** `src/renderer/src/components/Sidebar/SessionsPanel.tsx`

**Action:** Find the line that imports `DemoStatsButton`:

```typescript
import DemoStatsButton from './DemoStatsButton'
```

Replace with:

```typescript
import DemoStatsButton from './DemoStatsButton'
import DemoMessagesButton from './DemoMessagesButton'
```

Then find this line in the JSX:

```typescript
        <DemoStatsButton />
```

Replace with:

```typescript
        <DemoStatsButton />
        <DemoMessagesButton />
```

---

# 📦 SECTION 12: Tests

## Task 12.1: Create Markdown Renderer Test

**File path:** `tests/unit/markdown.test.tsx`

**Action:** Create NEW file.

**Exact content:**

````typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownRenderer from '../../src/renderer/src/components/Chat/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders headings', () => {
    render(<MarkdownRenderer content="# Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Try `const x = 1`" />)
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('renders lists', () => {
    render(<MarkdownRenderer content="- one\n- two" />)
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('renders code blocks with language label', () => {
    const { container } = render(
      <MarkdownRenderer content={'```ts\nconst x = 1\n```'} />
    )
    expect(container.textContent).toContain('ts')
    expect(container.textContent).toContain('const x = 1')
  })

  it('renders tables', () => {
    render(
      <MarkdownRenderer content={'| A | B |\n|---|---|\n| 1 | 2 |'} />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
````

---

# 📦 SECTION 13: Verification

## Task 13.1: Type Check

```bash
npm run typecheck
```

## Task 13.2: Lint

```bash
npm run lint
```

## Task 13.3: Format

```bash
npm run format
```

## Task 13.4: Tests

```bash
npm run test:run
```

## Task 13.5: Build

```bash
npm run build
```

## Task 13.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Open or create a project, then a session
- [ ] Chat tab opens with empty state showing "Ready to start: ..."
- [ ] In Sessions panel, click "Demo: Add sample messages"
- [ ] User message appears with "You" label and timestamp
- [ ] Assistant message appears below with model name and timestamp
- [ ] Markdown renders correctly:
  - [ ] H2 heading "Code Example" is bold and large
  - [ ] Code block has black background, syntax-highlighted TypeScript
  - [ ] Code block has language label "typescript" at top
  - [ ] "Copy" button visible on code block
  - [ ] Click "Copy" → button changes to "Copied" for 2 seconds
  - [ ] Bullet list renders with proper indentation
  - [ ] Table renders with borders
  - [ ] Inline code (`const x = 42`) is highlighted
  - [ ] Blockquote has left border
  - [ ] Link is clickable (opens in browser)
- [ ] Hover any message → action buttons fade in (Copy, Delete, etc.)
- [ ] Token counts and cost displayed at bottom-right of assistant message
- [ ] Click Copy on a message → text copied to clipboard
- [ ] Click Delete → message removed (with confirm)
- [ ] Add many messages (click demo multiple times)
- [ ] Scroll up → "scroll to bottom" floating button appears
- [ ] Click it → smooth scroll to bottom
- [ ] Add another message while scrolled to bottom → auto-scrolls
- [ ] Add message while scrolled up → does NOT auto-scroll
- [ ] Visual difference between user (transparent bg) and assistant (subtle bg)

---

# 📦 SECTION 14: Git Commit

```bash
git add .
git commit -m "feat: chat message rendering with markdown and code blocks (Chapter 13)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Chat components exist

```bash
ls src/renderer/src/components/Chat/Message.tsx src/renderer/src/components/Chat/MessageList.tsx src/renderer/src/components/Chat/MessageHeader.tsx src/renderer/src/components/Chat/MessageFooter.tsx src/renderer/src/components/Chat/MarkdownRenderer.tsx src/renderer/src/components/Chat/CodeBlock.tsx src/renderer/src/components/Chat/ChatEmptyState.tsx
```

## ✅ Check 2: Hook exists

```bash
ls src/renderer/src/hooks/useAutoScroll.ts
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

## ✅ Check 6: Markdown renders correctly (user confirmed)

## ✅ Check 7: Code blocks have copy & syntax highlighting (user confirmed)

## ✅ Check 8: Auto-scroll works (user confirmed)

## ✅ Check 9: Per-message actions work (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 13 Completion Report

```
✅ Chapter 13: Chat Interface — Message Rendering - COMPLETE

Acceptance Criteria Met:
✅ Markdown renderer with GFM (tables, lists, code blocks)
✅ Syntax-highlighted code blocks via Prism
✅ Copy button on code blocks
✅ Per-message header with role icon, name, timestamp
✅ Per-message footer with copy/regenerate/delete actions
✅ Token count and cost displayed
✅ Document-style flow (no bubbles)
✅ Auto-scroll behavior with manual override
✅ Empty state with helpful prompts
✅ Loading skeleton
✅ Tests passing
✅ Build works

Ready to proceed to Chapter 14: Chat Interface — Composer & Input.
```

---

# 🚨 Troubleshooting

## Code blocks render without highlighting

- Check `react-syntax-highlighter` is installed
- Verify `vscDarkPlus` style is imported correctly

## Markdown text appears literal (asterisks visible)

- Verify `react-markdown` is processing the content prop
- Check no `<pre>` wrapping is escaping it

## Auto-scroll fights with user scrolling

- The `useAutoScroll` hook only auto-scrolls when within 100px of bottom
- Increase the threshold if needed

## Copy button does nothing

- `navigator.clipboard` requires HTTPS or localhost. Should work in Electron's `file://` context but if not, fall back to manual selection

## Tables overflow horizontally

- Wrapper has `overflow-x-auto` — this is intentional for narrow screens

---

**End of Chapter 13 Implementation Plan**
