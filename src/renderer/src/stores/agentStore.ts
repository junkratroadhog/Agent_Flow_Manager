import { create } from 'zustand'
import type { Agent, AgentStatusType } from '@shared/db-types'

export interface AgentAction {
  id: string
  agentId: string
  actionType: string
  description: string
  status: 'pending' | 'running' | 'done' | 'failed'
  createdAt: string
}

export interface AgentState {
  agentsBySession: Record<string, Agent[]>
  actionsByAgent: Record<string, AgentAction[]>

  setAgents: (sessionId: string, agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  updateAgentStatus: (id: string, status: AgentStatusType, action?: string) => void
  removeAgent: (id: string) => void

  addAction: (action: AgentAction) => void
  updateActionStatus: (id: string, status: AgentAction['status']) => void

  clearSession: (sessionId: string) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agentsBySession: {},
  actionsByAgent: {},

  setAgents: (sessionId, agents): void =>
    set((s) => ({
      agentsBySession: { ...s.agentsBySession, [sessionId]: agents }
    })),

  addAgent: (agent): void =>
    set((s) => ({
      agentsBySession: {
        ...s.agentsBySession,
        [agent.session_id]: [...(s.agentsBySession[agent.session_id] ?? []), agent]
      }
    })),

  updateAgent: (id, updates): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.map((a) => (a.id === id ? { ...a, ...updates } : a))
      }
      return { agentsBySession: newMap }
    }),

  updateAgentStatus: (id, status, action): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.map((a) =>
          a.id === id ? { ...a, status, current_action: action ?? a.current_action } : a
        )
      }
      return { agentsBySession: newMap }
    }),

  removeAgent: (id): void =>
    set((s) => {
      const newMap: Record<string, Agent[]> = {}
      for (const [sessionId, agents] of Object.entries(s.agentsBySession)) {
        newMap[sessionId] = agents.filter((a) => a.id !== id)
      }
      const { [id]: _removed, ...restActions } = s.actionsByAgent
      void _removed
      return { agentsBySession: newMap, actionsByAgent: restActions }
    }),

  addAction: (action): void =>
    set((s) => ({
      actionsByAgent: {
        ...s.actionsByAgent,
        [action.agentId]: [...(s.actionsByAgent[action.agentId] ?? []), action]
      }
    })),

  updateActionStatus: (id, status): void =>
    set((s) => {
      const newMap: Record<string, AgentAction[]> = {}
      for (const [agentId, actions] of Object.entries(s.actionsByAgent)) {
        newMap[agentId] = actions.map((a) => (a.id === id ? { ...a, status } : a))
      }
      return { actionsByAgent: newMap }
    }),

  clearSession: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _removed, ...rest } = s.agentsBySession
      void _removed
      return { agentsBySession: rest }
    })
}))

// Selectors
export const selectActiveAgents = (state: AgentState, sessionId: string | null): Agent[] =>
  sessionId ? state.agentsBySession[sessionId] ?? [] : []

export const selectAgentChildren = (
  state: AgentState,
  parentId: string,
  sessionId: string
): Agent[] => {
  const agents = state.agentsBySession[sessionId] ?? []
  return agents.filter((a) => a.parent_agent_id === parentId)
}
