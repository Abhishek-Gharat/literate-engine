const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''
const REQUEST_TIMEOUT = 10000 // 10 seconds

/**
 * Check if the backend API is available
 * For Vercel static hosting without a backend, this will be false
 */
export function isBackendAvailable() {
  return API_BASE !== '' || import.meta.env.DEV === true
}

function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ])
}

function handleApiError(error, defaultMessage) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error('Cannot connect to server. Please check if the backend is running.')
  }
  if (error.message === 'Request timed out') {
    return new Error('Request timed out. Please try again.')
  }
  return error
}

export async function createProject(name, description = '') {
  // If no backend configured, return a mock project for client-side only mode
  if (!isBackendAvailable()) {
    console.log('[ProjectsAPI] No backend available, using client-side mock project')
    return {
      id: 'local-' + Date.now(),
      name: name.trim(),
      description: description.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _local: true // Mark as local-only project
    }
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
  // If no backend configured, return empty list for client-side only mode
  if (!isBackendAvailable()) {
    console.log('[ProjectsAPI] No backend available, returning empty project list')
    return []
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
  // If no backend configured and it's a local project, return mock
  if (!isBackendAvailable() && id.startsWith('local-')) {
    return {
      id: id,
      name: 'Local Project',
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _local: true
    }
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
