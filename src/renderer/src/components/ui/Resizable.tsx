import { GripVertical } from 'lucide-react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { cn } from '../../lib/utils'

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof Group>): JSX.Element => (
  <Group
    className={cn('flex h-full w-full data-[panel-group-orientation=vertical]:flex-col', className)}
    {...props}
  />
)

const ResizablePanel = ({
  className,
  ...props
}: React.ComponentProps<typeof Panel>): JSX.Element => (
  <Panel
    className={cn(
      'transition-all duration-500 cubic-bezier(.36,.07,.19,.97) data-[is-resizing=true]:transition-none',
      className
    )}
    {...props}
  />
)

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}): JSX.Element => (
  <Separator
    className={cn(
      'relative flex w-1 items-center justify-center bg-border-strong hover:bg-accent/50 transition-all z-50',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2',
      'data-[panel-group-orientation=vertical]:h-1 data-[panel-group-orientation=vertical]:w-full',
      'data-[panel-group-orientation=vertical]:after:left-0 data-[panel-group-orientation=vertical]:after:h-3',
      'data-[panel-group-orientation=vertical]:after:w-full data-[panel-group-orientation=vertical]:after:-translate-y-1/2',
      'data-[panel-group-orientation=vertical]:after:translate-x-0',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-3.5 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-text-tertiary group-hover:text-accent group-hover:border-accent/50 group-hover:bg-accent/10 transition-all shadow-lg">
        <GripVertical className="h-3 w-3 data-[panel-group-orientation=vertical]:rotate-90" />
      </div>
    )}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
