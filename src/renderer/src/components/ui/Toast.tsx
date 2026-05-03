import { useEffect, useState, type ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  title?: string
  description?: ReactNode
  variant?: ToastVariant
  duration?: number
  onDismiss?: (id: string) => void
}

const variantConfig = {
  success: { icon: CheckCircle2, color: 'text-status-success' },
  error: { icon: AlertCircle, color: 'text-status-error' },
  info: { icon: Info, color: 'text-status-info' },
  warning: { icon: AlertTriangle, color: 'text-status-warning' }
}

export function Toast({
  id,
  title,
  description,
  variant = 'info',
  duration = 4000,
  onDismiss
}: ToastProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true)
  const { icon: Icon, color } = variantConfig[variant]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(id), 200)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-border bg-bg-elevated p-3 shadow-lg min-w-[320px] max-w-[420px]',
        'transition-all duration-200',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', color)} />
      <div className="flex-1">
        {title && <p className="text-sm font-medium text-text-primary">{title}</p>}
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onDismiss?.(id), 200)
        }}
        className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}
