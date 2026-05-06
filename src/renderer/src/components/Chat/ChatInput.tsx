import { useState, useRef, useEffect } from 'react'
import { Plus, Paperclip, Mic, ArrowUp } from 'lucide-react'
import { useSettingsStore } from '../../stores'
import { clsx } from 'clsx'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps): JSX.Element {
  const [content, setContent] = useState('')
  const { currentBrainMode } = useSettingsStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [content])

  const handleSubmit = (): void => {
    if (content.trim() && !disabled) {
      onSend(content.trim())
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-4xl mx-auto relative group">
        <div
          className={clsx(
            'flex flex-col bg-bg-surface border rounded-xl transition-all duration-300 shadow-lg',
            'focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 focus-within:shadow-accent/5',
            disabled ? 'opacity-60 grayscale' : 'border-border-subtle hover:border-border'
          )}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything in ${currentBrainMode} mode...`}
            disabled={disabled}
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-4 resize-none min-h-[44px] scrollbar-none text-text-primary placeholder:text-text-quaternary"
          />

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <button
                disabled={disabled}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
              <button
                disabled={disabled}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              >
                <Paperclip size={18} />
              </button>
              <button
                disabled={disabled}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              >
                <Mic size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-quaternary uppercase font-bold tracking-tighter pr-1">
                {currentBrainMode}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || disabled}
                className={clsx(
                  'p-2 rounded-lg transition-all duration-200 flex items-center justify-center',
                  content.trim() && !disabled
                    ? 'bg-accent text-white shadow-md shadow-accent/20 hover:bg-accent/90'
                    : 'bg-bg-hover text-text-quaternary'
                )}
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-center text-text-quaternary">
          Shift + Enter for new line. Press Enter to send.
        </div>
      </div>
    </div>
  )
}
