import dagre from 'dagre'
import { isCyclicEdge } from './cycleDetector.js'
import { getNodeType } from './nodeTypeClassifier.js'

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

function adaptApiNode(node, depMap) {
  const allFiles = Object.keys(depMap)
  const isGhost = Boolean(node.isGhost)
  const nodeType = isGhost ? 'ghost' : (node.type || getNodeType(node.id))

  return {
    id: node.id,
    type: 'componentNode',
    position: { x: 0, y: 0 },
    data: {
      label: node.id,
      nodeType,
      isGhost,
      imports: node.imports || depMap[node.id] || [],
      importedBy: node.importedBy || allFiles.filter((file) => depMap[file]?.includes(node.id)),
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
