import { BaseRepository } from './BaseRepository'
import { generateId, ID_PREFIXES } from '../../utils/ids'
import {
  type Project,
  type CreateProjectInput,
  CreateProjectSchema,
  ProjectSchema
} from '@shared/db-types'

export class ProjectRepository extends BaseRepository {
  create(input: CreateProjectInput): Project {
    const validated = CreateProjectSchema.parse(input)
    const id = generateId(ID_PREFIXES.PROJECT)
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, workspace_path, workspace_type, icon, color, settings_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      validated.name,
      validated.description ?? null,
      validated.workspace_path ?? null,
      validated.workspace_type ?? 'local',
      validated.icon ?? null,
      validated.color ?? null,
      validated.settings_json ?? '{}',
      now,
      now
    )

    return this.findById(id)!
  }

  findById(id: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
    if (!row) return null
    return ProjectSchema.parse(row)
  }

  findAll(): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all()
    return rows.map((r) => ProjectSchema.parse(r))
  }

  update(id: string, updates: Partial<CreateProjectInput>): Project | null {
    const existing = this.findById(id)
    if (!existing) return null

    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() }

    const stmt = this.db.prepare(`
      UPDATE projects SET
        name = ?,
        description = ?,
        workspace_path = ?,
        workspace_type = ?,
        icon = ?,
        color = ?,
        settings_json = ?,
        updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      merged.name,
      merged.description ?? null,
      merged.workspace_path ?? null,
      merged.workspace_type ?? 'local',
      merged.icon ?? null,
      merged.color ?? null,
      merged.settings_json ?? '{}',
      merged.updated_at,
      id
    )

    return this.findById(id)
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM projects WHERE id = ?').run(id)
    return result.changes > 0
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM projects').get() as {
      count: number
    }
    return row.count
  }
}
