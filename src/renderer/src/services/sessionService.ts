import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Session, CreateSessionInput } from '@shared/db-types'

export const sessionService = {
  list: (projectId: string, includeArchived = false): Promise<Session[]> =>
    invoke<Session[]>(IPC.SESSION_LIST, projectId, includeArchived),
  get: (id: string): Promise<Session | null> => invoke<Session | null>(IPC.SESSION_GET, id),
  create: (input: CreateSessionInput): Promise<Session> =>
    invoke<Session>(IPC.SESSION_CREATE, input),
  updateTitle: (id: string, title: string): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_UPDATE, id, title),
  setPinned: (id: string, pinned: boolean): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_PIN, id, pinned),
  setArchived: (id: string, archived: boolean): Promise<Session | null> =>
    invoke<Session | null>(IPC.SESSION_ARCHIVE, id, archived),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.SESSION_DELETE, id)
}
