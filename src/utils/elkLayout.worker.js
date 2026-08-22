import ELK from 'elkjs/lib/elk.bundled.js'

const elk = new ELK()

// Worker receives: { type: 'layout', requestId, direction, nodes, edges }
// where nodes = [{ id, width, height }] and edges = [{ id, sources, targets }]
// Worker sends back: { type: 'layout_complete', requestId, direction, positions }
// or { type: 'layout_error', requestId, error }
self.onmessage = async ({ data }) => {
  const { type, requestId, direction, nodes, edges } = data
  if (type !== 'layout') return

  try {
    const graph = await elk.layout({
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': direction,           // 'DOWN' (TB) or 'RIGHT' (LR)
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        'elk.spacing.nodeNode': '40',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      },
      children: nodes,
      edges,
    })

    const positions = {}
    for (const n of graph.children) {
      positions[n.id] = { x: n.x, y: n.y }  // ELK returns top-left — no centering needed
    }

    self.postMessage({ type: 'layout_complete', requestId, direction, positions })
  } catch (err) {
    self.postMessage({
      type: 'layout_error',
      requestId,
      error: err.message || String(err),
    })
  }
}
