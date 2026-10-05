import { updateProjectRunCount } from './projectsApi'

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_REACTVIZ_API_URL || ''

// localStorage key for runs
const RUNS_STORAGE_KEY = 'reactviz_local_runs'

let backendAvailable = true

/**
 * Check if the backend API is available
 */
export function isBackendAvailable() {
  return backendAvailable
}

function getLocalRuns() {
  try {
    const stored = localStorage.getItem(RUNS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLocalRuns(runs) {
  try {
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs))
  } catch (error) {
    console.error('[RunsAPI] Failed to save runs to localStorage:', error)
  }
}

export function createLocalRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
  const runs = getLocalRuns()
  const now = new Date().toISOString()
  const newRun = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    createdAt: now,
    snapshot,
    stats,
    unresolvedImports: unresolvedImports || [],
    analysisErrors: analysisErrors || [],
  }
  runs.unshift(newRun)
  const trimmedRuns = runs.slice(0, 50)
  saveLocalRuns(trimmedRuns)
  updateProjectRunCount(projectId, 1)
  return newRun
}

// Try a request with fallback to local runs on network failure
async function fetchWithColdStartFallback(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    backendAvailable = true
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    backendAvailable = false
    throw error
  }
}

export async function listRuns(projectId) {
  if (!projectId) return []

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects/${projectId}/runs`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch runs')
    }

    const data = await response.json()
    return data.runs || []
  } catch (error) {
    console.warn('[RunsAPI] Backend unavailable, falling back to local runs:', error.message)
    const allRuns = getLocalRuns()
    const runs = allRuns.filter(r => r.projectId === projectId)
    return runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

export async function getRun(runId) {
  if (!runId) return null

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/runs/${runId}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch run')
    }

    return response.json()
  } catch (error) {
    console.warn('[RunsAPI] Backend unavailable, falling back to local run:', error.message)
    const runs = getLocalRuns()
    const run = runs.find(r => r.id === runId)
    return run || null
  }
}

export async function createRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
  return createLocalRun(projectId, snapshot, stats, unresolvedImports, analysisErrors)
}

export function clearLocalRuns() {
  try {
    localStorage.removeItem(RUNS_STORAGE_KEY)
  } catch (error) {
    console.error('[RunsAPI] Failed to clear local runs:', error)
  }
}
