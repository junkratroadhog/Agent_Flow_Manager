import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  ProjectRepository,
  SessionRepository,
  MessageRepository,
  AgentRepository,
  SettingsRepository
} from '../../src/main/db/repositories'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  const schema = readFileSync(resolve('src/main/db/schema.sql'), 'utf-8')
  db.exec(schema)
  return db
}

describe('ProjectRepository', () => {
  let db: Database.Database
  let repo: ProjectRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new ProjectRepository(db)
  })

  it('creates a project', () => {
    const project = repo.create({ name: 'Test Project' })
    expect(project.id).toMatch(/^prj_/)
    expect(project.name).toBe('Test Project')
    expect(project.workspace_type).toBe('local')
  })

  it('finds project by id', () => {
    const created = repo.create({ name: 'Find Me' })
    const found = repo.findById(created.id)
    expect(found?.name).toBe('Find Me')
  })

  it('returns null for non-existent project', () => {
    expect(repo.findById('nope')).toBeNull()
  })

  it('lists all projects', () => {
    repo.create({ name: 'P1' })
    repo.create({ name: 'P2' })
    expect(repo.findAll().length).toBe(2)
  })

  it('updates a project', () => {
    const p = repo.create({ name: 'Old Name' })
    const updated = repo.update(p.id, { name: 'New Name' })
    expect(updated?.name).toBe('New Name')
  })

  it('deletes a project', () => {
    const p = repo.create({ name: 'To Delete' })
    expect(repo.delete(p.id)).toBe(true)
    expect(repo.findById(p.id)).toBeNull()
  })
})

describe('SessionRepository', () => {
  let db: Database.Database
  let projectRepo: ProjectRepository
  let sessionRepo: SessionRepository
  let projectId: string

  beforeEach(() => {
    db = createTestDb()
    projectRepo = new ProjectRepository(db)
    sessionRepo = new SessionRepository(db)
    projectId = projectRepo.create({ name: 'Test' }).id
  })

  it('creates a session', () => {
    const session = sessionRepo.create({ project_id: projectId, title: 'Chat 1' })
    expect(session.id).toMatch(/^ses_/)
    expect(session.title).toBe('Chat 1')
  })

  it('finds sessions by project', () => {
    sessionRepo.create({ project_id: projectId, title: 'A' })
    sessionRepo.create({ project_id: projectId, title: 'B' })
    expect(sessionRepo.findByProject(projectId).length).toBe(2)
  })

  it('pins a session', () => {
    const s = sessionRepo.create({ project_id: projectId, title: 'Pin' })
    const pinned = sessionRepo.setPinned(s.id, true)
    expect(pinned?.pinned).toBe(1)
  })

  it('cascades delete from project', () => {
    sessionRepo.create({ project_id: projectId, title: 'Bye' })
    projectRepo.delete(projectId)
    expect(sessionRepo.findByProject(projectId).length).toBe(0)
  })
})

describe('MessageRepository', () => {
  let db: Database.Database
  let messageRepo: MessageRepository
  let sessionId: string

  beforeEach(() => {
    db = createTestDb()
    const projectRepo = new ProjectRepository(db)
    const sessionRepo = new SessionRepository(db)
    messageRepo = new MessageRepository(db)
    const projectId = projectRepo.create({ name: 'P' }).id
    sessionId = sessionRepo.create({ project_id: projectId, title: 'S' }).id
  })

  it('creates a message', () => {
    const msg = messageRepo.create({
      session_id: sessionId,
      role: 'user',
      content: 'Hello'
    })
    expect(msg.id).toMatch(/^msg_/)
    expect(msg.content).toBe('Hello')
  })

  it('finds messages by session in order', () => {
    messageRepo.create({ session_id: sessionId, role: 'user', content: 'First' })
    messageRepo.create({ session_id: sessionId, role: 'assistant', content: 'Second' })
    const msgs = messageRepo.findBySession(sessionId)
    expect(msgs.length).toBe(2)
    expect(msgs[0].content).toBe('First')
  })

  it('counts messages by session', () => {
    messageRepo.create({ session_id: sessionId, role: 'user', content: 'A' })
    messageRepo.create({ session_id: sessionId, role: 'user', content: 'B' })
    expect(messageRepo.countBySession(sessionId)).toBe(2)
  })
})

describe('AgentRepository', () => {
  let db: Database.Database
  let agentRepo: AgentRepository
  let sessionId: string

  beforeEach(() => {
    db = createTestDb()
    const projectRepo = new ProjectRepository(db)
    const sessionRepo = new SessionRepository(db)
    agentRepo = new AgentRepository(db)
    const projectId = projectRepo.create({ name: 'P' }).id
    sessionId = sessionRepo.create({ project_id: projectId, title: 'S' }).id
  })

  it('creates an agent', () => {
    const agent = agentRepo.create({
      session_id: sessionId,
      name: 'Researcher',
      role: 'researcher',
      model: 'claude-opus'
    })
    expect(agent.id).toMatch(/^agt_/)
    expect(agent.status).toBe('idle')
  })

  it('updates agent status', () => {
    const a = agentRepo.create({
      session_id: sessionId,
      name: 'A',
      role: 'r',
      model: 'm'
    })
    const updated = agentRepo.updateStatus(a.id, 'working', 'Searching...')
    expect(updated?.status).toBe('working')
    expect(updated?.current_action).toBe('Searching...')
  })

  it('finds children of parent agent', () => {
    const parent = agentRepo.create({
      session_id: sessionId,
      name: 'P',
      role: 'r',
      model: 'm'
    })
    agentRepo.create({
      session_id: sessionId,
      parent_agent_id: parent.id,
      name: 'C1',
      role: 'r',
      model: 'm'
    })
    expect(agentRepo.findChildren(parent.id).length).toBe(1)
  })

  it('increments tokens and cost', () => {
    const a = agentRepo.create({
      session_id: sessionId,
      name: 'A',
      role: 'r',
      model: 'm'
    })
    agentRepo.incrementTokens(a.id, 100, 0.5)
    agentRepo.incrementTokens(a.id, 50, 0.25)
    const updated = agentRepo.findById(a.id)
    expect(updated?.tokens_used).toBe(150)
    expect(updated?.cost).toBe(0.75)
  })
})

describe('SettingsRepository', () => {
  let db: Database.Database
  let repo: SettingsRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new SettingsRepository(db)
  })

  it('stores and retrieves a setting', () => {
    repo.set('theme', 'dark')
    expect(repo.get('theme')).toBe('dark')
  })

  it('stores complex objects', () => {
    repo.set('config', { foo: 1, bar: ['a', 'b'] })
    expect(repo.get('config')).toEqual({ foo: 1, bar: ['a', 'b'] })
  })

  it('returns null for missing keys', () => {
    expect(repo.get('missing')).toBeNull()
  })

  it('updates existing key', () => {
    repo.set('x', 1)
    repo.set('x', 2)
    expect(repo.get('x')).toBe(2)
  })

  it('deletes a key', () => {
    repo.set('temp', 'value')
    expect(repo.delete('temp')).toBe(true)
    expect(repo.get('temp')).toBeNull()
  })
})
