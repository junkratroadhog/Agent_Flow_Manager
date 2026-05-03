import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'

export default function BottomPanel(): JSX.Element {
  const toggle = useUIStore((s) => s.toggleBottomPanel)
  const [tab, setTab] = useState('logs')

  return (
    <div className="flex flex-col h-full bg-bg-deep border-t border-border-subtle">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
        <div className="h-9 flex items-center justify-between px-2 border-b border-border-subtle">
          <TabsList className="h-7">
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
            <TabsTrigger value="terminal" className="text-xs">
              Terminal
            </TabsTrigger>
            <TabsTrigger value="problems" className="text-xs">
              Problems
            </TabsTrigger>
          </TabsList>
          <button
            onClick={toggle}
            className="p-1 text-text-tertiary hover:text-text-primary rounded"
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
          <TabsContent value="logs" className="mt-0">
            <p className="text-text-tertiary">Agent logs will stream here.</p>
          </TabsContent>
          <TabsContent value="terminal" className="mt-0">
            <p className="text-text-tertiary">Terminal output (later chapter).</p>
          </TabsContent>
          <TabsContent value="problems" className="mt-0">
            <p className="text-text-tertiary">No problems detected.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
