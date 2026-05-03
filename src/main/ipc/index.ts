import type { Repositories } from '../db/repositories'
import type { SecretStorage } from '../services/SecretStorage'
import { registerProjectHandlers } from './projectHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerMessageHandlers } from './messageHandlers'
import { registerAgentHandlers } from './agentHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerApiKeyHandlers } from './apiKeyHandlers'
import { registerAppHandlers } from './appHandlers'

export function registerAllIpcHandlers(repos: Repositories, secretStorage: SecretStorage): void {
  registerProjectHandlers(repos)
  registerSessionHandlers(repos)
  registerMessageHandlers(repos)
  registerAgentHandlers(repos)
  registerSettingsHandlers(repos)
  registerApiKeyHandlers(secretStorage)
}
