import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { RESIZE_HANDLE_HIT_AREA, RESIZE_HANDLE_WIDTH } from './panelConstants'

export type ResizeOrientation = 'vertical' | 'horizontal'

export interface ResizeHandleProps {
  /** vertical = handle is a vertical line (drag horizontally) for left/right panels */
  /** horizontal = handle is a horizontal line (drag vertically) for top/bottom panels */
  orientation: ResizeOrientation
  /** Called continuously during drag with the cursor's clientX (vertical) or clientY (horizontal). */
  onDrag: (clientCoord: number) => void
  /** Called when drag starts. */
  onDragStart?: () => void
  /** Called when drag ends. */
  onDragEnd?: () => void
  className?: string
}

export default function ResizeHandle({
  orientation,
  onDrag,
  onDragStart,
  onDragEnd,
  className
}: ResizeHandleProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent): void => {
      if (!isDraggingRef.current) return
      e.preventDefault()
      onDrag(orientation === 'vertical' ? e.clientX : e.clientY)
    }

    const handleUp = (): void => {
      isDraggingRef.current = false
      setIsDragging(false)
      onDragEnd?.()
    }

    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    document.addEventListener('pointercancel', handleUp)
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('pointercancel', handleUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, onDrag, onDragEnd, orientation])

  const handleDown = (e: React.PointerEvent): void => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    onDragStart?.()
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      onPointerDown={handleDown}
      role="separator"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      className={cn(
        'group relative flex items-center justify-center select-none z-30',
        isVertical ? 'cursor-col-resize h-full' : 'cursor-row-resize w-full',
        className
      )}
      style={{
        width: isVertical ? RESIZE_HANDLE_HIT_AREA : '100%',
        height: isVertical ? '100%' : RESIZE_HANDLE_HIT_AREA,
        // Negative margin so the hit area overlaps neighbors without affecting layout
        marginLeft: isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginRight: isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginTop: !isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginBottom: !isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined
      }}
    >
      <div
        className={cn(
          'transition-colors',
          isVertical ? 'h-full' : 'w-full',
          isDragging ? 'bg-accent' : 'bg-transparent group-hover:bg-accent/50'
        )}
        style={{
          width: isVertical ? RESIZE_HANDLE_WIDTH : '100%',
          height: isVertical ? '100%' : RESIZE_HANDLE_WIDTH
        }}
      />
    </div>
  )
}
