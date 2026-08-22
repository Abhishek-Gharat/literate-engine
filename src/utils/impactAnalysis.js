/**
 * Impact Analysis Utilities
 * Computes the "blast radius" of a file: every node that transitively
 * imports it, i.e. everything that can break when it changes.
 */

/**
 * @param {string} sourceId - Id of the file to analyze
 * @param {Array} nodes - Graph nodes (analysis or React Flow shape; imports/
 *   importedBy may live at top level or under `.data`)
 * @returns {Object|null}
 *   { sourceId, total, directCount, indirectCount, maxDepth,
 *     ordered: [{ id, label, depth }] } — ordered by depth (closest first),
 *     then by how many files depend on each affected node.
 */
export function computeBlastRadius(sourceId, nodes = []) {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const byId = new Map()

  for (const node of safeNodes) {
    if (!node?.id) continue
    byId.set(node.id, {
      label: node.data?.label || node.label || node.id,
      imports: node.imports || node.data?.imports || [],
      importedBy: node.importedBy || node.data?.importedBy || [],
    })
  }

  if (!sourceId || !byId.has(sourceId)) return null

  const visited = new Set([sourceId])
  const queue = [{ id: sourceId, depth: 0 }]
  const affected = []

  while (queue.length > 0) {
    const { id, depth } = queue.shift()
    for (const dependent of byId.get(id).importedBy) {
      if (!byId.has(dependent) || visited.has(dependent)) continue
      visited.add(dependent)
      const entry = { id: dependent, depth: depth + 1 }
      affected.push(entry)
      queue.push(entry)
    }
  }

  const ordered = affected
    .map((entry) => ({
      ...entry,
      label: byId.get(entry.id).label,
      weight: byId.get(entry.id).importedBy.length,
    }))
    .sort((a, b) => a.depth - b.depth || b.weight - a.weight || a.label.localeCompare(b.label))
    .map(({ id, label, depth }) => ({ id, label, depth }))

  return {
    sourceId,
    total: affected.length,
    directCount: ordered.filter((entry) => entry.depth === 1).length,
    indirectCount: ordered.filter((entry) => entry.depth > 1).length,
    maxDepth: ordered.reduce((max, entry) => Math.max(max, entry.depth), 0),
    ordered,
  }
}
