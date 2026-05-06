import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'

export default function RightSidebar(): JSX.Element {
  const [tab, setTab] = useState('inspector')

  return (
    <div className="flex flex-col h-full bg-bg-surface border-l border-border-subtle">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
        <div className="h-9 flex items-center px-2 border-b border-border-subtle">
          <TabsList className="h-7">
            <TabsTrigger value="inspector" className="text-xs">
              Inspector
            </TabsTrigger>
            <TabsTrigger value="flow" className="text-xs">
              Flow
            </TabsTrigger>
            <TabsTrigger value="plan" className="text-xs">
              Plan
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="inspector" className="mt-0">
            <p className="text-xs text-text-tertiary">
              Agent details, token usage, cost (filled in later chapters).
            </p>
          </TabsContent>
          <TabsContent value="flow" className="mt-0">
            <p className="text-xs text-text-tertiary">Mini-map of agent flow (Chapter 22-ish).</p>
          </TabsContent>
          <TabsContent value="plan" className="mt-0">
            <p className="text-xs text-text-tertiary">Plan.md preview (later chapter).</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
