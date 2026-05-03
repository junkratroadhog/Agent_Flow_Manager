import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Message, CreateMessageInput } from '@shared/db-types'

export function registerMessageHandlers(repos: Repositories): void {
  ipcMain.handle(
    IPC.MESSAGE_LIST,
    async (
      _event,
      sessionId: string,
      limit?: number
    ): Promise<IPCResult<Message[]>> => {
      try {
        return ipcSuccess(repos.messages.findBySession(sessionId, limit))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.MESSAGE_CREATE,
    async (_event, input: CreateMessageInput): Promise<IPCResult<Message>> => {
      try {
        const msg = repos.messages.create(input)
        // Touch session updated_at
        repos.sessions.touch(input.session_id)
        return ipcSuccess(msg)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.MESSAGE_DELETE,
    async (_event, id: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(repos.messages.delete(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
