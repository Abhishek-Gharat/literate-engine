import { updateProjectRunCount } from './projectsApi'

const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''
const REQUEST_TIMEOUT = 10000 // 10 seconds

// localStorage key for runs
const RUNS_STORAGE_KEY = 'reactviz_local_runs'

/**
 * Check if the backend API is available
 * For Vercel static hosting without a backend, this will be false
 */
export function isBackendAvailable() {
  // Backend is available only if VITE_REACTVIZ_API_URL is explicitly set
  // DEV mode alone doesn't mean the backend is running
  return API_BASE !== ''
}

/**
 * Get all runs from localStorage
 */
function getLocalRuns() {
  try {
    const stored = localStorage.getItem(RUNS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save runs to localStorage
 */
function saveLocalRuns(runs) {
  try {
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs))
  } catch (error) {
    console.error('[RunsAPI] Failed to save runs to localStorage:', error)
  }
}

/**
 * Create a new run in localStorage
 */
function createLocalRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
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
  // Keep only last 50 runs to prevent localStorage overflow
  const trimmedRuns = runs.slice(0, 50)
  saveLocalRuns(trimmedRuns)

  // Update project's run count
  updateProjectRunCount(projectId, 1)

  return newRun
}

function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ])
}

function handleApiError(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error('Cannot connect to server. Please check if the backend is running.')
  }
  if (error.message === 'Request timed out') {
    return new Error('Request timed out. Please try again.')
  }
  return error
}

export async function listRuns(projectId) {
  // If no backend configured, use localStorage
  if (!isBackendAvailable()) {
    console.log('[RunsAPI] No backend available, using localStorage')
    const allRuns = getLocalRuns()
    // Filter by projectId if provided
    const runs = projectId ? allRuns.filter(r => r.projectId === projectId) : allRuns
    return runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/projects/${projectId}/runs`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch runs')
    }

    const data = await response.json()
    return data.runs || []
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch runs')
  }
}

export async function getRun(runId) {
  // If no backend configured, use localStorage
  if (!isBackendAvailable()) {
    console.log('[RunsAPI] No backend available, using localStorage')
    const runs = getLocalRuns()
    const run = runs.find(r => r.id === runId)
    return run || null
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/runs/${runId}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch run')
    }

    return response.json()
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch run')
  }
}

/**
 * Create a new run - used when running in local/client-side mode
 * This function should be called after local analysis is complete
 */
export async function createRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
  // If backend is available, this shouldn't be called directly
  // The backend creates runs automatically during analysis
  if (isBackendAvailable()) {
    console.log('[RunsAPI] Backend is available, run should be created via analysis API')
    return null
  }

  // Create run in localStorage
  const run = createLocalRun(projectId, snapshot, stats, unresolvedImports, analysisErrors)
  console.log('[RunsAPI] Created local run:', run.id)
  return run
}

/**
 * Clear all local runs (for debugging/testing)
 */
export function clearLocalRuns() {
  try {
    localStorage.removeItem(RUNS_STORAGE_KEY)
    console.log('[RunsAPI] Cleared all local runs')
  } catch (error) {
    console.error('[RunsAPI] Failed to clear local runs:', error)
  }
}
