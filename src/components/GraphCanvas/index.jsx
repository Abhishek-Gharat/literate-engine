import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  useReactFlow, ReactFlowProvider, Panel,
} from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import ComponentNode from '../NodeTypes/ComponentNode'
import AnimatedEdge from '../EdgeTypes/AnimatedEdge'
const nodeTypes = { componentNode: ComponentNode }
const edgeTypes = { animatedEdge: AnimatedEdge }  // ← add

const NODE_WIDTH = 200
const NODE_HEIGHT = 70
function getLayoutedElements(nodes, edges, direction = 'TB') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    ranksep: direction === 'TB' ? 80 : 120,  // vertical gap between levels
    nodesep: direction === 'TB' ? 40 : 60,   // horizontal gap between nodes
    marginx: 60,
    marginy: 60,
    align: 'UL',   // align nodes to upper-left in each rank
    acyclicer: 'greedy', // handle cycles properly
    ranker: 'tight-tree' // tighter, cleaner tree layout
  })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach(e => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) {
      g.setEdge(e.source, e.target)
    }
  })

  dagre.layout(g)

  return nodes.map(n => {
    const pos = g.node(n.id)
    if (!pos) return n
    return {
      ...n,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      targetPosition: direction === 'LR' ? 'left' : 'top',
    }
  })
}

// Inner component — needs to be inside ReactFlowProvider
function FlowInner({ initialNodes, initialEdges, onNodeClick, searchTerm }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()
const [direction, setDirection] = useState('TB')

  // Load nodes + edges on mount
  useEffect(() => {
    if (!initialNodes?.length) return
    const layouted = getLayoutedElements(initialNodes, initialEdges, 'TB')
    setNodes(layouted)
    // animated: true — React Flow built-in flow animation
setEdges(initialEdges.map(e => ({
  ...e,
  type: 'animatedEdge',  // custom edge
  data: { ...e.data, cyclic: e.animated }, // cyclic edges red dot
  markerEnd: {
    type: 'arrowclosed',
    color: e.animated ? '#ef4444' : '#4f46e5',
    width: 14,
    height: 14,
  }
})))
    setTimeout(() => fitView({ padding: 0.25, duration: 800 }), 100)
  }, [initialNodes, initialEdges, fitView, setEdges, setNodes])

  // Layout toggle — TB ↔ LR with smooth position animation
const toggleLayout = useCallback(() => {
  const next = direction === 'TB' ? 'LR' : 'TB'
  setDirection(next)

  // edges aur nodes dono pass karo — fresh layout
  setNodes(nds => getLayoutedElements(nds, edges, next))
  setTimeout(() => fitView({ padding: 0.25, duration: 800 }), 80)
}, [direction, edges, fitView, setNodes])

  // Search highlight
  useEffect(() => {
    if (!searchTerm) {
      setNodes(nds => nds.map(n => ({
        ...n, style: { ...n.style, opacity: undefined }
      })))
      return
    }
    setNodes(nds => nds.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.id.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0.15
      }
    })))
  }, [searchTerm, setNodes])

  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a12' }}>
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeClick={(_, node) => onNodeClick?.(node)}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  fitViewOptions={{ padding: 0.3, minZoom: 0.8, maxZoom: 1.2 }}
  minZoom={0.3}
  maxZoom={2}
  nodesDraggable={true}
  defaultEdgeOptions={{ type: 'animatedEdge' }}
>
        <Background color="#1e1e2e" gap={24} size={1} />

        {/* Layout Toggle Button */}
        <Panel position="bottom-center">
          <button
            onClick={toggleLayout}
            style={{
              padding: '8px 20px',
              background: '#13131f',
              border: '1px solid #2a2a3d',
              borderRadius: '20px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#7c3aed'
              e.currentTarget.style.color = '#a78bfa'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2a3d'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <span style={{ fontSize: '14px' }}>
{direction === 'TB' ? '↔' : '↕'}
            </span>
            Toggle Layout
          </button>
        </Panel>

        <Controls style={{
          background: '#13131f',
          border: '1px solid #1e1e2e',
          borderRadius: '8px',
          boxShadow: 'none'
        }} />
        <MiniMap
          style={{
            background: '#13131f',
            border: '1px solid #1e1e2e',
            borderRadius: '8px'
          }}
          nodeColor={n => {
            const colors = {
              root: '#7c3aed', page: '#0891b2',
              component: '#059669', hook: '#d97706', ghost: '#475569'
            }
            return colors[n.data?.nodeType] || '#6366f1'
          }}
        />
      </ReactFlow>
    </div>
  )
}

// Wrap with ReactFlowProvider so useReactFlow() works
export default function GraphCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  )
}
