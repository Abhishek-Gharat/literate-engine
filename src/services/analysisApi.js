const DEFAULT_ANALYSIS_PATH = '/api/analysis'

function apiBaseUrl() {
  return import.meta.env.VITE_REACTVIZ_API_URL || ''
}

function analysisEndpoint() {
  return `${apiBaseUrl()}${DEFAULT_ANALYSIS_PATH}`
}

export function validateAnalysisResponse(payload) {
  const valid =
    payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.nodes) &&
    Array.isArray(payload.edges) &&
    payload.depMap &&
    typeof payload.depMap === 'object' &&
    Array.isArray(payload.cyclicEdges) &&
    payload.stats &&
    typeof payload.stats === 'object' &&
    Array.isArray(payload.unresolvedImports) &&
    Array.isArray(payload.analysisErrors)

  if (!valid) {
    throw new Error('Analysis API returned an invalid response shape.')
  }

  return payload
}

export async function analyzeFilesWithApi(files, projectId = null) {
  let response

  const requestBody = { files }
  if (projectId) {
    requestBody.projectId = projectId
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    response = await fetch(analysisEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Analysis API timed out after 5 seconds')
    }
    throw new Error(`Analysis API is unavailable: ${error.message}`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Analysis API returned a non-JSON response.')
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Analysis API request failed.')
  }

  return validateAnalysisResponse(payload)
}
