import type Database from 'better-sqlite3'

export abstract class BaseRepository {
  constructor(protected db: Database.Database) {}
}
