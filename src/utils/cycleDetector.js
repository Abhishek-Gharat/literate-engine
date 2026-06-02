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
