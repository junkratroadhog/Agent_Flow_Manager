import { invoke, subscribe } from './bridge'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import type { Agent, CreateAgentInput, AgentStatusType } from '@shared/db-types'

export const agentService = {
  list: (sessionId: string): Promise<Agent[]> => invoke<Agent[]>(IPC.AGENT_LIST, sessionId),
  get: (id: string): Promise<Agent | null> => invoke<Agent | null>(IPC.AGENT_GET, id),
  children: (parentId: string): Promise<Agent[]> => invoke<Agent[]>(IPC.AGENT_CHILDREN, parentId),
  create: (input: CreateAgentInput): Promise<Agent> => invoke<Agent>(IPC.AGENT_CREATE, input),
  updateStatus: (
    id: string,
    status: AgentStatusType,
    currentAction?: string
  ): Promise<Agent | null> =>
    invoke<Agent | null>(IPC.AGENT_UPDATE_STATUS, id, status, currentAction),

  onStatusChanged: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_STATUS_CHANGED, (...args) => cb(args[0] as Agent)),
  onSpawned: (cb: (agent: Agent) => void): (() => void) =>
    subscribe(IPC_EVENTS.AGENT_SPAWNED, (...args) => cb(args[0] as Agent))
}
