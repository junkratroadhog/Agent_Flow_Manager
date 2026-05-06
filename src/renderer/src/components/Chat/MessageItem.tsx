import { Message } from '@shared/db-types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { clsx } from 'clsx'
import { User, Bot, Copy, Edit2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'

interface MessageItemProps {
  message: Message
  isLast?: boolean
  isStreaming?: boolean
}

export default function MessageItem({ message, isStreaming }: MessageItemProps): JSX.Element {
  const isUser = message.role === 'user'
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={clsx(
        'group relative flex gap-4 px-4 py-6 transition-colors',
        isUser ? 'bg-bg-deepest/30' : 'bg-transparent'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center border',
            isUser
              ? 'bg-accent/10 border-accent/20 text-accent'
              : 'bg-bg-surface border-border-subtle text-text-secondary'
          )}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            {isUser ? 'You' : message.model || 'Assistant'}
          </span>
          <span className="text-[10px] text-text-quaternary font-mono">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-bg-deepest prose-pre:border prose-pre:border-border-subtle">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md !bg-bg-deepest !my-0"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content + (isStreaming ? ' \u2588' : '')}
          </ReactMarkdown>
        </div>

        {/* Message Metadata & Actions */}
        {!isUser && !isStreaming && (
          <div
            className={clsx(
              'flex items-center gap-3 pt-2 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-primary transition-colors">
                <ThumbsUp size={14} />
              </button>
              <button className="p-1.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-primary transition-colors">
                <ThumbsDown size={14} />
              </button>
            </div>
            <div className="w-[1px] h-3 bg-border-subtle" />
            <button className="flex items-center gap-1 p-1.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-primary transition-colors text-[11px]">
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button className="flex items-center gap-1 p-1.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-primary transition-colors text-[11px]">
              <RotateCcw size={14} />
              <span>Regenerate</span>
            </button>
          </div>
        )}

        {isUser && !isStreaming && (
          <div
            className={clsx(
              'flex items-center gap-3 pt-2 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button className="flex items-center gap-1 p-1.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-primary transition-colors text-[11px]">
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
