/**
 * Compare two runs to show changes between them
 * Returns a summary of files added, removed, and metric changes
 */
export function compareRuns(currentRun, previousRun) {
  if (!currentRun || !previousRun) {
    return null
  }

  const current = extractRunData(currentRun)
  const previous = extractRunData(previousRun)

  // Compare file lists
  const currentFiles = new Set(current.files)
  const previousFiles = new Set(previous.files)

  const addedFiles = [...currentFiles].filter(f => !previousFiles.has(f))
  const removedFiles = [...previousFiles].filter(f => !currentFiles.has(f))

  // Compare cyclic dependencies
  const currentCycles = new Set(current.cyclicEdges.map(edgeKey))
  const previousCycles = new Set(previous.cyclicEdges.map(edgeKey))

  const newCycles = [...currentCycles]
    .filter(c => !previousCycles.has(c))
    .map(c => parseEdgeKey(c))

  const resolvedCycles = [...previousCycles]
    .filter(c => !currentCycles.has(c))
    .map(c => parseEdgeKey(c))

  // Check if there are any meaningful changes
  const hasFileChanges = addedFiles.length > 0 || removedFiles.length > 0
  const hasMetricChanges = (
    current.totalFiles !== previous.totalFiles ||
    current.totalComponents !== previous.totalComponents ||
    current.totalHooks !== previous.totalHooks ||
    current.totalContexts !== previous.totalContexts ||
    current.totalPages !== previous.totalPages ||
    current.totalConfigs !== previous.totalConfigs
  )
  const hasCycleChanges = newCycles.length > 0 || resolvedCycles.length > 0

  const hasSignificantChanges = hasFileChanges || hasMetricChanges || hasCycleChanges

  return {
    hasPreviousRun: true,
    hasSignificantChanges,
    fileChanges: {
      added: addedFiles,
      removed: removedFiles,
      totalChange: current.totalFiles - previous.totalFiles,
      currentTotal: current.totalFiles,
      previousTotal: previous.totalFiles
    },
    metricChanges: {
      totalFiles: current.totalFiles - previous.totalFiles,
      totalComponents: current.totalComponents - previous.totalComponents,
      totalHooks: current.totalHooks - previous.totalHooks,
      totalContexts: current.totalContexts - previous.totalContexts,
      totalPages: current.totalPages - previous.totalPages,
      totalConfigs: current.totalConfigs - previous.totalConfigs
    },
    cycleChanges: {
      new: newCycles,
      resolved: resolvedCycles,
      currentCount: current.cyclicEdges.length,
      previousCount: previous.cyclicEdges.length
    },
    previousRunDate: previousRun.createdAt
  }
}

function extractRunData(run) {
  const snapshot = run?.snapshot || {}
  const stats = run?.stats || snapshot?.stats || {}

  // Extract file list from nodes
  const nodes = snapshot.nodes || []
  const files = nodes.map(n => n.data?.label || n.data?.path || n.id).filter(Boolean)

  // Extract stats with fallbacks
  const totalFiles = stats.totalFiles ?? snapshot.totalFiles ?? files.length ?? 0
  const totalComponents = stats.totalComponents ?? snapshot.totalComponents ?? 0
  const totalHooks = stats.totalHooks ?? snapshot.totalHooks ?? 0
  const totalContexts = stats.totalContexts ?? snapshot.totalContexts ?? 0
  const totalPages = stats.totalPages ?? snapshot.totalPages ?? 0
  const totalConfigs = stats.totalConfigs ?? snapshot.totalConfigs ?? 0

  // Extract cyclic edges
  const cyclicEdges = snapshot.cyclicEdges || []

  // Calculate total structure count for component-based metrics
  const totalStructure = totalComponents + totalHooks + totalContexts + totalPages + totalConfigs

  return {
    files,
    totalFiles,
    totalComponents,
    totalHooks,
    totalContexts,
    totalPages,
    totalConfigs,
    totalStructure,
    cyclicEdges
  }
}

// Create a consistent string key for edge comparison
function edgeKey(edge) {
  const source = edge.source || edge.from || edge.id?.split('-')[0] || ''
  const target = edge.target || edge.to || edge.id?.split('-')[1] || ''
  return `${source}→${target}`
}

// Parse edge key back to object
function parseEdgeKey(key) {
  const [source, target] = key.split('→')
  return { source, target }
}

// Get the previous run from a sorted list of runs
export function getPreviousRun(runs, currentRunId, projectId) {
  if (!runs || runs.length < 2) return null

  // Filter by project and sort by date
  const projectRuns = runs
    .filter(r => r.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const currentIndex = projectRuns.findIndex(r => r.id === currentRunId)
  if (currentIndex === -1 || currentIndex >= projectRuns.length - 1) {
    return null
  }

  return projectRuns[currentIndex + 1]
}
