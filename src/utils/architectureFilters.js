/**
 * Architecture Filters and Search Utilities for ReactViz
 * Provides reversible filtering and grouped search across graph nodes.
 */

/**
 * Classifies a node into a primary architectural category.
 */
export function classifyNodeType(node) {
  const type = node.nodeType || node.data?.nodeType || ''
  const id = (node.id || '').toLowerCase()
  const label = (node.label || node.data?.label || '').toLowerCase()

  if (type === 'page' || id.includes('/pages/') || id.includes('/views/')) return 'pages'
  if (type === 'hook' || id.includes('/hooks/') || label.startsWith('use')) return 'hooks'
  if (type === 'context' || type === 'index' || id.includes('/context/') || label.includes('context')) return 'contexts'
  if (id.includes('/services/') || id.includes('/api/') || label.includes('service') || label.includes('client')) return 'services'
  if (id.includes('/utils/') || id.includes('/helpers/') || label.includes('util')) return 'utils'
  if (type === 'component' || id.includes('/components/')) return 'components'
  return 'other'
}

/**
 * Determines node risk category: 'low' | 'medium' | 'high'
 */
export function getNodeRiskLevel(node, blastTotal = null) {
  const fanIn = node.importedBy?.length || node.data?.importedBy?.length || 0
  const consumers = node.data?.signals?.contextConsumers?.length || node.signals?.contextConsumers?.length || 0
  const impact = blastTotal !== null ? blastTotal : fanIn

  if (fanIn >= 8 || consumers >= 5 || impact >= 12) return 'high'
  if (fanIn >= 4 || consumers >= 2 || impact >= 5) return 'medium'
  return 'low'
}

/**
 * Filter predicate evaluating whether a node satisfies active filters.
 */
export function evaluateNodeFilter(node, {
  typeFilter = 'all',
  riskFilter = 'all',
  issueFilter = 'all',
  cyclicNodeIds = new Set(),
  unresolvedNodeIds = new Set(),
  highImpactNodeIds = new Set(),
  blastMap = new Map(),
} = {}) {
  // 1. Type Filter
  if (typeFilter !== 'all') {
    const category = classifyNodeType(node)
    if (category !== typeFilter) return false
  }

  // 2. Risk Filter
  if (riskFilter !== 'all') {
    const blast = blastMap.get(node.id)?.total ?? null
    const risk = getNodeRiskLevel(node, blast)
    if (risk !== riskFilter) return false
  }

  // 3. Issue Filter
  if (issueFilter !== 'all') {
    if (issueFilter === 'cycles' && !cyclicNodeIds.has(node.id)) return false
    if (issueFilter === 'unresolved' && !unresolvedNodeIds.has(node.id)) return false
    if (issueFilter === 'high_impact' && !highImpactNodeIds.has(node.id)) return false
  }

  return true
}

/**
 * Grouped Architecture Search
 * Matches file path, label, nodeType, hooks, contexts, and symbols.
 * Returns grouped results with total count.
 */
export function searchArchitectureNodes(nodes = [], query = '') {
  const q = (query || '').trim().toLowerCase()
  if (!q) {
    return { total: 0, grouped: {}, flat: [] }
  }

  const flat = []
  const grouped = {
    components: [],
    hooks: [],
    contexts: [],
    services: [],
    utils: [],
    pages: [],
    other: [],
  }

  for (const node of nodes) {
    if (!node?.id) continue
    const id = node.id.toLowerCase()
    const label = (node.label || node.data?.label || '').toLowerCase()
    const type = (node.nodeType || node.data?.nodeType || '').toLowerCase()
    const filePath = (node.filePath || node.data?.filePath || '').toLowerCase()
    const signals = node.signals || node.data?.signals || {}
    const hooksUsed = (signals.hooks || []).map(h => h.toLowerCase())
    const contextsUsed = (signals.contextConsumers || []).map(c => c.toLowerCase())

    const matches =
      id.includes(q) ||
      label.includes(q) ||
      type.includes(q) ||
      filePath.includes(q) ||
      hooksUsed.some(h => h.includes(q)) ||
      contextsUsed.some(c => c.includes(q))

    if (matches) {
      const category = classifyNodeType(node)
      const item = {
        id: node.id,
        label: node.label || node.data?.label || node.id,
        nodeType: node.nodeType || node.data?.nodeType || 'file',
        category,
        raw: node,
      }
      flat.push(item)
      if (grouped[category]) {
        grouped[category].push(item)
      } else {
        grouped.other.push(item)
      }
    }
  }

  return {
    total: flat.length,
    grouped,
    flat,
  }
}
