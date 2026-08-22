/**
 * Graph Diff Utilities
 * Computes node/edge level differences between two saved runs so they can
 * be rendered as an evolution view (added / removed / unchanged).
 */

function extractSnapshot(run) {
  const snapshot = run?.snapshot || {}
  return {
    nodes: Array.isArray(snapshot.nodes) ? snapshot.nodes : [],
    edges: Array.isArray(snapshot.edges) ? snapshot.edges : [],
  }
}

function edgeKey(edge) {
  if (edge.id) return edge.id
  return `${edge.source}__${edge.target}`
}

/**
 * @param {Object|null} previousRun - Older run
 * @param {Object|null} currentRun - Newer run
 * @returns {Object|null} diff with added/removed/common nodes & edges, or
 *   null when either run has no comparable snapshot.
 */
export function computeGraphDiff(previousRun, currentRun) {
  const prev = extractSnapshot(previousRun)
  const curr = extractSnapshot(currentRun)

  if (!previousRun || !currentRun || prev.nodes.length === 0 || curr.nodes.length === 0) {
    return null
  }

  const prevIds = new Map(prev.nodes.map((node) => [node.id, node]))
  const currIds = new Map(curr.nodes.map((node) => [node.id, node]))

  const addedNodes = curr.nodes.filter((node) => !prevIds.has(node.id))
  const removedNodes = prev.nodes.filter((node) => !currIds.has(node.id))
  const commonNodes = curr.nodes.filter((node) => prevIds.has(node.id))

  const prevEdgeKeys = new Set(prev.edges.map(edgeKey))
  const currEdgeKeys = new Set(curr.edges.map(edgeKey))

  const addedEdges = curr.edges.filter((edge) => !prevEdgeKeys.has(edgeKey(edge)))
  const removedEdges = prev.edges.filter((edge) => !currEdgeKeys.has(edgeKey(edge)))
  const commonEdges = curr.edges.filter((edge) => currEdgeKeys.has(edgeKey(edge)) && prevEdgeKeys.has(edgeKey(edge)))

  return {
    addedNodes,
    removedNodes,
    commonNodes,
    addedEdges,
    removedEdges,
    commonEdges,
    summary: {
      addedFiles: addedNodes.length,
      removedFiles: removedNodes.length,
      unchangedFiles: commonNodes.length,
      addedDeps: addedEdges.length,
      removedDeps: removedEdges.length,
    },
  }
}
