import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '../../data/reactviz.db')

let db = null

export function initializeDatabase() {
  // If already initialized, return it (idempotent)
  if (db) {
    return db
  }

  try {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // Create projects table
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        description TEXT
      )
    `)

    // Create analysis_runs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS analysis_runs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        snapshot TEXT NOT NULL,
        stats TEXT NOT NULL,
        unresolved_imports TEXT NOT NULL,
        analysis_errors TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // Create index for faster queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_runs_project ON analysis_runs(project_id)
    `)

    console.log(`[DB] Initialized at ${dbPath}`)
    return db
  } catch (error) {
    console.error('[DB] Initialization failed:', error.message)
    throw new Error(`Database initialization failed: ${error.message}`)
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
