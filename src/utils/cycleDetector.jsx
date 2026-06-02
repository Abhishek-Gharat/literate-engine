/**
 * cycleDetector.js
 * Input:  resolved dep map { "App.jsx": ["Navbar.jsx", "Sidebar.jsx"] }
 * Output: Set of edges that form cycles  [["A.jsx", "B.jsx"], ...]
 */

export function detectCycles(depMap) {
  const visited = new Set()
  const inStack = new Set()
  const cyclicEdges = [] // edges jo red dikhenge graph mein

  function dfs(node, path) {
    if (inStack.has(node)) {
      // cycle found — path mein ye node dobara mila
      const cycleStart = path.indexOf(node)
      const cycle = path.slice(cycleStart)

      // us cycle ke saare edges mark karo
      cycle.forEach((n, i) => {
        const next = cycle[(i + 1) % cycle.length]
        cyclicEdges.push([n, next])
      })
      return
    }

    if (visited.has(node)) return // already fully explored

    visited.add(node)
    inStack.add(node)
    path.push(node)

    const neighbors = depMap[node] || []
    neighbors.forEach((neighbor) => {
      dfs(neighbor, [...path])
    })

    inStack.delete(node)
  }

  // har node se DFS shuru karo
  Object.keys(depMap).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  })

  return cyclicEdges
  // e.g. [["AuthContext.jsx", "useAuth.js"], ["useAuth.js", "AuthContext.jsx"]]
}

// Helper — easy check karo ki koi specific edge cyclic hai
export function isCyclicEdge(cyclicEdges, source, target) {
  return cyclicEdges.some(([s, t]) => s === source && t === target)
}