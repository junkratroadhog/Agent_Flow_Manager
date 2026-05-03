import { safeStorage } from 'electron'
import type Database from 'better-sqlite3'

export class SecretStorage {
  constructor(private db: Database.Database) {}

  isAvailable(): boolean {
    return safeStorage.isEncryptionAvailable()
  }

  setApiKey(provider: string, key: string): void {
    if (!this.isAvailable()) {
      throw new Error('Encryption is not available on this system')
    }

    const encrypted = safeStorage.encryptString(key)
    const encryptedBase64 = encrypted.toString('base64')
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO api_keys (provider, encrypted_key, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(provider) DO UPDATE SET encrypted_key = excluded.encrypted_key, updated_at = excluded.updated_at`
      )
      .run(provider, encryptedBase64, now, now)
  }

  getApiKey(provider: string): string | null {
    const row = this.db
      .prepare('SELECT encrypted_key FROM api_keys WHERE provider = ?')
      .get(provider) as { encrypted_key: string } | undefined

    if (!row) return null

    if (!this.isAvailable()) {
      return null
    }

    try {
      const buffer = Buffer.from(row.encrypted_key, 'base64')
      return safeStorage.decryptString(buffer)
    } catch {
      return null
    }
  }

  hasApiKey(provider: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM api_keys WHERE provider = ?').get(provider)
    return !!row
  }

  deleteApiKey(provider: string): boolean {
    const result = this.db.prepare('DELETE FROM api_keys WHERE provider = ?').run(provider)
    return result.changes > 0
  }

  listProviders(): string[] {
    const rows = this.db.prepare('SELECT provider FROM api_keys ORDER BY provider').all() as Array<{
      provider: string
    }>
    return rows.map((r) => r.provider)
  }
}
