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

const ResizablePanel = Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}): JSX.Element => (
  <Separator
    className={cn(
      'relative flex w-1 items-center justify-center bg-border-strong hover:bg-accent transition-all',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-2.5 after:-translate-x-1/2',
      'data-[panel-group-orientation=vertical]:h-1 data-[panel-group-orientation=vertical]:w-full',
      'data-[panel-group-orientation=vertical]:after:left-0 data-[panel-group-orientation=vertical]:after:h-2.5',
      'data-[panel-group-orientation=vertical]:after:w-full data-[panel-group-orientation=vertical]:after:-translate-y-1/2',
      'data-[panel-group-orientation=vertical]:after:translate-x-0',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-bg-elevated">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
