/**
 * Smart Issue Prioritizer for ReactViz Architecture Graphs
 * Categorizes and ranks architecture issues by real dependency graph signals.
 */

import { computeBlastRadius } from './impactAnalysis.js'

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

/**
 * Extracts and prioritizes all architecture issues from nodes and graph metadata.
 * 
 * @param {Object} params
 * @param {Array} params.nodes - Graph nodes
 * @param {Array} [params.edges] - Graph edges
 * @param {Array} [params.cyclicEdges] - Cyclic dependency edge pairs
 * @param {Object} [params.stats] - Analysis metrics
 * @returns {{
 *   issues: Array<Object>,
 *   counts: { critical: number, high: number, medium: number, low: number, total: number },
 *   recommendations: Array<Object>
 * }}
 */
export function prioritizeIssues({ nodes = [], cyclicEdges = [], stats = {} } = {}) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter(Boolean) : []
  const safeStats = stats && typeof stats === 'object' ? stats : {}
  const issues = []

  // Fast node lookup
  const nodeMap = new Map()
  for (const n of safeNodes) {
    const id = n.id
    if (!id) continue
    const imports = n.imports || n.data?.imports || []
    const importedBy = n.importedBy || n.data?.importedBy || []
    const label = n.label || n.data?.label || id
    const nodeType = n.nodeType || n.data?.nodeType || 'component'
    const isGhost = Boolean(n.isGhost || n.data?.isGhost)
    const signals = n.signals || n.data?.signals || {}
    nodeMap.set(id, { id, label, nodeType, isGhost, imports, importedBy, signals, raw: n })
  }

  // 1. Circular Dependencies
  const processedCycles = new Set()
  if (Array.isArray(cyclicEdges)) {
    for (const edge of cyclicEdges) {
      if (!edge?.source || !edge?.target) continue
      const pairKey = [edge.source, edge.target].sort().join('<->')
      if (processedCycles.has(pairKey)) continue
      processedCycles.add(pairKey)

      const sourceNode = nodeMap.get(edge.source)
      const targetNode = nodeMap.get(edge.target)
      const sourceLabel = sourceNode?.label || edge.source
      const targetLabel = targetNode?.label || edge.target

      // Compute combined blast radius of participants
      const sourceBlast = sourceNode ? computeBlastRadius(sourceNode.id, safeNodes) : null
      const targetBlast = targetNode ? computeBlastRadius(targetNode.id, safeNodes) : null
      const totalImpact = Math.max(sourceBlast?.total || 0, targetBlast?.total || 0)

      const isCritical = totalImpact >= 8 || (sourceNode?.importedBy?.length || 0) + (targetNode?.importedBy?.length || 0) >= 10

      issues.push({
        id: `cycle-${pairKey}`,
        type: 'cycle',
        category: 'Circular Dependency',
        severity: isCritical ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        title: `Circular dependency: ${sourceLabel} ↔ ${targetLabel}`,
        reason: 'Mutual dependency prevents clean tree-shaking, creates initialization order bugs, and tightly couples modules.',
        nodeId: edge.source,
        secondaryNodeId: edge.target,
        affectedCount: totalImpact || 2,
        affectedNodes: [edge.source, edge.target],
        actionLabel: 'Break Cycle',
        actionType: 'cycle',
        priorityScore: (isCritical ? 100 : 75) + totalImpact,
      })
    }
  }

  // 2. High Coupling & God Components (Fan-in >= 8 or Fan-out >= 12)
  for (const [id, node] of nodeMap.entries()) {
    if (node.isGhost) continue

    const fanIn = node.importedBy.length
    const fanOut = node.imports.length
    const contextConsumers = node.signals?.contextConsumers?.length || 0

    if (fanIn >= 8 || fanOut >= 12 || contextConsumers >= 6) {
      const blast = computeBlastRadius(id, safeNodes)
      const totalAffected = blast?.total || fanIn
      const isCritical = totalAffected >= 15 || fanIn >= 12

      issues.push({
        id: `coupling-${id}`,
        type: 'coupling',
        category: 'High Coupling',
        severity: isCritical ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        title: `${node.label} has excessive coupling (${totalAffected} affected)`,
        reason: `${node.label} is imported by ${fanIn} files and affects ${totalAffected} transitive dependents. Breaking changes here ripple across the entire system.`,
        nodeId: id,
        affectedCount: totalAffected,
        affectedNodes: blast?.ordered?.slice(0, 5).map(e => e.id) || node.importedBy.slice(0, 5),
        actionLabel: 'View Impact',
        actionType: 'impact',
        priorityScore: (isCritical ? 90 : 65) + Math.min(totalAffected, 30),
      })
    } else if (fanIn >= 5 || fanOut >= 8) {
      issues.push({
        id: `coupling-${id}`,
        type: 'coupling',
        category: 'Moderate Coupling',
        severity: SEVERITY.MEDIUM,
        title: `${node.label} has moderate dependency weight (${fanIn} callers)`,
        reason: `Module has ${fanIn} incoming and ${fanOut} outgoing dependencies. Consider isolating interfaces to prevent further coupling.`,
        nodeId: id,
        affectedCount: fanIn,
        affectedNodes: node.importedBy.slice(0, 4),
        actionLabel: 'Trace Node',
        actionType: 'focus',
        priorityScore: 40 + fanIn,
      })
    }
  }

  // 3. Unresolved Imports
  for (const [id, node] of nodeMap.entries()) {
    if (node.isGhost) continue
    const unresolved = node.raw?.unresolvedImports || node.raw?.data?.unresolvedImports || []
    if (Array.isArray(unresolved) && unresolved.length > 0) {
      issues.push({
        id: `unresolved-${id}`,
        type: 'unresolved',
        category: 'Unresolved Import',
        severity: SEVERITY.HIGH,
        title: `${node.label} has ${unresolved.length} missing import${unresolved.length > 1 ? 's' : ''}`,
        reason: `Cannot resolve paths: ${unresolved.slice(0, 3).join(', ')}. May cause runtime module errors or broken bundler builds.`,
        nodeId: id,
        affectedCount: unresolved.length,
        affectedNodes: [id],
        actionLabel: 'Inspect File',
        actionType: 'focus',
        priorityScore: 70 + unresolved.length * 2,
      })
    }
  }

  // 4. Orphan Files (Not imported by anything and imports nothing, excluding root/pages)
  for (const [id, node] of nodeMap.entries()) {
    if (node.isGhost) continue
    if (node.nodeType === 'root' || node.nodeType === 'page' || node.nodeType === 'entry') continue

    if (node.imports.length === 0 && node.importedBy.length === 0) {
      issues.push({
        id: `orphan-${id}`,
        type: 'orphan',
        category: 'Orphan File',
        severity: SEVERITY.LOW,
        title: `${node.label} is an unused orphan file`,
        reason: 'This file is completely disconnected from the project dependency graph and may be dead code.',
        nodeId: id,
        affectedCount: 0,
        affectedNodes: [id],
        actionLabel: 'Inspect File',
        actionType: 'focus',
        priorityScore: 15,
      })
    }
  }

  // 5. Dead Exports (if present in stats)
  if (safeStats.deadExports > 0 && Array.isArray(safeStats.deadExportList)) {
    for (const item of safeStats.deadExportList.slice(0, 5)) {
      issues.push({
        id: `dead-export-${item.file}-${item.symbol}`,
        type: 'dead_export',
        category: 'Dead Export',
        severity: SEVERITY.LOW,
        title: `Unused export: ${item.symbol} in ${item.file}`,
        reason: 'Symbol is exported but never imported anywhere in the project.',
        nodeId: item.file,
        affectedCount: 0,
        affectedNodes: [item.file],
        actionLabel: 'Inspect File',
        actionType: 'focus',
        priorityScore: 10,
      })
    }
  }

  // Sort by priorityScore descending
  issues.sort((a, b) => b.priorityScore - a.priorityScore)

  // Count severities
  const counts = {
    critical: issues.filter(i => i.severity === SEVERITY.CRITICAL).length,
    high: issues.filter(i => i.severity === SEVERITY.HIGH).length,
    medium: issues.filter(i => i.severity === SEVERITY.MEDIUM).length,
    low: issues.filter(i => i.severity === SEVERITY.LOW).length,
    total: issues.length,
  }

  // "What should I fix first?" — Top 3 actionable recommendations
  const recommendations = issues.slice(0, 3).map((issue, index) => ({
    rank: index + 1,
    id: issue.id,
    title: issue.title,
    severity: issue.severity,
    reason: issue.reason,
    nodeId: issue.nodeId,
    actionType: issue.actionType,
    actionLabel: issue.actionLabel,
    affectedCount: issue.affectedCount,
  }))

  return { issues, counts, recommendations }
}
