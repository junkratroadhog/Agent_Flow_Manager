import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'
import type { Message, CreateMessageInput } from '@shared/db-types'

export const messageService = {
  list: (sessionId: string, limit?: number): Promise<Message[]> =>
    invoke<Message[]>(IPC.MESSAGE_LIST, sessionId, limit),
  create: (input: CreateMessageInput): Promise<Message> =>
    invoke<Message>(IPC.MESSAGE_CREATE, input),
  delete: (id: string): Promise<boolean> => invoke<boolean>(IPC.MESSAGE_DELETE, id)
}
