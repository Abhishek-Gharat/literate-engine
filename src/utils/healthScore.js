/**
 * Health Score Utilities
 * Computes a 0-100 architecture health score for an analysis graph.
 * Dependency-free so both the server (analysis engine) and the client can use it.
 */

import { countCycles, normalizeCyclicEdges } from './cycleDetector.js'

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
  const files = safeNodes.filter((node) => !isGhostNode(node))
  const totalFiles = files.length
  const edgeCount = safeNodes.reduce((sum, node) => sum + importsOf(node).length, 0)
  const cycles = countCycles(cyclicEdges)
  const cycleEdges = normalizeCyclicEdges(cyclicEdges).length
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
    // The penalty scales with the number of edges caught in a cycle — a dense
    // tangle of cyclic imports is far worse than a single small loop.
    { id: 'cycles', penalty: Math.min(cycleEdges * 8, 32) },
    { id: 'orphans', penalty: Math.min(Math.round(orphanRatio * 20), 20) },
    { id: 'godComponents', penalty: Math.min(godComponents * 6, 18) },
    { id: 'coupling', penalty: avgCoupling > 3 ? Math.min(Math.round(avgCoupling - 3) * 4, 10) : 0 },
    { id: 'deadExports', penalty: Math.min(deadExportCount * 2, 10) },
    { id: 'unresolved', penalty: Math.min(unresolvedImports, 10) },
  ]
  const penaltyMap = Object.fromEntries(penalties.map(p => [p.id, p.penalty]))
  const totalPenalty = penalties.reduce((sum, p) => sum + p.penalty, 0)
  const score = Math.max(0, Math.min(MAX_SCORE, Math.round(MAX_SCORE - totalPenalty)))

  const breakdown = [
    {
      id: 'cycles',
      label: 'Circular dependencies',
      value: `${cycles}`,
      penalty: penaltyMap.cycles,
      detail: cycleEdges > 0 && cycleEdges !== cycles ? `Import cycles between files (${cycleEdges} edges)` : 'Import cycles between files',
      explanation: cycles === 0 ? 'No circular dependencies detected' : `${cycles} circular import cycle${cycles > 1 ? 's' : ''} detected`,
      status: cycles === 0 ? 'good' : cycles <= 2 ? 'warn' : 'bad',
    },
    {
      id: 'orphans',
      label: 'Orphan files',
      value: `${orphans}`,
      penalty: penaltyMap.orphans,
      detail: 'Nothing imports them and they import nothing',
      explanation: orphans === 0 ? 'No isolated orphan files' : `${orphans} file${orphans > 1 ? 's' : ''} completely disconnected from graph`,
      status: orphanRatio === 0 ? 'good' : orphanRatio <= 0.15 ? 'warn' : 'bad',
    },
    {
      id: 'godComponents',
      label: 'God components',
      value: `${godComponents}`,
      penalty: penaltyMap.godComponents,
      detail: `Fan-in ≥ ${GOD_FAN_IN_THRESHOLD} or fan-out ≥ ${GOD_FAN_OUT_THRESHOLD}`,
      explanation: godComponents === 0 ? 'No god components detected' : `${godComponents} module${godComponents > 1 ? 's' : ''} with excessive fan-in or fan-out`,
      status: godComponents === 0 ? 'good' : godComponents <= 1 ? 'warn' : 'bad',
    },
    {
      id: 'coupling',
      label: 'Avg coupling',
      value: `${avgCoupling}`,
      penalty: penaltyMap.coupling,
      detail: 'Imports per file',
      explanation: avgCoupling <= 2.5 ? 'Coupling is lean and manageable' : `Average ${avgCoupling} imports per file`,
      status: avgCoupling <= 2.5 ? 'good' : avgCoupling <= 4 ? 'warn' : 'bad',
    },
    {
      id: 'deadExports',
      label: 'Dead exports',
      value: `${deadExportCount}`,
      penalty: penaltyMap.deadExports,
      detail: 'Exported symbols nothing imports',
      explanation: deadExportCount === 0 ? 'All exported symbols are utilized' : `${deadExportCount} dead export${deadExportCount > 1 ? 's' : ''} unreferenced`,
      status: deadExportCount === 0 ? 'good' : deadExportCount <= 3 ? 'warn' : 'bad',
    },
    {
      id: 'unresolved',
      label: 'Unresolved imports',
      value: `${unresolvedImports}`,
      penalty: penaltyMap.unresolved,
      detail: 'Imports that could not be mapped to a file',
      explanation: unresolvedImports === 0 ? 'All import specifiers resolved cleanly' : `${unresolvedImports} import${unresolvedImports > 1 ? 's' : ''} could not be resolved`,
      status: unresolvedImports === 0 ? 'good' : unresolvedImports <= 3 ? 'warn' : 'bad',
    },
  ]

  const summary = [
    cycles === 0 ? '✓ No circular dependencies' : `⚠ ${cycles} circular dependenc${cycles > 1 ? 'ies' : 'y'} (-${penaltyMap.cycles} pts)`,
    godComponents === 0 ? '✓ No god components' : `⚠ ${godComponents} high-coupling module${godComponents > 1 ? 's' : ''} (-${penaltyMap.godComponents} pts)`,
    avgCoupling <= 3 ? '✓ Dependency structure is mostly healthy' : `⚠ High average coupling (${avgCoupling}/file, -${penaltyMap.coupling} pts)`,
    unresolvedImports === 0 ? '✓ No unresolved imports' : `⚠ ${unresolvedImports} unresolved import${unresolvedImports > 1 ? 's' : ''} (-${penaltyMap.unresolved} pts)`,
    orphans === 0 ? '✓ No orphan modules' : `⚠ ${orphans} orphan module${orphans > 1 ? 's' : ''} (-${penaltyMap.orphans} pts)`
  ]

  return {
    score,
    grade: scoreToGrade(score),
    breakdown,
    metrics,
    baseScore: MAX_SCORE,
    totalPenalty,
    summary
  }
}

/**
 * Resolve the node classification. Raw analysis nodes expose it as `type`,
 * adapted graph nodes as `nodeType` (React Flow's own `type` is
 * 'componentNode' and is not a classification).
 */
function nodeTypeOf(node) {
  const rawType = node.type && node.type !== 'componentNode' ? node.type : undefined
  return node.nodeType || node.data?.nodeType || rawType || 'component'
}

/**
 * Dependency lists live at the top level for raw analysis nodes and under
 * `data` for adapted graph nodes — read both so the score is identical
 * whichever shape is passed in.
 */
function importsOf(node) {
  const list = node.imports || node.data?.imports
  return Array.isArray(list) ? list : []
}

function importedByOf(node) {
  const list = node.importedBy || node.data?.importedBy
  return Array.isArray(list) ? list : []
}

function isGhostNode(node) {
  return Boolean(node.isGhost || node.data?.isGhost)
}

function isOrphan(node) {
  // Entry points and pages are expected to sit at the edge of the graph —
  // counting them as orphans penalises healthy projects.
  const type = nodeTypeOf(node)
  if (type === 'root' || type === 'entry' || type === 'page') return false
  return importsOf(node).length === 0 && importedByOf(node).length === 0
}

function isGodComponent(node) {
  return (
    importedByOf(node).length >= GOD_FAN_IN_THRESHOLD ||
    importsOf(node).length >= GOD_FAN_OUT_THRESHOLD
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
