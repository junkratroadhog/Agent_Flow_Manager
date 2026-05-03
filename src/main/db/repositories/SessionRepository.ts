import { BaseRepository } from './BaseRepository'
import { generateId, ID_PREFIXES } from '../../utils/ids'
import {
  type Session,
  type CreateSessionInput,
  CreateSessionSchema,
  SessionSchema
} from '@shared/db-types'

export class SessionRepository extends BaseRepository {
  create(input: CreateSessionInput): Session {
    const validated = CreateSessionSchema.parse(input)
    const id = generateId(ID_PREFIXES.SESSION)
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, project_id, title, pinned, archived, metadata_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      validated.project_id,
      validated.title ?? 'Untitled Session',
      validated.pinned ?? 0,
      validated.archived ?? 0,
      validated.metadata_json ?? '{}',
      now,
      now
    )

    return this.findById(id)!
  }

  findById(id: string): Session | null {
    const row = this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(id)
    if (!row) return null
    return SessionSchema.parse(row)
  }

  findByProject(projectId: string, includeArchived = false): Session[] {
    const sql = includeArchived
      ? 'SELECT * FROM sessions WHERE project_id = ? ORDER BY pinned DESC, updated_at DESC'
      : 'SELECT * FROM sessions WHERE project_id = ? AND archived = 0 ORDER BY pinned DESC, updated_at DESC'
    const rows = this.db.prepare(sql).all(projectId)
    return rows.map((r) => SessionSchema.parse(r))
  }

  updateTitle(id: string, title: string): Session | null {
    const stmt = this.db.prepare(
      'UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?'
    )
    stmt.run(title, new Date().toISOString(), id)
    return this.findById(id)
  }

  setPinned(id: string, pinned: boolean): Session | null {
    const stmt = this.db.prepare(
      'UPDATE sessions SET pinned = ?, updated_at = ? WHERE id = ?'
    )
    stmt.run(pinned ? 1 : 0, new Date().toISOString(), id)
    return this.findById(id)
  }

  setArchived(id: string, archived: boolean): Session | null {
    const stmt = this.db.prepare(
      'UPDATE sessions SET archived = ?, updated_at = ? WHERE id = ?'
    )
    stmt.run(archived ? 1 : 0, new Date().toISOString(), id)
    return this.findById(id)
  }

  touch(id: string): void {
    this.db
      .prepare('UPDATE sessions SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), id)
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
    return result.changes > 0
  }
}
