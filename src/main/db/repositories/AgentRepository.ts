import { BaseRepository } from './BaseRepository'
import { generateId, ID_PREFIXES } from '../../utils/ids'
import {
  type Agent,
  type CreateAgentInput,
  CreateAgentSchema,
  AgentSchema,
  type AgentStatusType
} from '@shared/db-types'

export class AgentRepository extends BaseRepository {
  create(input: CreateAgentInput): Agent {
    const validated = CreateAgentSchema.parse(input)
    const id = generateId(ID_PREFIXES.AGENT)
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO agents (id, session_id, parent_agent_id, name, role, model, status, current_action, tokens_used, cost, started_at, completed_at, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      validated.session_id,
      validated.parent_agent_id ?? null,
      validated.name,
      validated.role,
      validated.model,
      validated.status ?? 'idle',
      validated.current_action ?? null,
      validated.tokens_used ?? 0,
      validated.cost ?? 0,
      validated.started_at ?? null,
      validated.completed_at ?? null,
      validated.metadata_json ?? '{}',
      now
    )

    return this.findById(id)!
  }

  findById(id: string): Agent | null {
    const row = this.db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
    if (!row) return null
    return AgentSchema.parse(row)
  }

  findBySession(sessionId: string): Agent[] {
    const rows = this.db
      .prepare('SELECT * FROM agents WHERE session_id = ? ORDER BY created_at ASC')
      .all(sessionId)
    return rows.map((r) => AgentSchema.parse(r))
  }

  findChildren(parentId: string): Agent[] {
    const rows = this.db
      .prepare('SELECT * FROM agents WHERE parent_agent_id = ? ORDER BY created_at ASC')
      .all(parentId)
    return rows.map((r) => AgentSchema.parse(r))
  }

  updateStatus(id: string, status: AgentStatusType, currentAction?: string): Agent | null {
    const completedAt =
      status === 'done' || status === 'failed' ? new Date().toISOString() : null
    const startedAt = status === 'thinking' || status === 'working' ? new Date().toISOString() : null

    const stmt = this.db.prepare(`
      UPDATE agents SET
        status = ?,
        current_action = COALESCE(?, current_action),
        started_at = COALESCE(started_at, ?),
        completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `)

    stmt.run(status, currentAction ?? null, startedAt, completedAt, id)
    return this.findById(id)
  }

  incrementTokens(id: string, tokensUsed: number, cost: number): void {
    this.db
      .prepare(
        'UPDATE agents SET tokens_used = tokens_used + ?, cost = cost + ? WHERE id = ?'
      )
      .run(tokensUsed, cost, id)
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM agents WHERE id = ?').run(id)
    return result.changes > 0
  }
}
