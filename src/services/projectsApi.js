const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''

// Render free tier can take up to 50s to wake up from sleep
// Use a longer timeout for initial startup requests
const REQUEST_TIMEOUT = 60000
const LONG_TIMEOUT = 15000

// localStorage key for projects
const PROJECTS_STORAGE_KEY = 'reactviz_local_projects'

// Flag to track whether we've successfully hit the backend once
let hasHadSuccessfulBackendCall = false

/**
 * Check if the backend API is available
 */
export function isBackendAvailable() {
  return API_BASE !== ''
}

/**
 * Get all projects from localStorage
 */
function getLocalProjects() {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save projects to localStorage
 */
function saveLocalProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  } catch (error) {
    console.error('[ProjectsAPI] Failed to save projects to localStorage:', error)
  }
}

function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const opts = {
    ...options,
    signal: options?.signal ? options.signal : controller.signal,
  }

  if (!opts.signal || opts.signal === controller.signal) {
    opts.signal = controller.signal
  }

  return fetch(url, opts).finally(() => clearTimeout(timeoutId))
}

function timeoutPromise(timeout) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  )
}

function handleApiError(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error('Cannot connect to server. Please check if the backend is running.')
  }
  if (error.message === 'Request timed out') {
    return new Error('Request timed out. Please try again.')
  }
  if (error.name === 'AbortError') {
    return new Error('Request timed out. Please try again.')
  }
  return error
}

// Try a request with fallback to a longer timeout for Render cold starts
async function fetchWithColdStartFallback(url, options = {}) {
  const { timeout, retries, ...fetchOptions } = options
  const activeTimeout = timeout || (hasHadSuccessfulBackendCall ? REQUEST_TIMEOUT : 20000)
  const controller = new AbortController()

  const timeoutId = setTimeout(() => controller.abort(), activeTimeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    hasHadSuccessfulBackendCall = true
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      // For the first request, retry once with a longer timeout
      if (!hasHadSuccessfulBackendCall) {
        const retryController = new AbortController()
        const retryTimeout = setTimeout(() => retryController.abort(), 60000)
        try {
          const response = await fetch(url, {
            ...fetchOptions,
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

export async function createProject(name, description = '') {
  if (!isBackendAvailable()) {
    const existingProjects = getLocalProjects()
    const trimmedName = name.trim()
    if (existingProjects.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      const err = new Error('A project with this name already exists.')
      err.code = 'DUPLICATE_PROJECT_NAME'
      throw err
    }

    const now = new Date().toISOString()
    const newProject = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: trimmedName,
      description: description.trim() || null,
      created_at: now,
      updated_at: now,
      runCount: 0,
      _local: true
    }

    existingProjects.push(newProject)
    saveLocalProjects(existingProjects)
    return newProject
  }

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to create project')
    }

    return response.json()
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function listProjects() {
  if (!isBackendAvailable()) {
    const projects = getLocalProjects()
    return projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  }

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch projects')
    }

    const data = await response.json()
    return data.projects || []
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getProject(id) {
  if (!isBackendAvailable()) {
    const projects = getLocalProjects()
    const project = projects.find(p => p.id === id)
    return project || null
  }

  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects/${id}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch project')
    }

    return response.json()
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update a project's run count - used when creating/deleting runs
 */
export function updateProjectRunCount(projectId, delta) {
  if (isBackendAvailable()) return

  const projects = getLocalProjects()
  const project = projects.find(p => p.id === projectId)
  if (project) {
    project.runCount = Math.max(0, (project.runCount || 0) + delta)
    project.updated_at = new Date().toISOString()
    saveLocalProjects(projects)
  }
}

/**
 * Clear all local projects (for debugging/testing)
 */
export function clearLocalProjects() {
  try {
    localStorage.removeItem(PROJECTS_STORAGE_KEY)
    console.log('[ProjectsAPI] Cleared all local projects')
  } catch (error) {
    console.error('[ProjectsAPI] Failed to clear local projects:', error)
  }
}
