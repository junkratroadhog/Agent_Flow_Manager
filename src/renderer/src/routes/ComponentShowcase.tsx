import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/Dialog'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/Tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../components/ui/Select'
import { ToastContainer, type ToastProps } from '../components/ui/Toast'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/Resizable'

export default function ComponentShowcase(): JSX.Element {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (variant: ToastProps['variant']): void => {
    const id = String(Date.now())
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: `${variant} toast`,
        description: 'This is a sample toast notification.',
        variant
      }
    ])
  }

  const dismissToast = (id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-2xl font-semibold mb-2 text-text-primary">Component Showcase</h1>
            <p className="text-text-secondary">All UI primitives for visual verification.</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Buttons</h2>
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex gap-2 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Inputs</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              <Input placeholder="Type something..." />
              <Input placeholder="Disabled input" disabled />
              <Textarea placeholder="Type a message..." className="col-span-2" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Select</h2>
            <Select>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-opus">Claude Opus</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Dialog</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    This is a sample dialog. Click outside or the close button to dismiss.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Tooltip</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Tabs</h2>
            <Tabs defaultValue="tab1" className="max-w-md">
              <TabsList>
                <TabsTrigger value="tab1">Chat</TabsTrigger>
                <TabsTrigger value="tab2">Flow</TabsTrigger>
                <TabsTrigger value="tab3">Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border border-border rounded-md">
                Chat content
              </TabsContent>
              <TabsContent value="tab2" className="p-4 border border-border rounded-md">
                Flow content
              </TabsContent>
              <TabsContent value="tab3" className="p-4 border border-border rounded-md">
                Tools content
              </TabsContent>
            </Tabs>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Toasts</h2>
            <div className="flex gap-2">
              <Button onClick={() => addToast('success')}>Success</Button>
              <Button onClick={() => addToast('error')} variant="danger">
                Error
              </Button>
              <Button onClick={() => addToast('info')} variant="secondary">
                Info
              </Button>
              <Button onClick={() => addToast('warning')} variant="outline">
                Warning
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Resizable Panels</h2>
            <div className="h-[200px] border border-border rounded-md overflow-hidden">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={30}>
                  <div className="h-full flex items-center justify-center bg-bg-surface text-text-secondary">
                    Panel 1
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <div className="h-full flex items-center justify-center bg-bg-elevated text-text-secondary">
                    Panel 2
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Color Tokens</h2>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div className="bg-bg-deepest border border-border p-3 rounded text-text-tertiary">
                bg-deepest
              </div>
              <div className="bg-bg-deep border border-border p-3 rounded text-text-tertiary">
                bg-deep
              </div>
              <div className="bg-bg-surface border border-border p-3 rounded text-text-tertiary">
                bg-surface
              </div>
              <div className="bg-bg-elevated border border-border p-3 rounded text-text-tertiary">
                bg-elevated
              </div>
              <div className="bg-accent text-accent-foreground p-3 rounded">accent</div>
              <div className="bg-status-success text-white p-3 rounded">success</div>
              <div className="bg-status-error text-white p-3 rounded">error</div>
              <div className="bg-status-warning text-white p-3 rounded">warning</div>
            </div>
          </section>
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </TooltipProvider>
  )
}
