/**
 * Check if local analysis fallback is enabled
 * For Vercel deployment, this should be true by default since
 * the backend API won't be available on static hosting.
 */
export function localFallbackEnabled() {
  // Default to true if not explicitly set (for Vercel deployment compatibility)
  const envEnabled = import.meta.env.VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK
  if (envEnabled === undefined) {
    return true // Default to local analysis for Vercel static hosting
  }
  return envEnabled === 'true' ||
    localStorage.getItem('reactviz_enable_local_fallback') === 'true'
}

export async function analyzeFilesLocally(files) {
  const { analyzeProject } = await import('../analysis/engine.js')
  return analyzeProject(files)
}
