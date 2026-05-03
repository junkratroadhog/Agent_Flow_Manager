import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'
import type { Project, CreateProjectInput } from '@shared/db-types'

export function registerProjectHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.PROJECT_LIST, async (): Promise<IPCResult<Project[]>> => {
    try {
      return ipcSuccess(repos.projects.findAll())
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.PROJECT_GET,
    async (_event, id: string): Promise<IPCResult<Project | null>> => {
      try {
        return ipcSuccess(repos.projects.findById(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.PROJECT_CREATE,
    async (_event, input: CreateProjectInput): Promise<IPCResult<Project>> => {
      try {
        return ipcSuccess(repos.projects.create(input))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.PROJECT_UPDATE,
    async (
      _event,
      id: string,
      updates: Partial<CreateProjectInput>
    ): Promise<IPCResult<Project | null>> => {
      try {
        return ipcSuccess(repos.projects.update(id, updates))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.PROJECT_DELETE,
    async (_event, id: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(repos.projects.delete(id))
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
