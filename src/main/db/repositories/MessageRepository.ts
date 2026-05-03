import { BaseRepository } from './BaseRepository'
import { generateId, ID_PREFIXES } from '../../utils/ids'
import {
  type Message,
  type CreateMessageInput,
  CreateMessageSchema,
  MessageSchema
} from '@shared/db-types'

export class MessageRepository extends BaseRepository {
  create(input: CreateMessageInput): Message {
    const validated = CreateMessageSchema.parse(input)
    const id = generateId(ID_PREFIXES.MESSAGE)
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO messages (id, session_id, parent_message_id, role, content, model, tokens_in, tokens_out, cost, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      validated.session_id,
      validated.parent_message_id ?? null,
      validated.role,
      validated.content,
      validated.model ?? null,
      validated.tokens_in ?? 0,
      validated.tokens_out ?? 0,
      validated.cost ?? 0,
      validated.metadata_json ?? '{}',
      now
    )

    return this.findById(id)!
  }

  findById(id: string): Message | null {
    const row = this.db.prepare('SELECT * FROM messages WHERE id = ?').get(id)
    if (!row) return null
    return MessageSchema.parse(row)
  }

  findBySession(sessionId: string, limit?: number): Message[] {
    const sql = limit
      ? 'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?'
      : 'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
    const rows = limit
      ? this.db.prepare(sql).all(sessionId, limit)
      : this.db.prepare(sql).all(sessionId)
    return rows.map((r) => MessageSchema.parse(r))
  }

  countBySession(sessionId: string): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM messages WHERE session_id = ?')
      .get(sessionId) as { count: number }
    return row.count
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM messages WHERE id = ?').run(id)
    return result.changes > 0
  }

  deleteBySession(sessionId: string): number {
    const result = this.db
      .prepare('DELETE FROM messages WHERE session_id = ?')
      .run(sessionId)
    return result.changes
  }
}
