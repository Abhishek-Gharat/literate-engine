const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''

// Default timeout for API requests (fast failure for offline detection)
const REQUEST_TIMEOUT = 10000

// localStorage key for projects
const PROJECTS_STORAGE_KEY = 'reactviz_local_projects'

// Track backend availability dynamically
let backendAvailable = true

/**
 * Check if the backend API is available
 */
export function isBackendAvailable() {
  return backendAvailable
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

// Try a request with fallback to local storage on network error
async function fetchWithColdStartFallback(url, options = {}) {
  const { timeout, ...fetchOptions } = options
  const activeTimeout = timeout || REQUEST_TIMEOUT
  const controller = new AbortController()

  const timeoutId = setTimeout(() => controller.abort(), activeTimeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    backendAvailable = true
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    backendAvailable = false
    throw handleApiError(error)
  }
}

export async function createProject(name, description = '') {
  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      const err = new Error(error.error?.message || 'Failed to create project')
      if (error.error?.code) err.code = error.error.code
      throw err
    }

    return response.json()
  } catch (error) {
    if (error.code === 'DUPLICATE_PROJECT_NAME' || (error.message && error.message.includes('already exists'))) {
      throw error
    }
    console.warn('[ProjectsAPI] Backend unavailable, falling back to local storage:', error.message)
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
}

export async function listProjects() {
  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch projects')
    }

    const data = await response.json()
    return data.projects || []
  } catch (error) {
    console.warn('[ProjectsAPI] Backend unavailable, falling back to local projects:', error.message)
    const projects = getLocalProjects()
    return projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  }
}

export async function getProject(id) {
  try {
    const response = await fetchWithColdStartFallback(`${API_BASE}/api/projects/${id}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch project')
    }

    return response.json()
  } catch (error) {
    console.warn('[ProjectsAPI] Backend unavailable, falling back to local project:', error.message)
    const projects = getLocalProjects()
    const project = projects.find(p => p.id === id)
    return project || null
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
