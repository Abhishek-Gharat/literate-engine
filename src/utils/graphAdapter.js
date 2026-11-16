import dagre from 'dagre'
import { isCyclicEdge } from './cycleDetector.js'
import { getNodeType, isEntryPoint } from './nodeTypeClassifier.js'

const NODE_WIDTH = 200
const NODE_HEIGHT = 70

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    ranksep: direction === 'TB' ? 100 : 140,
    nodesep: direction === 'TB' ? 60 : 80,
    marginx: 80,
    marginy: 80,
    acyclicer: 'greedy',
    ranker: 'tight-tree',
  })

  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id)
      if (!pos) return node

      return {
        ...node,
        position: {
          x: pos.x - NODE_WIDTH / 2,
          y: pos.y - NODE_HEIGHT / 2,
        },
        sourcePosition: direction === 'LR' ? 'right' : 'bottom',
        targetPosition: direction === 'LR' ? 'left' : 'top',
      }
    }),
    edges,
  }
}

function adaptApiNode(node, depMap = {}) {
  const isMap = depMap instanceof Map
  const allFiles = isMap ? Array.from(depMap.keys()) : Object.keys(depMap || {})
  const isGhost = Boolean(node.isGhost)
  const isEntry = isEntryPoint(node.id)
  // Prefer the classification carried by the node itself (the engine and the
  // demo fixtures both provide one) and only fall back to path heuristics.
  const declaredType = node.nodeType || node.type
  const nodeType = isGhost
    ? 'ghost'
    : (isEntry ? 'entry' : (declaredType || getNodeType(node.id)))

  const getImports = (id) => isMap ? depMap.get(id) : depMap[id]

  return {
    id: node.id,
    type: 'componentNode',
    position: { x: 0, y: 0 },
    data: {
      // `id` is kept on the data payload as well: inspectors and issue
      // matching work on the selected node's *data* object, so without it
      // `node.id` is undefined and every issue matches every node.
      id: node.id,
      label: node.id,
      nodeType,
      isGhost,
      isEntryPoint: isEntry,
      signals: node.signals || null,
      deadExports: node.deadExports || [],
      imports: node.imports || getImports(node.id) || [],
      importedBy: node.importedBy || allFiles.filter((file) => getImports(file)?.includes(node.id)),
    },
  }
}

function adaptApiEdge(edge, cyclicEdges) {
  const cyclic = Boolean(edge.cyclic ?? isCyclicEdge(cyclicEdges, edge.source, edge.target))
  const importType = edge.importType || edge.data?.importType || edge.type || 'static-import'

  return {
    id: edge.id || `${edge.source}__${edge.target}`,
    source: edge.source,
    target: edge.target,
    data: { cyclic, importType },
    type: 'animatedEdge',
    animated: cyclic,
    markerEnd: {
      type: 'arrowclosed',
      color: cyclic ? '#ef4444' : '#4f46e5',
      width: 14,
      height: 14,
    },
    label: cyclic ? 'cycle' : '',
    labelStyle: { fill: '#ef4444', fontSize: '10px', fontWeight: '700' },
    labelBgStyle: { fill: '#1e293b' },
  }
}

export function adaptAnalysisToGraph(analysis, direction = 'TB') {
  const nodes = analysis.nodes.map((node) => adaptApiNode(node, analysis.depMap))
  const edges = analysis.edges.map((edge) => adaptApiEdge(edge, analysis.cyclicEdges))

  return getLayoutedElements(nodes, edges, direction)
}
