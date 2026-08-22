/**
 * Health Score Utilities
 * Computes a 0-100 architecture health score for an analysis graph.
 * Dependency-free so both the server (analysis engine) and the client can use it.
 */

export const GOD_FAN_IN_THRESHOLD = 8
export const GOD_FAN_OUT_THRESHOLD = 15
export const MAX_SCORE = 100

/**
 * Compute the architecture health score for a run.
 *
 * @param {Object} input
 * @param {Array} input.nodes - Analysis nodes ({ id, type, isGhost, imports, importedBy })
 * @param {Array} input.cyclicEdges - Edge pairs flagged as cyclic
 * @param {number} [input.unresolvedImports] - Count of unresolved import statements
 * @returns {{ score: number|null, grade: string|null, breakdown: Array, metrics: Object }}
 */
export function computeHealthScore({ nodes = [], cyclicEdges = [], unresolvedImports = 0, deadExportCount = 0 } = {}) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter(Boolean) : []
  const files = safeNodes.filter((node) => !node.isGhost)
  const totalFiles = files.length
  const edgeCount = safeNodes.reduce((sum, node) => sum + (node.imports?.length || 0), 0)
  const cycles = cyclicEdges.length > 0 ? Math.round(cyclicEdges.length / 2) : 0
  const orphans = files.filter(isOrphan).length
  const godComponents = files.filter(isGodComponent).length
  const avgCoupling = totalFiles > 0 ? Math.round((edgeCount / totalFiles) * 10) / 10 : 0

  const metrics = {
    totalFiles,
    cycles,
    orphans,
    godComponents,
    avgCoupling,
    unresolvedImports,
    deadExports: deadExportCount,
  }

  if (totalFiles === 0) {
    return { score: null, grade: null, breakdown: [], metrics }
  }

  const orphanRatio = orphans / totalFiles

  const penalties = [
    { id: 'cycles', penalty: Math.min(cycles * 8, 32) },
    { id: 'orphans', penalty: Math.min(Math.round(orphanRatio * 20), 20) },
    { id: 'godComponents', penalty: Math.min(godComponents * 6, 18) },
    { id: 'coupling', penalty: avgCoupling > 3 ? Math.min(Math.round(avgCoupling - 3) * 4, 10) : 0 },
    { id: 'deadExports', penalty: Math.min(deadExportCount * 2, 10) },
    { id: 'unresolved', penalty: Math.min(unresolvedImports, 10) },
  ]
  const totalPenalty = penalties.reduce((sum, p) => sum + p.penalty, 0)
  const score = Math.max(0, Math.min(MAX_SCORE, Math.round(MAX_SCORE - totalPenalty)))

  const breakdown = [
    {
      id: 'cycles',
      label: 'Circular dependencies',
      value: `${cycles}`,
      detail: 'Import cycles between files',
      status: cycles === 0 ? 'good' : cycles <= 2 ? 'warn' : 'bad',
    },
    {
      id: 'orphans',
      label: 'Orphan files',
      value: `${orphans}`,
      detail: 'Nothing imports them and they import nothing',
      status: orphanRatio === 0 ? 'good' : orphanRatio <= 0.15 ? 'warn' : 'bad',
    },
    {
      id: 'godComponents',
      label: 'God components',
      value: `${godComponents}`,
      detail: `Fan-in ≥ ${GOD_FAN_IN_THRESHOLD} or fan-out ≥ ${GOD_FAN_OUT_THRESHOLD}`,
      status: godComponents === 0 ? 'good' : godComponents <= 1 ? 'warn' : 'bad',
    },
    {
      id: 'coupling',
      label: 'Avg coupling',
      value: `${avgCoupling}`,
      detail: 'Imports per file',
      status: avgCoupling <= 2.5 ? 'good' : avgCoupling <= 4 ? 'warn' : 'bad',
    },
    {
      id: 'deadExports',
      label: 'Dead exports',
      value: `${deadExportCount}`,
      detail: 'Exported symbols nothing imports',
      status: deadExportCount === 0 ? 'good' : deadExportCount <= 3 ? 'warn' : 'bad',
    },
    {
      id: 'unresolved',
      label: 'Unresolved imports',
      value: `${unresolvedImports}`,
      detail: 'Imports that could not be mapped to a file',
      status: unresolvedImports === 0 ? 'good' : unresolvedImports <= 3 ? 'warn' : 'bad',
    },
  ]

  return { score, grade: scoreToGrade(score), breakdown, metrics }
}

function isOrphan(node) {
  return (node.imports?.length || 0) === 0 && (node.importedBy?.length || 0) === 0
}

function isGodComponent(node) {
  return (
    (node.importedBy?.length || 0) >= GOD_FAN_IN_THRESHOLD ||
    (node.imports?.length || 0) >= GOD_FAN_OUT_THRESHOLD
  )
}

export function scoreToGrade(score) {
  if (typeof score !== 'number') return null
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function getHealthColor(score) {
  if (typeof score !== 'number') return '#a1a1a1'
  if (score >= 85) return '#0cce6b'
  if (score >= 70) return '#a3e635'
  if (score >= 55) return '#f5a623'
  if (score >= 40) return '#fb923c'
  return '#ff5c5c'
}
