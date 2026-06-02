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

export async function listRuns(projectId) {
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
