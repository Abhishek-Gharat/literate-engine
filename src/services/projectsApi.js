const API_BASE = import.meta.env.VITE_REACTVIZ_API_URL || ''
const REQUEST_TIMEOUT = 10000 // 10 seconds

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
