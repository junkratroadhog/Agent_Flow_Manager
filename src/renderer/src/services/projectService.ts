import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Project, CreateProjectInput } from '@shared/db-types'

export const projectService = {
  list: (): Promise<Project[]> => invoke<Project[]>(IPC.PROJECT_LIST),
  get: (id: string): Promise<Project | null> => invoke<Project | null>(IPC.PROJECT_GET, id),
  create: (input: CreateProjectInput): Promise<Project> =>
    invoke<Project>(IPC.PROJECT_CREATE, input),
  update: (id: string, updates: Partial<CreateProjectInput>): Promise<Project | null> =>
    invoke<Project | null>(IPC.PROJECT_UPDATE, id, updates),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.PROJECT_DELETE, id)
}
