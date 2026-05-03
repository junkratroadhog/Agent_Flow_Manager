import type Database from 'better-sqlite3'

export interface Migration {
  version: number
  name: string
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  // Add future migrations here, e.g.:
  // {
  //   version: 1,
  //   name: 'add_user_preferences',
  //   up: (db) => {
  //     db.exec('ALTER TABLE settings ADD COLUMN ...')
  //   }
  // }
]

export function runMigrations(db: Database.Database): void {
  // Get current version
  const row = db
    .prepare('SELECT MAX(version) as version FROM _migrations')
    .get() as { version: number | null }
  const currentVersion = row?.version ?? 0

  const pending = migrations.filter((m) => m.version > currentVersion)

  if (pending.length === 0) {
    return
  }

  const insertMigration = db.prepare(
    'INSERT INTO _migrations (version, name) VALUES (?, ?)'
  )

  for (const migration of pending) {
    const transaction = db.transaction(() => {
      migration.up(db)
      insertMigration.run(migration.version, migration.name)
    })
    transaction()
  }
}

export function getCurrentVersion(db: Database.Database): number {
  const row = db
    .prepare('SELECT MAX(version) as version FROM _migrations')
    .get() as { version: number | null }
  return row?.version ?? 0
}
