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

export async function listRuns(projectId) {
  // If no backend configured, return empty list for client-side only mode
  if (!isBackendAvailable()) {
    console.log('[RunsAPI] No backend available, returning empty runs list')
    return []
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
  // If no backend configured, return null for client-side only mode
  if (!isBackendAvailable()) {
    console.log('[RunsAPI] No backend available, returning null run')
    return null
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
