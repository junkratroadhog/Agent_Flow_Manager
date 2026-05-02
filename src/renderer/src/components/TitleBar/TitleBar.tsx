import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import './TitleBar.css'

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
      const unsubscribe = window.windowControls.onMaximizedChange((maximized) => {
        setIsMaximized(maximized)
      })
      return unsubscribe
    }

    return undefined
  }, [])

  const handleMinimize = (): void => {
    window.windowControls?.minimize()
  }

  const handleMaximize = (): void => {
    window.windowControls?.maximize()
  }

  const handleClose = (): void => {
    window.windowControls?.close()
  }

  const handleDoubleClick = (): void => {
    handleMaximize()
  }

  const isMac = platform === 'darwin'

  return (
    <div className={`title-bar ${isMac ? 'title-bar--mac' : 'title-bar--win'}`}>
      <div className="title-bar__drag-region" onDoubleClick={handleDoubleClick}>
        <div className="title-bar__title">
          <span className="title-bar__app-name">{title}</span>
        </div>
      </div>

      {!isMac && (
        <div className="title-bar__controls">
          <button
            className="title-bar__button title-bar__button--minimize"
            onClick={handleMinimize}
            aria-label="Minimize"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            className="title-bar__button title-bar__button--maximize"
            onClick={handleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            className="title-bar__button title-bar__button--close"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TitleBar
