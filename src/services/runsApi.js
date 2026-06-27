import { updateProjectRunCount } from './projectsApi'

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_REACTVIZ_API_URL || ''

// localStorage key for runs
const RUNS_STORAGE_KEY = 'reactviz_local_runs'

let hasHadSuccessfulBackendCall = false

/**
 * Check if the backend API is available
 */
export function isBackendAvailable() {
  return API_BASE !== ''
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
  const trimmedRuns = runs.slice(0, 50)
  saveLocalRuns(trimmedRuns)
  updateProjectRunCount(projectId, 1)
  return newRun
}

// Try a request with fallback to a longer timeout for Render cold starts
async function fetchWithColdStartFallback(url, options = {}) {
  const activeTimeout = hasHadSuccessfulBackendCall ? 10000 : 20000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), activeTimeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    hasHadSuccessfulBackendCall = true
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      if (!hasHadSuccessfulBackendCall) {
        const retryController = new AbortController()
        const retryTimeout = setTimeout(() => retryController.abort(), 60000)
        try {
          const response = await fetch(url, {
            ...options,
            signal: retryController.signal,
          })
          clearTimeout(retryTimeout)
          hasHadSuccessfulBackendCall = true
          return response
        } catch {
          clearTimeout(retryTimeout)
          throw new Error('Request timed out. Please try again.')
        }
      }
      throw new Error('Request timed out. Please try again.')
    }
    throw error
  }
}

function handleApiError(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error('Cannot connect to server. Please check if the backend is running.')
  }
  if (error.message === 'Request timed out' || error.message.includes('timed out')) {
    return new Error('Request timed out. Please try again.')
  }
  return error
}

export async function listRuns(projectId) {
  if (!isBackendAvailable()) {
    const allRuns = getLocalRuns()
    const runs = projectId ? allRuns.filter(r => r.projectId === projectId) : allRuns
    return runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects/${projectId}/runs`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch runs')
    }

    const data = await response.json()
    return data.runs || []
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getRun(runId) {
  if (isBackendAvailable()) {
    const runs = getLocalRuns()
    const run = runs.find(r => r.id === runId)
    return run || null
  }

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/runs/${runId}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch run')
    }

    return response.json()
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function createRun(projectId, snapshot, stats, unresolvedImports, analysisErrors) {
  if (isBackendAvailable()) {
    return null
  }

  const run = createLocalRun(projectId, snapshot, stats, unresolvedImports, analysisErrors)
  return run
}

export function clearLocalRuns() {
  try {
    localStorage.removeItem(RUNS_STORAGE_KEY)
  } catch (error) {
    console.error('[RunsAPI] Failed to clear local runs:', error)
  }
}
