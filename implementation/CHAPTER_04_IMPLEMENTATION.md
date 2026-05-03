# 📘 Chapter 4 Implementation Plan: Local Storage & Database Layer

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 4 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only (not yarn or pnpm) unless the user explicitly says otherwise.
> 6. Run all commands from the project root directory unless specified otherwise.
> 7. After completing this chapter, run the FINAL VERIFICATION at the bottom.
> 8. The chapter is ONLY complete when ALL final verification checks pass.
> 9. **PREREQUISITE:** Chapters 1, 2, and 3 must be fully complete.

---

## 🎯 Chapter 4 Goal

Build a robust local persistence layer using SQLite (better-sqlite3) that all features will rely on. This includes the database schema, migration system, repository pattern, and encrypted storage for secrets.

## 📋 What Will Exist When This Chapter Is Done

- SQLite database initialized at OS-appropriate user data path
- Complete schema with 10 tables (projects, sessions, messages, agents, agent_actions, tool_calls, settings, api_keys, tools, _migrations)
- Migration system with versioning
- Type-safe repository classes for each table using Zod for validation
- Encrypted storage for API keys via Electron's safeStorage
- WAL mode enabled for better concurrency
- All repositories tested with in-memory SQLite

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**
```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

**If errors occur:** STOP. Fix earlier chapter issues first.

---

# 📦 SECTION 2: Install Dependencies

## Task 2.1: Install Database Dependencies

**Command to run:**
```bash
npm install better-sqlite3
```

## Task 2.2: Install Type Definitions

**Command to run:**
```bash
npm install -D @types/better-sqlite3
```

## Task 2.3: Install Validation Library

**Command to run:**
```bash
npm install zod
```

## Task 2.4: Install Native Module Rebuilder

**Command to run:**
```bash
npm install -D electron-rebuild
```

## Task 2.5: Rebuild Native Modules for Electron

**Command to run:**
```bash
npx electron-rebuild
```

**Expected:** `better-sqlite3` is rebuilt against Electron's Node version.

**If error occurs on Windows:** May need to install windows-build-tools. Tell user to run as administrator: `npm install --global windows-build-tools` (note: deprecated but may still work). Alternative: install Visual Studio Build Tools manually.

## Task 2.6: Add Postinstall Hook

**File path:** `package.json`

**Action:** Add a new script in the `scripts` section. Find the line with `"prepare": "husky"` and ADD a new line above it.

**Add this line:**
```json
    "postinstall": "electron-rebuild",
```

**The scripts section should now look like:**
```json
  "scripts": {
    "dev": "electron-vite dev",
    "build": "npm run typecheck && electron-vite build",
    "build:win": "npm run build && electron-builder --win --config",
    "build:mac": "npm run build && electron-builder --mac --config",
    "build:linux": "npm run build && electron-builder --linux --config",
    "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
    "typecheck:web": "tsc --noEmit -p tsconfig.web.json --composite false",
    "typecheck": "npm run typecheck:node && npm run typecheck:web",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "postinstall": "electron-rebuild",
    "prepare": "husky"
  },
```

---

# 📦 SECTION 3: Database Folder Structure

## Task 3.1: Create Database Folders

**Commands to run:**
```bash
mkdir -p src/main/db
mkdir -p src/main/db/migrations
mkdir -p src/main/db/repositories
mkdir -p src/main/services
```

## Task 3.2: Verify Structure

**Command:**
```bash
ls src/main/db
```

**Expected output:** `migrations`, `repositories`

---

# 📦 SECTION 4: Database Schema

## Task 4.1: Create Schema SQL File

**File path:** `src/main/db/schema.sql`

**Action:** Create NEW file with exact content below.

**Exact content:**
```sql
-- Schema version tracking
CREATE TABLE IF NOT EXISTS _migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Projects: top-level containers
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  workspace_path TEXT,
  workspace_type TEXT NOT NULL DEFAULT 'local',
  icon TEXT,
  color TEXT,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions: chat sessions within a project
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Session',
  pinned INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);

