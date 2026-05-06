import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { Message } from '@shared/db-types'

interface ChatViewProps {
  sessionId: string
}

export default function ChatView({ sessionId }: ChatViewProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Load messages from IPC (Placeholder for now)
  useEffect(() => {
    // In a real app, we'd fetch messages for the sessionId here
    // For now, we'll just use a mock empty list
    setMessages([])
  }, [sessionId])

  const handleSend = async (content: string): Promise<void> => {
    // 1. Add user message locally
    const userMsg: Message = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      tokens_in: 0,
      tokens_out: 0,
      cost: 0,
      metadata_json: '{}'
    }
    setMessages((prev) => [...prev, userMsg])

    // 2. Simulate streaming assistant response
    setIsStreaming(true)
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      session_id: sessionId,
      role: 'assistant',
      content: '',
      model: 'claude-opus',
      created_at: new Date().toISOString(),
      tokens_in: 0,
      tokens_out: 0,
      cost: 0,
      metadata_json: '{}'
    }
    setMessages((prev) => [...prev, assistantMsg])

    const response =
      "That's a great question! I'm currently in 'mock mode' while my developer finishes the AI service layer. Once that's done, I'll be able to help you with research, coding, and complex agent orchestration."
    let currentText = ''

    for (const char of response) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      currentText += char
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: currentText } : m))
      )
    }

    setIsStreaming(false)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-bg-deepest overflow-hidden">
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList messages={messages} isStreaming={isStreaming} />
      </div>

      {/* Fixed Input Area */}
      <div className="shrink-0 bg-bg-deepest border-t border-border-subtle/50">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  )
}
