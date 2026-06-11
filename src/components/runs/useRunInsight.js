/**
 * useRunInsight - Hook for generating run insights
 * 
 * @param {Object} stats - Run statistics
 * @returns {string} Generated insight
 */
export function useRunInsight(stats) {
  const totalFiles = stats?.totalFiles || 0
  const totalComponents = stats?.totalComponents || 0

  if (totalFiles === 0 && totalComponents === 0) return 'No data available'
  const componentRatio = totalFiles > 0 ? totalComponents / totalFiles : 0
  
  if (totalFiles < 10) {
    return componentRatio > 0.5 
      ? 'Small project with high component density' 
      : 'Small project'
  } else if (totalFiles < 50) {
    return componentRatio > 0.7 
      ? 'Medium project, component-heavy' 
      : 'Medium complexity project'
  } else {
    return componentRatio > 0.6 
      ? 'Large project with rich component graph' 
      : 'Large component graph'
  }
}
