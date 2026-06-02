import { getDatabase } from './init.js'
import { v4 as uuidv4 } from 'uuid'

// ─── PROJECTS ───────────────────────────────────────

export function createProject(name, description = null) {
  const db = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  try {
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, created_at, updated_at, description)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(id, name, now, now, description)
    return { id, name, created_at: now, updated_at: now, description }
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      const err = new Error('A project with this name already exists.')
      err.code = 'DUPLICATE_PROJECT_NAME'
      throw err
    }
    throw error
  }
}

export function getProject(projectId) {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT id, name, created_at, updated_at, description FROM projects WHERE id = ?
  `)
  return stmt.get(projectId) || null
}

export function listProjects() {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT 
      p.id, p.name, p.created_at, p.updated_at, p.description,
      COUNT(r.id) as runCount
    FROM projects p
    LEFT JOIN analysis_runs r ON p.id = r.project_id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `)
  return stmt.all()
}

// ─── ANALYSIS RUNS ──────────────────────────────────

export function createAnalysisRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
  const db = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  // Verify project exists
  const project = getProject(projectId)
  if (!project) {
    const err = new Error(`Project not found: ${projectId}`)
    err.code = 'PROJECT_NOT_FOUND'
    throw err
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO analysis_runs (id, project_id, created_at, snapshot, stats, unresolved_imports, analysis_errors)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      projectId,
      now,
      JSON.stringify(snapshot),
      JSON.stringify(stats),
      JSON.stringify(unresolvedImports),
      JSON.stringify(analysisErrors)
    )

    // Update project's updated_at
    const updateStmt = db.prepare(`UPDATE projects SET updated_at = ? WHERE id = ?`)
    updateStmt.run(now, projectId)

    return {
      id,
      projectId,
      createdAt: now,
      snapshot,
      stats,
      unresolvedImports,
      analysisErrors,
    }
  } catch (error) {
    throw error
  }
}

export function getAnalysisRun(runId) {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT id, project_id, created_at, snapshot, stats, unresolved_imports, analysis_errors
    FROM analysis_runs
    WHERE id = ?
  `)
  const row = stmt.get(runId)

  if (!row) return null

  return {
    id: row.id,
    projectId: row.project_id,
    createdAt: row.created_at,
    snapshot: JSON.parse(row.snapshot),
    stats: JSON.parse(row.stats),
    unresolvedImports: JSON.parse(row.unresolved_imports),
    analysisErrors: JSON.parse(row.analysis_errors),
  }
}

export function listAnalysisRuns(projectId) {
  const db = getDatabase()

  // Verify project exists
  const project = getProject(projectId)
  if (!project) {
    const err = new Error(`Project not found: ${projectId}`)
    err.code = 'PROJECT_NOT_FOUND'
    throw err
  }

  const stmt = db.prepare(`
    SELECT id, project_id, created_at, stats, unresolved_imports, analysis_errors
    FROM analysis_runs
    WHERE project_id = ?
    ORDER BY created_at DESC
  `)

  const rows = stmt.all(projectId)
  return rows.map(row => ({
    id: row.id,
    projectId: row.project_id,
    createdAt: row.created_at,
    stats: JSON.parse(row.stats),
    unresolvedImports: JSON.parse(row.unresolved_imports),
    analysisErrors: JSON.parse(row.analysis_errors),
  }))
}