-- Messages: chat messages within sessions
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  parent_message_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Agents: agent instances per session
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  parent_agent_id TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  current_action TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agents_session ON agents(session_id);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON agents(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Agent actions: log of what each agent did
CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_actions_agent ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_actions_created ON agent_actions(created_at);

-- Tool calls: invocations of tools by agents
CREATE TABLE IF NOT EXISTS tool_calls (
  id TEXT PRIMARY KEY,
  agent_id TEXT,
  message_id TEXT,
  tool_name TEXT NOT NULL,
  arguments_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  approved_scope TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_agent ON tool_calls(agent_id);

-- Settings: key-value store
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- API keys: encrypted credentials
CREATE TABLE IF NOT EXISTS api_keys (
  provider TEXT PRIMARY KEY,
  encrypted_key TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tools registry
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  version TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL DEFAULT '{}',
  installed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Task 4.2: Verify Schema File

**Command:**
```bash
ls src/main/db/schema.sql
```

---

# 📦 SECTION 5: Database Connection

## Task 5.1: Create Database Module

**File path:** `src/main/db/index.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 5.2: Copy Schema to Build Resources

**File path:** `electron.vite.config.ts`

**Action:** OVERWRITE entire file to include schema copying.

**Exact content:**
```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

function copySchemaPlugin(): { name: string; closeBundle: () => void } {
  return {
    name: 'copy-schema',
    closeBundle(): void {
      const src = resolve('src/main/db/schema.sql')
      const dest = resolve('out/resources/schema.sql')
      const destDir = dirname(dest)
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }
      if (existsSync(src)) {
        copyFileSync(src, dest)
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copySchemaPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
```

---

# 📦 SECTION 6: Migration System

## Task 6.1: Create Migration Runner

**File path:** `src/main/db/migrations/runner.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

---

# 📦 SECTION 7: Shared Types & Schemas

## Task 7.1: Create Database Types

**File path:** `src/shared/db-types.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
import { z } from 'zod'

// Project
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  workspace_path: z.string().nullable().optional(),
  workspace_type: z.enum(['local', 'ssh']).default('local'),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  settings_json: z.string().default('{}'),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({ workspace_type: true, settings_json: true })

export type Project = z.infer<typeof ProjectSchema>
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

// Session
export const SessionSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  title: z.string().default('Untitled Session'),
  pinned: z.number().default(0),
  archived: z.number().default(0),
  metadata_json: z.string().default('{}'),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateSessionSchema = SessionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({ title: true, pinned: true, archived: true, metadata_json: true })

export type Session = z.infer<typeof SessionSchema>
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

// Message
export const MessageSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  parent_message_id: z.string().nullable().optional(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  model: z.string().nullable().optional(),
  tokens_in: z.number().default(0),
  tokens_out: z.number().default(0),
  cost: z.number().default(0),
  metadata_json: z.string().default('{}'),
  created_at: z.string()
})

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true
}).partial({
  parent_message_id: true,
  model: true,
  tokens_in: true,
  tokens_out: true,
  cost: true,
  metadata_json: true
})

export type Message = z.infer<typeof MessageSchema>
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>

// Agent
export const AgentStatus = z.enum(['idle', 'thinking', 'working', 'done', 'failed', 'paused'])

export const AgentSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  parent_agent_id: z.string().nullable().optional(),
  name: z.string(),
  role: z.string(),
  model: z.string(),
  status: AgentStatus.default('idle'),
  current_action: z.string().nullable().optional(),
  tokens_used: z.number().default(0),
  cost: z.number().default(0),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  metadata_json: z.string().default('{}'),
  created_at: z.string()
})

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  created_at: true
}).partial({
  parent_agent_id: true,
  status: true,
  current_action: true,
  tokens_used: true,
  cost: true,
  started_at: true,
  completed_at: true,
  metadata_json: true
})

export type Agent = z.infer<typeof AgentSchema>
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>
export type AgentStatusType = z.infer<typeof AgentStatus>

// Tool Call
export const ToolCallSchema = z.object({
  id: z.string(),
  agent_id: z.string().nullable().optional(),
  message_id: z.string().nullable().optional(),
  tool_name: z.string(),
  arguments_json: z.string().default('{}'),
  result_json: z.string().nullable().optional(),
  approved: z.number().default(0),
  approved_scope: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'failed']).default('pending'),
  error: z.string().nullable().optional(),
  duration_ms: z.number().nullable().optional(),
  created_at: z.string()
})

export type ToolCall = z.infer<typeof ToolCallSchema>

// Settings
export const SettingSchema = z.object({
  key: z.string(),
  value_json: z.string(),
  updated_at: z.string()
})

export type Setting = z.infer<typeof SettingSchema>
```

---

# 📦 SECTION 8: ID Generator Utility

## Task 8.1: Create ID Utility

**File path:** `src/main/utils/ids.ts`

**Command first:**
```bash
mkdir -p src/main/utils
```

**Action:** Create NEW file.

**Exact content:**
```typescript
import { randomBytes } from 'crypto'

/**
 * Generates a URL-safe unique ID.
 * Format: {prefix}_{12 random hex chars}
 */
export function generateId(prefix: string): string {
  const random = randomBytes(6).toString('hex')
  return `${prefix}_${random}`
}

export const ID_PREFIXES = {
  PROJECT: 'prj',
  SESSION: 'ses',
  MESSAGE: 'msg',
  AGENT: 'agt',
  ACTION: 'act',
  TOOL_CALL: 'tlc',
  TOOL: 'tol'
} as const
```

---

# 📦 SECTION 9: Repository Pattern

## Task 9.1: Create Base Repository

**File path:** `src/main/db/repositories/BaseRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
import type Database from 'better-sqlite3'

export abstract class BaseRepository {
  constructor(protected db: Database.Database) {}
}
```

## Task 9.2: Create Project Repository

**File path:** `src/main/db/repositories/ProjectRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
    const rows = this.db
      .prepare('SELECT * FROM projects ORDER BY updated_at DESC')
      .all()
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
```

## Task 9.3: Create Session Repository

**File path:** `src/main/db/repositories/SessionRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 9.4: Create Message Repository

**File path:** `src/main/db/repositories/MessageRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 9.5: Create Agent Repository

**File path:** `src/main/db/repositories/AgentRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 9.6: Create Settings Repository

**File path:** `src/main/db/repositories/SettingsRepository.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 9.7: Create Repositories Index

**File path:** `src/main/db/repositories/index.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

---

# 📦 SECTION 10: Encrypted Storage for Secrets

## Task 10.1: Create Secret Storage Service

**File path:** `src/main/services/SecretStorage.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
    const row = this.db
      .prepare('SELECT 1 FROM api_keys WHERE provider = ?')
      .get(provider)
    return !!row
  }

  deleteApiKey(provider: string): boolean {
    const result = this.db
      .prepare('DELETE FROM api_keys WHERE provider = ?')
      .run(provider)
    return result.changes > 0
  }

  listProviders(): string[] {
    const rows = this.db
      .prepare('SELECT provider FROM api_keys ORDER BY provider')
      .all() as Array<{ provider: string }>
    return rows.map((r) => r.provider)
  }
}
```

---

# 📦 SECTION 11: Initialize Database on Startup

## Task 11.1: Update Main Entry to Init DB

**File path:** `src/main/index.ts`

**Action:** OVERWRITE entire file.

**Exact content:**
```typescript
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, focusMainWindow } from './window'
import { registerWindowHandlers, attachWindowStateEvents } from './ipcHandlers'
import { initDatabase, closeDatabase } from './db'
import { runMigrations } from './db/migrations/runner'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.agentflow.manager')

    // Initialize database
    try {
      const db = initDatabase()
      runMigrations(db)
      console.info('Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerWindowHandlers()

    const mainWindow = createMainWindow()
    attachWindowStateEvents(mainWindow)

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        const newWindow = createMainWindow()
        attachWindowStateEvents(newWindow)
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    closeDatabase()
  })
}
```

---

# 📦 SECTION 12: Tests

## Task 12.1: Create Repository Tests

**File path:** `tests/unit/repositories.test.ts`

**Action:** Create NEW file.

**Exact content:**
```typescript
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
```

## Task 12.2: Update Vitest Config to Allow Better-SQLite3

**File path:** `vitest.config.ts`

**Action:** OVERWRITE entire file.

**Exact content:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'out', 'release'],
    server: {
      deps: {
        inline: ['better-sqlite3']
      }
    }
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('src/shared'),
      '@main': resolve('src/main')
    }
  }
})
```

---

# 📦 SECTION 13: Verification

## Task 13.1: Type Check

```bash
npm run typecheck
```

**Expected:** Exit code 0.

## Task 13.2: Lint

```bash
npm run lint
```

## Task 13.3: Format

```bash
npm run format
```

## Task 13.4: Run Tests

```bash
npm run test:run
```

**Expected:** All tests pass (App tests + new repository tests). Should be ~20+ tests now.

## Task 13.5: Production Build

```bash
npm run build
```

**Expected:** Builds successfully. Schema file copied to `out/resources/schema.sql`.

**Verify:**
```bash
ls out/resources/schema.sql
```

## Task 13.6: Launch Dev Mode

```bash
npm run dev
```

**Expected:** App launches, terminal shows "Database initialized successfully".

**🛑 USER VERIFICATION REQUIRED:**
- [ ] App launches without errors
- [ ] Terminal/console shows "Database initialized successfully"
- [ ] Component Showcase still visible
- [ ] No errors in DevTools console

**Stop the app after verification.**

---

# 📦 SECTION 14: Git Commit

```bash
git add .
git commit -m "feat: SQLite database layer with repositories (Chapter 4)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: All DB files exist
```bash
ls src/main/db/index.ts src/main/db/schema.sql src/main/db/migrations/runner.ts
```

## ✅ Check 2: All repository files exist
```bash
ls src/main/db/repositories/ProjectRepository.ts src/main/db/repositories/SessionRepository.ts src/main/db/repositories/MessageRepository.ts src/main/db/repositories/AgentRepository.ts src/main/db/repositories/SettingsRepository.ts
```

## ✅ Check 3: Shared types exist
```bash
ls src/shared/db-types.ts src/main/utils/ids.ts src/main/services/SecretStorage.ts
```

## ✅ Check 4: TypeScript compiles
```bash
npm run typecheck
```

## ✅ Check 5: Lint passes
```bash
npm run lint
```

## ✅ Check 6: Tests pass
```bash
npm run test:run
```

## ✅ Check 7: Build works with schema copy
```bash
npm run build && ls out/resources/schema.sql
```

## ✅ Check 8: Dev mode initializes DB (user confirmed)

## ✅ Check 9: Git commit
```bash
git log --oneline
```

## ✅ Check 10: Database file created
```bash
npm run dev
```
Then close and check that DB file was created. On Windows: `%APPDATA%\agent-flow-manager\database\agentflow.db`. On Linux: `~/.config/agent-flow-manager/database/agentflow.db`. On macOS: `~/Library/Application Support/agent-flow-manager/database/agentflow.db`.

---

# 📊 Chapter 4 Completion Report

```
✅ Chapter 4: Local Storage & Database Layer - COMPLETE

Acceptance Criteria Met:
✅ better-sqlite3 integrated and rebuilt for Electron
✅ Database initialized at user data path
✅ WAL mode enabled
✅ All 10 schema tables created
✅ Migration system in place
✅ 5 repository classes (Project, Session, Message, Agent, Settings)
✅ Zod validation on all inputs
✅ Encrypted API key storage via safeStorage
✅ ID generator utility
✅ All repository tests passing
✅ Schema copied to build output

Ready to proceed to Chapter 5: State Management Architecture.
```

---

# 🚨 Troubleshooting

## "Cannot find module better-sqlite3"
Run `npx electron-rebuild` again.

## Tests fail with "better-sqlite3 was compiled against different Node version"
Run `npm rebuild better-sqlite3` (without electron-rebuild for tests).

## Database file not created
Check `app.getPath('userData')` returns valid path. Verify write permissions.

## Schema errors
Verify `schema.sql` syntax is valid SQLite. Test with `sqlite3` CLI if available.

---

**End of Chapter 4 Implementation Plan**
