import { BaseRepository } from './BaseRepository'

export class SettingsRepository extends BaseRepository {
  get<T = unknown>(key: string): T | null {
    const row = this.db
      .prepare('SELECT value_json FROM settings WHERE key = ?')
      .get(key) as { value_json: string } | undefined

    if (!row) return null

    try {
      return JSON.parse(row.value_json) as T
    } catch {
      return null
    }
  }

  set<T = unknown>(key: string, value: T): void {
    const json = JSON.stringify(value)
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`
      )
      .run(key, json, now)
  }

  delete(key: string): boolean {
    const result = this.db.prepare('DELETE FROM settings WHERE key = ?').run(key)
    return result.changes > 0
  }

  getAll(): Record<string, unknown> {
    const rows = this.db.prepare('SELECT key, value_json FROM settings').all() as Array<{
      key: string
      value_json: string
    }>

    const result: Record<string, unknown> = {}
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value_json)
      } catch {
        result[row.key] = null
      }
    }
    return result
  }
}
