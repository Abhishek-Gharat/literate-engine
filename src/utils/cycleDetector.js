/**
 * Input: resolved dep map { "App.jsx": ["Navbar.jsx", "Sidebar.jsx"] }
 * Output: cycle edges [["A.jsx", "B.jsx"], ...]
 */
export function detectCycles(depMap) {
  const visited = new Set()
  const inStack = new Set()
  const cyclicEdges = []

  function dfs(node, path) {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node)
      const cycle = path.slice(cycleStart)

      cycle.forEach((current, index) => {
        const next = cycle[(index + 1) % cycle.length]
        cyclicEdges.push([current, next])
      })
      return
    }

    if (visited.has(node)) return

    visited.add(node)
    inStack.add(node)
    path.push(node)

    const neighbors = depMap[node] || []
    neighbors.forEach((neighbor) => {
      dfs(neighbor, [...path])
    })

    inStack.delete(node)
  }

  Object.keys(depMap).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  })

  return cyclicEdges
}

export function isCyclicEdge(cyclicEdges, source, target) {
  return cyclicEdges.some(([edgeSource, edgeTarget]) => edgeSource === source && edgeTarget === target)
}

/**
 * Normalise cyclic edges to `{ source, target }` records.
 *
 * The detector emits `[source, target]` pairs, but snapshots that travel
 * through JSON can carry either shape — accept both so consumers never
 * silently drop cycles.
 */
export function normalizeCyclicEdges(cyclicEdges) {
  if (!Array.isArray(cyclicEdges)) return []
  const normalized = []
  for (const edge of cyclicEdges) {
    if (Array.isArray(edge)) {
      const [source, target] = edge
      if (source && target) normalized.push({ source, target })
    } else if (edge && edge.source && edge.target) {
      normalized.push({ source: edge.source, target: edge.target })
    }
  }
  return normalized
}

/**
 * Count the distinct dependency cycles in a list of cyclic edges.
 *
 * Cyclic edges that belong to the same loop are grouped into one cycle —
 * `A → B → C → A` is a single cycle made of three edges, not three cycles.
 */
export function countCycles(cyclicEdges) {
  const edges = normalizeCyclicEdges(cyclicEdges)
  if (edges.length === 0) return 0

  const adjacency = new Map()
  for (const { source, target } of edges) {
    if (!adjacency.has(source)) adjacency.set(source, new Set())
    if (!adjacency.has(target)) adjacency.set(target, new Set())
    adjacency.get(source).add(target)
    adjacency.get(target).add(source)
  }

  const visited = new Set()
  let cycles = 0

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue

    const stack = [node]
    visited.add(node)
    let nodesInComponent = 0
    let selfLoop = false

    while (stack.length > 0) {
      const current = stack.pop()
      nodesInComponent += 1
      for (const next of adjacency.get(current)) {
        if (current === next) selfLoop = true
        if (!visited.has(next)) {
          visited.add(next)
          stack.push(next)
        }
      }
    }

    if (nodesInComponent > 1 || selfLoop) cycles += 1
  }

  return cycles
}
