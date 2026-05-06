import { useEffect, useState } from 'react'
import { Wrench, Globe, Code, FileText, Search } from 'lucide-react'
import { useToolStore, type InstalledTool } from '../../stores'
import { cn } from '../../lib/utils'
import SidebarHeader from './SidebarHeader'
import { useSearchFilter } from './useSearchFilter'

const PLACEHOLDER_TOOLS: InstalledTool[] = [
  {
    id: 'tol_websearch',
    name: 'web_search',
    description: 'Search the web for current information',
    category: 'research',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['network']
  },
  {
    id: 'tol_fetch',
    name: 'web_fetch',
    description: 'Fetch content from a URL',
    category: 'research',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['network']
  },
  {
    id: 'tol_fs_read',
    name: 'file_read',
    description: 'Read files from the workspace',
    category: 'filesystem',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['fs:read']
  },
  {
    id: 'tol_fs_write',
    name: 'file_write',
    description: 'Write files to the workspace',
    category: 'filesystem',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['fs:write']
  },
  {
    id: 'tol_shell',
    name: 'shell_exec',
    description: 'Execute shell commands',
    category: 'system',
    source: 'builtin',
    enabled: false,
    version: '1.0.0',
    permissions: ['shell']
  }
]

const iconForTool = (name: string): typeof Wrench => {
  if (name.startsWith('web_')) return Globe
  if (name.startsWith('file_')) return FileText
  if (name === 'shell_exec') return Code
  if (name === 'web_search') return Search
  return Wrench
}

export default function ToolsPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const { installedTools, setInstalledTools, setToolEnabled } = useToolStore()

  useEffect(() => {
    // Placeholder: in later chapters, fetch from main process
    if (installedTools.length === 0) {
      setInstalledTools(PLACEHOLDER_TOOLS)
    }
  }, [installedTools.length, setInstalledTools])

  const filtered = useSearchFilter(
    installedTools,
    searchQuery,
    (t) => `${t.name} ${t.description} ${t.category}`
  )

  // Group by category
  const grouped: Record<string, InstalledTool[]> = {}
  for (const tool of filtered) {
    if (!grouped[tool.category]) grouped[tool.category] = []
    grouped[tool.category].push(tool)
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader title="Tools" searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-xs text-text-tertiary text-center">
            {searchQuery ? 'No tools match.' : 'No tools installed.'}
          </div>
        ) : (
          Object.entries(grouped).map(([category, tools]) => (
            <div key={category} className="py-1">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">
                {category}
              </div>
              {tools.map((tool) => {
                const Icon = iconForTool(tool.name)
                return (
                  <div
                    key={tool.id}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-bg-hover group"
                  >
                    <Icon
                      size={14}
                      className={cn(
                        'shrink-0 mt-0.5',
                        tool.enabled ? 'text-accent' : 'text-text-tertiary'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono">{tool.name}</div>
                      <div className="text-[10px] text-text-tertiary leading-snug">
                        {tool.description}
                      </div>
                    </div>
                    <label className="shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={(e) => setToolEnabled(tool.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
