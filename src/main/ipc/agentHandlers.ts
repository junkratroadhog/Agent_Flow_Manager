import { ipcMain, BrowserWindow } from 'electron'
import { IPC, IPC_EVENTS } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Agent, CreateAgentInput, AgentStatusType } from '@shared/db-types'

export function registerAgentHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.AGENT_LIST, async (_event, sessionId: string): Promise<IPCResult<Agent[]>> => {
    try {
      return ipcSuccess(repos.agents.findBySession(sessionId))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.AGENT_GET, async (_event, id: string): Promise<IPCResult<Agent | null>> => {
    try {
      return ipcSuccess(repos.agents.findById(id))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.AGENT_CHILDREN,
    async (_event, parentId: string): Promise<IPCResult<Agent[]>> => {
      try {
        return ipcSuccess(repos.agents.findChildren(parentId))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.AGENT_CREATE,
    async (_event, input: CreateAgentInput): Promise<IPCResult<Agent>> => {
      try {
        const agent = repos.agents.create(input)
        broadcastToWindows(IPC_EVENTS.AGENT_SPAWNED, agent)
        return ipcSuccess(agent)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.AGENT_UPDATE_STATUS,
    async (
      _event,
      id: string,
      status: AgentStatusType,
      currentAction?: string
    ): Promise<IPCResult<Agent | null>> => {
      try {
        const updated = repos.agents.updateStatus(id, status, currentAction)
        if (updated) {
          broadcastToWindows(IPC_EVENTS.AGENT_STATUS_CHANGED, updated)
        }
        return ipcSuccess(updated)
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}
