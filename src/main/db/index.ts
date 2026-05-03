import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync } from 'fs'

let dbInstance: Database.Database | null = null

function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'database')

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  return join(dbDir, 'agentflow.db')
}

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance
  }

  const dbPath = getDatabasePath()
  dbInstance = new Database(dbPath)

  // Enable WAL mode for better concurrency
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')
  dbInstance.pragma('synchronous = NORMAL')

  return dbInstance
}

export function initDatabase(): Database.Database {
  const db = getDatabase()

  // Run schema (idempotent due to IF NOT EXISTS)
  const schemaPath = join(__dirname, '../../resources/schema.sql')
  let schema: string

  if (existsSync(schemaPath)) {
    schema = readFileSync(schemaPath, 'utf-8')
  } else {
    // Fallback for dev mode - read from src
    const devSchemaPath = join(process.cwd(), 'src/main/db/schema.sql')
    schema = readFileSync(devSchemaPath, 'utf-8')
  }

  db.exec(schema)

  return db
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * Creates an in-memory database for testing.
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')

  const schemaPath = join(process.cwd(), 'src/main/db/schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  return db
}
