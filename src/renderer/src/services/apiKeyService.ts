import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'

export const apiKeyService = {
  set: (provider: string, key: string): Promise<void> =>
    invoke<void>(IPC.APIKEY_SET, provider, key),
  has: (provider: string): Promise<boolean> => invoke<boolean>(IPC.APIKEY_HAS, provider),
  delete: (provider: string): Promise<boolean> => invoke<boolean>(IPC.APIKEY_DELETE, provider),
  listProviders: (): Promise<string[]> => invoke<string[]>(IPC.APIKEY_LIST_PROVIDERS)
}
