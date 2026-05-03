import { create } from 'zustand'

export interface InstalledTool {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'mcp' | 'plugin'
  enabled: boolean
  version: string
  permissions: string[]
}

export type ApprovalScope = 'once' | 'session' | 'project' | 'global'

export interface ApprovalRecord {
  toolName: string
  scope: ApprovalScope
  scopeId?: string // sessionId or projectId for those scopes
  approvedAt: string
}

export interface ToolState {
  installedTools: InstalledTool[]
  approvals: ApprovalRecord[]

  setInstalledTools: (tools: InstalledTool[]) => void
  addTool: (tool: InstalledTool) => void
  removeTool: (id: string) => void
  setToolEnabled: (id: string, enabled: boolean) => void

  addApproval: (approval: ApprovalRecord) => void
  hasApproval: (toolName: string, sessionId?: string, projectId?: string) => boolean
  revokeApproval: (toolName: string, scope: ApprovalScope, scopeId?: string) => void
  clearSessionApprovals: (sessionId: string) => void
}

export const useToolStore = create<ToolState>((set, get) => ({
  installedTools: [],
  approvals: [],

  setInstalledTools: (tools): void => set({ installedTools: tools }),
  addTool: (tool): void => set((s) => ({ installedTools: [...s.installedTools, tool] })),
  removeTool: (id): void =>
    set((s) => ({ installedTools: s.installedTools.filter((t) => t.id !== id) })),
  setToolEnabled: (id, enabled): void =>
    set((s) => ({
      installedTools: s.installedTools.map((t) => (t.id === id ? { ...t, enabled } : t))
    })),

  addApproval: (approval): void => set((s) => ({ approvals: [...s.approvals, approval] })),

  hasApproval: (toolName, sessionId, projectId): boolean => {
    const approvals = get().approvals
    return approvals.some((a) => {
      if (a.toolName !== toolName) return false
      if (a.scope === 'global') return true
      if (a.scope === 'project' && a.scopeId === projectId) return true
      if (a.scope === 'session' && a.scopeId === sessionId) return true
      return false
    })
  },

  revokeApproval: (toolName, scope, scopeId): void =>
    set((s) => ({
      approvals: s.approvals.filter(
        (a) => !(a.toolName === toolName && a.scope === scope && a.scopeId === scopeId)
      )
    })),

  clearSessionApprovals: (sessionId): void =>
    set((s) => ({
      approvals: s.approvals.filter((a) => !(a.scope === 'session' && a.scopeId === sessionId))
    }))
}))
