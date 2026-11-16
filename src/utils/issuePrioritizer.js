/**
 * Smart Issue Prioritizer for ReactViz Architecture Graphs
 * Categorizes and ranks architecture issues by real dependency graph signals.
 */

import { computeBlastRadius } from './impactAnalysis.js'
import { normalizeCyclicEdges } from './cycleDetector.js'

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
 * @param {Array} [params.cyclicEdges] - Cyclic dependency edge pairs
 * @param {Object} [params.stats] - Analysis metrics
 * @returns {{
 *   issues: Array<Object>,
 *   counts: { critical: number, high: number, medium: number, low: number, total: number },
 *   recommendations: Array<Object>
 * }}
 */
export function prioritizeIssues({ nodes = [], cyclicEdges = [], stats = {}, unresolvedImports = [] } = {}) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter(Boolean) : []
  const safeStats = stats || {}
  const issues = []

  // Fast node lookup
  const nodeMap = new Map()
  for (const n of safeNodes) {
    const id = n.id
    if (!id) continue
    const imports = n.imports || n.data?.imports || []
    const importedBy = n.importedBy || n.data?.importedBy || []
    const label = n.label || n.data?.label || id
    // Raw analysis nodes expose the classification as `type` ('root',
    // 'component', 'hook', …) while adapted graph nodes use `nodeType`.
    // React Flow nodes carry `type: 'componentNode'`, which is not a
    // classification and must not be used as one.
    const rawType = n.type && n.type !== 'componentNode' ? n.type : undefined
    const nodeType = n.nodeType || n.data?.nodeType || rawType || 'component'
    const isGhost = Boolean(n.isGhost || n.data?.isGhost)
    const signals = n.signals || n.data?.signals || {}
    nodeMap.set(id, { id, label, nodeType, isGhost, imports, importedBy, signals, raw: n })
  }

  // 1. Circular Dependencies
  const processedCycles = new Set()
  if (Array.isArray(cyclicEdges)) {
    for (const { source, target } of normalizeCyclicEdges(cyclicEdges)) {
      const pairKey = [source, target].sort().join('<->')
      if (processedCycles.has(pairKey)) continue
      processedCycles.add(pairKey)

      const sourceNode = nodeMap.get(source)
      const targetNode = nodeMap.get(target)
      const sourceLabel = sourceNode?.label || source
      const targetLabel = targetNode?.label || target

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
        whyItMatters: 'Changes to either file can trigger unexpected feedback loops and bundler initialization errors.',
        nodeId: source,
        secondaryNodeId: target,
        affectedCount: totalImpact || 2,
        affectedNodes: [source, target],
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
        reason: `${node.label} is imported by ${fanIn} files and affects ${totalAffected} transitive dependents.`,
        whyItMatters: `Changes to ${node.label} ripple across a large part of the application (${totalAffected} affected modules).`,
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
        reason: `Module has ${fanIn} incoming and ${fanOut} outgoing dependencies.`,
        whyItMatters: 'High connection density increases likelihood of regression when internal contracts change.',
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
  // Check both unresolvedImports array and node-level unresolvedImports
  const unresolvedBySource = new Map()
  if (Array.isArray(unresolvedImports)) {
    for (const item of unresolvedImports) {
      const src = item.sourceFile || item.source || item.file
      if (!src) continue
      if (!unresolvedBySource.has(src)) unresolvedBySource.set(src, [])
      unresolvedBySource.get(src).push(item.importPath || item.specifier || item)
    }
  }

  for (const [id, node] of nodeMap.entries()) {
    if (node.isGhost) continue
    const nodeUnresolved = node.raw?.unresolvedImports || node.raw?.data?.unresolvedImports || []
    if (Array.isArray(nodeUnresolved) && nodeUnresolved.length > 0) {
      const existing = unresolvedBySource.get(id) || []
      unresolvedBySource.set(id, [...new Set([...existing, ...nodeUnresolved])])
    }
  }

  for (const [srcId, missingList] of unresolvedBySource.entries()) {
    const node = nodeMap.get(srcId)
    const label = node?.label || srcId
    const missingPaths = missingList.slice(0, 3).map(p => typeof p === 'string' ? p : p.importPath || JSON.stringify(p)).join(', ')

    issues.push({
      id: `unresolved-${srcId}`,
      type: 'unresolved',
      category: 'Unresolved Import',
      severity: SEVERITY.HIGH,
      title: `${label} has ${missingList.length} unresolved import${missingList.length > 1 ? 's' : ''}`,
      reason: `Cannot resolve paths: ${missingPaths}.`,
      whyItMatters: 'Missing or unmapped import specifiers cause bundler compilation errors or runtime missing module exceptions.',
      nodeId: srcId,
      affectedCount: missingList.length,
      affectedNodes: [srcId],
      actionLabel: 'Inspect File',
      actionType: 'focus',
      actionableNextStep: 'Inspect file and fix broken specifier or install package dependency.',
      priorityScore: 75 + missingList.length * 2,
    })
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
        whyItMatters: 'Unused files add cognitive load and bloat repository maintenance without contributing to app functionality.',
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
        whyItMatters: 'Dead exports degrade bundle optimization and suggest stale public API surface.',
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
    whyItMatters: issue.whyItMatters,
    nodeId: issue.nodeId,
    secondaryNodeId: issue.secondaryNodeId,
    actionType: issue.actionType,
    actionLabel: issue.actionLabel,
    affectedCount: issue.affectedCount,
  }))

  return { issues, counts, recommendations }
}
