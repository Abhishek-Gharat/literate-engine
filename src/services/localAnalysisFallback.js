export function localFallbackEnabled() {
  return import.meta.env.VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK === 'true' ||
    localStorage.getItem('reactviz_enable_local_fallback') === 'true'
}

export async function analyzeFilesLocally(files) {
  const { analyzeProject } = await import('../analysis/engine.js')
  return analyzeProject(files)
}
