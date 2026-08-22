import { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  useReactFlow, ReactFlowProvider, Panel,
} from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import ComponentNode from '../NodeTypes/ComponentNode'
import AnimatedEdge from '../EdgeTypes/AnimatedEdge'
import { exportGraphAsPNG, exportGraphAsSVG, exportAnalysisAsJSON, getGraphSnapshot } from '../../utils/exportUtils.js'

const nodeTypes = { componentNode: ComponentNode }
const edgeTypes = { animatedEdge: AnimatedEdge }

const NODE_WIDTH = 200
const NODE_HEIGHT = 70

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    ranksep: direction === 'TB' ? 90 : 100,
    nodesep: direction === 'TB' ? 50 : 60,
    marginx: 40,
    marginy: 40,
    align: 'UL',
    acyclicer: 'greedy',
    ranker: 'network-simplex'
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

// Inner component
function FlowInner({ initialNodes, initialEdges, onNodeClick, searchTerm, stats, cyclicEdges, highlightIds }, ref) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()
  const [direction, setDirection] = useState('TB')
  const [showHeat, setShowHeat] = useState(false)
  const wrapperRef = useRef(null)

  // Expose export methods via ref
  useImperativeHandle(ref, () => ({
    exportPNG: () => exportGraphAsPNG(wrapperRef.current),
    exportSVG: () => exportGraphAsSVG(wrapperRef.current),
    exportJSON: () => {
      const snapshot = getGraphSnapshot(nodes, edges, stats, cyclicEdges)
      exportAnalysisAsJSON(snapshot)
    },
  }), [nodes, edges, stats, cyclicEdges])

  useEffect(() => {
    if (!initialNodes?.length) return
    const layouted = getLayoutedElements(initialNodes, initialEdges, 'TB')
    setNodes(layouted)
    setEdges(initialEdges.map(e => ({
      ...e,
      type: 'animatedEdge',
      data: { ...e.data, cyclic: e.animated },
      markerEnd: {
        type: 'arrowclosed',
        color: e.animated ? '#ef4444' : '#4f46e5',
        width: 14,
        height: 14,
      }
    })))
    setTimeout(() => fitView({ padding: 0.05, minZoom: 0.8, maxZoom: 1.2, duration: 600 }), 150)
  }, [initialNodes, initialEdges, fitView, setEdges, setNodes])

  const toggleLayout = useCallback(() => {
    const next = direction === 'TB' ? 'LR' : 'TB'
    setDirection(next)
    const layoutedNodes = getLayoutedElements(nodes, edges, next)
    setNodes(layoutedNodes)
    requestAnimationFrame(() => {
      setTimeout(() => fitView({ padding: 0.05, minZoom: 0.8, maxZoom: 1.2, duration: 500 }), 100)
    })
  }, [direction, edges, fitView, setNodes, nodes])

  useEffect(() => {
    setNodes(nds => {
      let changed = false
      const next = nds.map(n => {
        const fanIn = n.data?.importedBy?.length || 0
        const level = fanIn >= 8 ? 3 : fanIn >= 5 ? 2 : fanIn >= 3 ? 1 : 0
        const wantEnabled = showHeat
        const wantLevel = showHeat ? level : 0
        if (n.data?.heatEnabled === wantEnabled && (n.data?.heatLevel ?? 0) === wantLevel) {
          return n
        }
        changed = true
        return { ...n, data: { ...n.data, heatEnabled: wantEnabled, heatLevel: wantLevel } }
      })
      return changed ? next : nds
    })
  }, [showHeat, nodes, setNodes])

  useEffect(() => {
    const searchActive = Boolean(searchTerm)
    const impactSet = Array.isArray(highlightIds) && highlightIds.length > 0
      ? new Set(highlightIds)
      : null
    const impactActive = Boolean(impactSet)

    setNodes(nds => nds.map(n => {
      const matchesSearch = !searchActive || n.id.toLowerCase().includes(searchTerm.toLowerCase())
      const inImpact = !impactActive || impactSet.has(n.id)
      const visible = matchesSearch && inImpact
      return {
        ...n,
        style: {
          ...n.style,
          opacity: (searchActive || impactActive) ? (visible ? 1 : 0.15) : undefined,
          boxShadow: (impactActive && visible) ? '0 0 0 2px rgba(245,166,35,0.45)' : undefined,
        }
      }
    }))

    setEdges(eds => eds.map(e => {
      if (!impactActive) {
        if (!e.data?.impact && !e.data?.dimmed) return e
        return { ...e, data: { ...e.data, impact: false, dimmed: false } }
      }
      const related = impactSet.has(e.source) && impactSet.has(e.target)
      return { ...e, data: { ...e.data, impact: related, dimmed: !related } }
    }))
  }, [searchTerm, highlightIds, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick?.(node)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        fitViewOptions={{ padding: 0.05, minZoom: 0.8, maxZoom: 1.2 }}
        minZoom={0.6}
        maxZoom={2}
        nodesDraggable={true}
        defaultEdgeOptions={{ type: 'animatedEdge' }}
      >
        <Background color="rgba(255,255,255,0.06)" gap={24} size={1} />

        {/* Layout + Heat toggles */}
        <Panel position="bottom-center">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {showHeat && (
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                padding: '6px 12px',
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                fontSize: '11px',
                color: '#a0a0a0',
                backdropFilter: 'blur(8px)'
              }}>
                {[[3, '#f5a623'], [5, '#fb923c'], [8, '#ef4444']].map(([threshold, color]) => (
                  <span key={threshold} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      width: '9px', height: '9px',
                      borderRadius: '2px',
                      borderLeft: `3px solid ${color}`,
                      background: `${color}22`
                    }} />
                    {threshold}+
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowHeat(value => !value)}
              data-testid="heat-toggle"
              style={{
                padding: '8px 16px',
                background: showHeat ? '#f5a62322' : '#1a1a1a',
                border: `1px solid ${showHeat ? '#f5a62366' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '20px',
                color: showHeat ? '#f5a623' : '#a0a0a0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
              title="Color nodes by how many files depend on them"
            >
              🔥 Heat
            </button>
            <button
              onClick={toggleLayout}
              style={{
                padding: '8px 20px',
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                color: '#a0a0a0',
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
                e.currentTarget.style.borderColor = '#e2e2e2'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = '#a0a0a0'
              }}
            >
              Toggle Layout
            </button>
          </div>
        </Panel>

        <Controls style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          boxShadow: 'none'
        }} />
        <MiniMap
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px'
          }}
          nodeColor={n => {
            const colors = {
              root: '#e2e2e2', entry: '#4a7c9b', page: '#4a7c9b',
              component: '#5a9e6f', hook: '#b07a8a', ghost: '#8a8a8a'
            }
            return colors[n.data?.nodeType] || '#8b6fb0'
          }}
        />
      </ReactFlow>
    </div>
  )
}

const FlowInnerWithRef = forwardRef(FlowInner)

// Wrap with ReactFlowProvider so useReactFlow() works
export default function GraphCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowInnerWithRef {...props} />
    </ReactFlowProvider>
  )
}
