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
      'data-[panel-group-orientation=vertical]:h-1 data-[panel-group-orientation=vertical]:w-full',
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
