import type Database from 'better-sqlite3'
import { ProjectRepository } from './ProjectRepository'
import { SessionRepository } from './SessionRepository'
import { MessageRepository } from './MessageRepository'
import { AgentRepository } from './AgentRepository'
import { SettingsRepository } from './SettingsRepository'

export interface Repositories {
  projects: ProjectRepository
  sessions: SessionRepository
  messages: MessageRepository
  agents: AgentRepository
  settings: SettingsRepository
}

export function createRepositories(db: Database.Database): Repositories {
  return {
    projects: new ProjectRepository(db),
    sessions: new SessionRepository(db),
    messages: new MessageRepository(db),
    agents: new AgentRepository(db),
    settings: new SettingsRepository(db)
  }
}

export {
  ProjectRepository,
  SessionRepository,
  MessageRepository,
  AgentRepository,
  SettingsRepository
}
