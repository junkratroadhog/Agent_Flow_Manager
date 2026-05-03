import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Session, CreateSessionInput } from '@shared/db-types'

export function registerSessionHandlers(repos: Repositories): void {
  ipcMain.handle(
    IPC.SESSION_LIST,
    async (_event, projectId: string, includeArchived = false): Promise<IPCResult<Session[]>> => {
      try {
        return ipcSuccess(repos.sessions.findByProject(projectId, includeArchived))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_GET,
    async (_event, id: string): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.findById(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_CREATE,
    async (_event, input: CreateSessionInput): Promise<IPCResult<Session>> => {
      try {
        return ipcSuccess(repos.sessions.create(input))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_UPDATE,
    async (_event, id: string, title: string): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.updateTitle(id, title))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_PIN,
    async (_event, id: string, pinned: boolean): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.setPinned(id, pinned))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.SESSION_ARCHIVE,
    async (_event, id: string, archived: boolean): Promise<IPCResult<Session | null>> => {
      try {
        return ipcSuccess(repos.sessions.setArchived(id, archived))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.SESSION_DELETE, async (_event, id: string): Promise<IPCResult<boolean>> => {
    try {
      return ipcSuccess(repos.sessions.delete(id))
    } catch (error) {
      return ipcError(error)
    }
  })
}
