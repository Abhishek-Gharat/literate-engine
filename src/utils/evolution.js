/**
 * Evolution Utilities
 * Builds a chronological sequence of graph states across saved runs so the
 * UI can scrub/play through how an architecture evolved over time.
 */

const byCreatedAsc = (a, b) => new Date(a.createdAt) - new Date(b.createdAt)

function snapshotNodes(run) {
  const snapshot = run?.snapshot || {}
  return Array.isArray(snapshot.nodes) ? snapshot.nodes : []
}

/**
 * @param {Array} runs - Saved runs for one project (any order)
 * @returns {Array} steps - One per run, oldest first:
 *   { run, nodes: [{ node, status }], removed: [node], summary }
 *   status: 'base' (first step), 'added', or 'unchanged'
 */
export function buildEvolutionSteps(runs = []) {
  const safeRuns = (Array.isArray(runs) ? runs : [])
    .filter((run) => run && run.snapshot)
    .sort(byCreatedAsc)

  return safeRuns.map((run, index) => {
    const current = snapshotNodes(run)
    if (index === 0) {
      return {
        run,
        nodes: current.map((node) => ({ node, status: 'base' })),
        removed: [],
        summary: summarize(current, []),
      }
    }

    const previousIds = new Set(snapshotNodes(safeRuns[index - 1]).map((node) => node.id))
    const nodes = current.map((node) => ({
      node,
      status: previousIds.has(node.id) ? 'unchanged' : 'added',
    }))
    const currentIds = new Set(current.map((node) => node.id))
    const removed = snapshotNodes(safeRuns[index - 1]).filter((node) => !currentIds.has(node.id))

    return {
      run,
      nodes,
      removed,
      summary: summarize(current, removed),
    }
  })
}

function summarize(nodes, removed) {
  let components = 0
  for (const node of nodes) {
    const type = node.type || node.data?.nodeType
    if (type === 'component' || type === 'page' || type === 'hook') components += 1
  }
  return {
    totalFiles: nodes.length,
    addedCount: 0,
    removedCount: removed.length,
    components,
  }
}
