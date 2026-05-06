import { useEffect, useRef } from 'react'
import { Message } from '@shared/db-types'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
  isStreaming?: boolean
}

export default function MessageList({ messages, isStreaming }: MessageListProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent animate-pulse">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">Ready to assist</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Choose a brain mode above and start typing to begin the session. Agents can help with
            research, coding, or complex planning.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border/20"
    >
      <div className="max-w-4xl mx-auto w-full px-4">
        {messages.map((msg, i) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isLast={i === messages.length - 1}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {/* Extra space at bottom */}
        <div className="h-24" />
      </div>
    </div>
  )
}

import { Activity } from 'lucide-react'
