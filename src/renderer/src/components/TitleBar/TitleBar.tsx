import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TitleBarProps {
  title?: string
}

function TitleBar({ title = 'Agent Flow Manager' }: TitleBarProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState<string>('win32')

  useEffect(() => {
    const init = async (): Promise<void> => {
      if (window.platform) {
        const detectedPlatform = await window.platform.get()
        setPlatform(detectedPlatform)
      }
      if (window.windowControls) {
        const initialState = await window.windowControls.isMaximized()
        setIsMaximized(initialState)
      }
    }
    init()
    if (window.windowControls) {
      window.windowControls.onMaximizedChange(setIsMaximized)
    }
    return undefined
  }, [])

  const isMac = platform === 'darwin'

  return (
    <div
      className={cn(
        'flex items-center h-9 bg-bg-deepest border-b border-border-subtle select-none flex-shrink-0',
        isMac && 'pl-20'
      )}
      style={{ zIndex: 1000, WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div
        className="flex-1 h-full flex items-center px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onDoubleClick={() => window.windowControls?.maximize()}
      >
        <span className="text-xs font-medium text-text-secondary tracking-wide pointer-events-none">
          {title}
        </span>
      </div>

      {!isMac && (
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => window.windowControls?.minimize()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => window.windowControls?.maximize()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            onClick={() => window.windowControls?.close()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-status-error hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TitleBar
