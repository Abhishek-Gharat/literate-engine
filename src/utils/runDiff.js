/**
 * runDiff.js - Architecture Run Diff Engine
 *
 * Compares two analysis snapshots to produce a structural diff:
 * - Added nodes (new files in the project)
 * - Removed nodes (deleted or renamed files)
 * - New cycles introduced
 * - Resolved cycles (cycles fixed between runs)
 * - Health delta
 */

import { computeHealthScore } from './healthScore.js'

/**
 * Diff two analysis runs and return a structured change summary.
 * @param {Object} baseRun  - Older run (snapshot, stats, unresolvedImports)
 * @param {Object} nextRun  - Newer run (snapshot, stats, unresolvedImports)
 * @returns {Object|null} diff
 */
export function diffRuns(baseRun, nextRun) {
  if (!baseRun || !nextRun) return null

  const baseNodes = new Map((baseRun.snapshot?.nodes || []).map(n => [n.id, n]))
  const nextNodes = new Map((nextRun.snapshot?.nodes || []).map(n => [n.id, n]))

  const baseCyclePairs = new Set(
    (baseRun.snapshot?.cyclicEdges || []).map(e => [e.source, e.target].sort().join('<->'))
  )
  const nextCyclePairs = new Set(
    (nextRun.snapshot?.cyclicEdges || []).map(e => [e.source, e.target].sort().join('<->'))
  )

  const addedNodes = []
  const removedNodes = []
  for (const [id, node] of nextNodes.entries()) {
    if (!baseNodes.has(id)) {
      addedNodes.push({ id, label: node.label || id, nodeType: node.nodeType || 'component' })
    }
  }
  for (const [id, node] of baseNodes.entries()) {
    if (!nextNodes.has(id)) {
      removedNodes.push({ id, label: node.label || id, nodeType: node.nodeType || 'component' })
    }
  }

  const newCycles = []
  const resolvedCycles = []
  for (const pair of nextCyclePairs) {
    if (!baseCyclePairs.has(pair)) {
      const [src, tgt] = pair.split('<->')
      newCycles.push({ source: src, target: tgt, sourceLabel: nextNodes.get(src)?.label || src, targetLabel: nextNodes.get(tgt)?.label || tgt })
    }
  }
  for (const pair of baseCyclePairs) {
    if (!nextCyclePairs.has(pair)) {
      const [src, tgt] = pair.split('<->')
      resolvedCycles.push({ source: src, target: tgt, sourceLabel: baseNodes.get(src)?.label || src, targetLabel: baseNodes.get(tgt)?.label || tgt })
    }
  }

  const baseUnresolved = (baseRun.unresolvedImports || []).length
  const nextUnresolved = (nextRun.unresolvedImports || []).length
  const unresolvedDelta = nextUnresolved - baseUnresolved

  const baseHealth = computeHealthScore({ nodes: baseRun.snapshot?.nodes || [], cyclicEdges: baseRun.snapshot?.cyclicEdges || [], unresolvedImports: baseUnresolved })
  const nextHealth = computeHealthScore({ nodes: nextRun.snapshot?.nodes || [], cyclicEdges: nextRun.snapshot?.cyclicEdges || [], unresolvedImports: nextUnresolved })

  const healthDelta = nextHealth.score !== null && baseHealth.score !== null ? nextHealth.score - baseHealth.score : null
  const fileCountDelta = nextNodes.size - baseNodes.size

  const parts = []
  if (addedNodes.length > 0) parts.push(`+${addedNodes.length} files`)
  if (removedNodes.length > 0) parts.push(`-${removedNodes.length} files`)
  if (newCycles.length > 0) parts.push(`${newCycles.length} new cycle${newCycles.length > 1 ? 's' : ''}`)
  if (resolvedCycles.length > 0) parts.push(`${resolvedCycles.length} cycle${resolvedCycles.length > 1 ? 's' : ''} fixed`)
  if (healthDelta !== null && healthDelta !== 0) parts.push(`health ${healthDelta > 0 ? '+' : ''}${healthDelta}pts`)
  const summary = parts.length === 0 && fileCountDelta === 0 ? 'No structural changes' : parts.join(' - ')

  return {
    addedNodes, removedNodes, newCycles, resolvedCycles,
    unresolvedDelta, fileCountDelta, healthDelta,
    baseScore: baseHealth.score, nextScore: nextHealth.score,
    hasCritical: newCycles.length > 0,
    hasImprovements: resolvedCycles.length > 0 || (healthDelta !== null && healthDelta > 0),
    hasRegressions: newCycles.length > 0 || (healthDelta !== null && healthDelta < -5),
    summary,
  }
}
