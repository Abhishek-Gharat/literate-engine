const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''
const REQUEST_TIMEOUT = 10000 // 10 seconds

// localStorage key for projects
const PROJECTS_STORAGE_KEY = 'reactviz_local_projects'

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

export async function createProject(name, description = '') {
  // If no backend configured, store in localStorage
  if (!isBackendAvailable()) {
    console.log('[ProjectsAPI] No backend available, storing project in localStorage')

    // Check for duplicate names
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
      _local: true // Mark as local-only project
    }

    existingProjects.push(newProject)
    saveLocalProjects(existingProjects)
    return newProject
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/projects`, {
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
    throw handleApiError(error, 'Failed to create project')
  }
}

export async function listProjects() {
  // If no backend configured, use localStorage
  if (!isBackendAvailable()) {
    console.log('[ProjectsAPI] No backend available, using localStorage')
    const projects = getLocalProjects()
    // Sort by updated_at descending
    return projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/projects`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch projects')
    }

    const data = await response.json()
    return data.projects || []
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch projects')
  }
}

export async function getProject(id) {
  // If no backend configured, use localStorage
  if (!isBackendAvailable()) {
    const projects = getLocalProjects()
    const project = projects.find(p => p.id === id)
    return project || null
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/projects/${id}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || 'Failed to fetch project')
    }

    return response.json()
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch project')
  }
}

/**
 * Update a project's run count - used when creating/deleting runs
 */
export function updateProjectRunCount(projectId, delta) {
  if (isBackendAvailable()) return // Only for localStorage mode

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
