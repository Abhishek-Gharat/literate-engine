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

// Shared viewport options. `minZoom` must stay low: dagre layouts of wide
// repositories need to zoom out far below 1 to fit the canvas, otherwise the
// graph is clipped on the left/right edges.
const FIT_VIEW_OPTIONS = { padding: 0.08, minZoom: 0.1, maxZoom: 1.2 }
const MIN_ZOOM = 0.1

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
function FlowInner({ initialNodes, initialEdges, onNodeClick, searchTerm, stats, cyclicEdges, highlightIds, filteredNodeIds, onClearImpact }, ref) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView, setCenter } = useReactFlow()
  const [direction, setDirection] = useState('TB')
  const [visualMode, setVisualMode] = useState('off') // 'off' | 'heat' | 'risk'
  const [focusNodeId, setFocusNodeId] = useState(null) // Focus Mode: node being isolated
  const wrapperRef = useRef(null)

  // Expose export and focus methods via ref
  useImperativeHandle(ref, () => ({
    exportPNG: () => exportGraphAsPNG(wrapperRef.current),
    exportSVG: () => exportGraphAsSVG(wrapperRef.current),
    exportJSON: () => {
      const snapshot = getGraphSnapshot(nodes, edges, stats, cyclicEdges)
      exportAnalysisAsJSON(snapshot)
    },
    focusNode: (nodeId) => {
      const target = nodes.find(n => n.id === nodeId)
      if (target && target.position && setCenter) {
        setCenter(target.position.x + NODE_WIDTH / 2, target.position.y + NODE_HEIGHT / 2, { zoom: 1.1, duration: 500 })
      }
    },
    clearFocus: () => setFocusNodeId(null),
  }), [nodes, edges, stats, cyclicEdges, setCenter])

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
    setTimeout(() => fitView({ ...FIT_VIEW_OPTIONS, duration: 600 }), 150)
  }, [initialNodes, initialEdges, fitView, setEdges, setNodes])

  const toggleLayout = useCallback(() => {
    const next = direction === 'TB' ? 'LR' : 'TB'
    setDirection(next)
    const layoutedNodes = getLayoutedElements(nodes, edges, next)
    setNodes(layoutedNodes)
    requestAnimationFrame(() => {
      setTimeout(() => fitView({ ...FIT_VIEW_OPTIONS, duration: 500 }), 100)
    })
  }, [direction, edges, fitView, setNodes, nodes])

  useEffect(() => {
    setNodes(nds => {
      let changed = false
      const next = nds.map(n => {
        const fanIn = n.data?.importedBy?.length || 0
        const consumers = n.data?.signals?.contextConsumers?.length || 0
        const wantHeat = visualMode === 'heat'
        const wantRisk = visualMode === 'risk'
        const heatLevel = fanIn >= 8 ? 3 : fanIn >= 5 ? 2 : fanIn >= 3 ? 1 : 0
        const riskLevel = consumers >= 5 ? 3 : consumers >= 3 ? 2 : consumers >= 2 ? 1 : 0
        if (
          n.data?.heatEnabled === wantHeat && (n.data?.heatLevel ?? 0) === (wantHeat ? heatLevel : 0) &&
          n.data?.riskEnabled === wantRisk && (n.data?.riskLevel ?? 0) === (wantRisk ? riskLevel : 0)
        ) {
          return n
        }
        changed = true
        return {
          ...n,
          data: {
            ...n.data,
            heatEnabled: wantHeat,
            heatLevel: wantHeat ? heatLevel : 0,
            riskEnabled: wantRisk,
            riskLevel: wantRisk ? riskLevel : 0,
          }
        }
      })
      return changed ? next : nds
    })
  }, [visualMode, setNodes])

  // Build the Focus Mode neighbour set for the focused node
  const focusNeighbourSet = useCallback((nodeId, edgeList) => {
    if (!nodeId || !Array.isArray(edgeList)) return null
    const neighbours = new Set([nodeId])
    for (const e of edgeList) {
      if (e.source === nodeId) neighbours.add(e.target)
      if (e.target === nodeId) neighbours.add(e.source)
    }
    return neighbours
  }, [])

  // Keep a live ref of the edges so the dimming effect can resolve the focus
  // neighbourhood without re-running on every edge mutation.
  const edgesRef = useRef(edges)
  useEffect(() => { edgesRef.current = edges }, [edges])

  useEffect(() => {
    const searchActive = Boolean(searchTerm)
    const impactSet = Array.isArray(highlightIds) && highlightIds.length > 0
      ? new Set(highlightIds)
      : null
    const impactActive = Boolean(impactSet)
    const filterActive = Array.isArray(filteredNodeIds)
    const filterSet = filterActive ? new Set(filteredNodeIds) : null
    const focusSet = focusNeighbourSet(focusNodeId, edgesRef.current)
    const focusActive = Boolean(focusSet)

    setNodes(nds => {
      let changed = false
      const next = nds.map(n => {
        const q = (searchTerm || '').toLowerCase()
        const matchesSearch = !searchActive ||
          n.id.toLowerCase().includes(q) ||
          (n.data?.label || '').toLowerCase().includes(q)
        const inImpact = !impactActive || impactSet.has(n.id)
        const inFilter = !filterActive || filterSet.has(n.id)
        const inFocus = !focusActive || focusSet.has(n.id)
        const isFocused = focusActive && n.id === focusNodeId
        const visible = matchesSearch && inImpact && inFilter && inFocus

        const targetOpacity = (searchActive || impactActive || filterActive || focusActive) ? (visible ? 1 : 0.08) : undefined
        const targetFocus = isFocused
        const targetImpactHighlight = impactActive && inImpact && !isFocused

        if (
          n.style?.opacity === targetOpacity &&
          n.data?.focused === targetFocus &&
          n.data?.impactHighlighted === targetImpactHighlight
        ) {
          return n
        }

        changed = true
        return {
          ...n,
          style: {
            ...n.style,
            opacity: targetOpacity,
            transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
          },
          data: {
            ...n.data,
            focused: targetFocus,
            impactHighlighted: targetImpactHighlight,
          },
        }
      })
      return changed ? next : nds
    })

    setEdges(eds => {
      let changed = false
      const next = eds.map(e => {
        const inImpact = !impactActive || (impactSet.has(e.source) && impactSet.has(e.target))
        const inFilter = !filterActive || (filterSet.has(e.source) && filterSet.has(e.target))
        const inFocus = !focusActive || (focusSet.has(e.source) && focusSet.has(e.target))

        const targetImpact = inImpact && impactActive
        const targetDimmed = !(inImpact && inFilter && inFocus) && (impactActive || filterActive || focusActive)

        if ((e.data?.impact || false) === targetImpact && (e.data?.dimmed || false) === targetDimmed) {
          return e
        }

        changed = true
        return { ...e, data: { ...e.data, impact: targetImpact, dimmed: targetDimmed } }
      })
      return changed ? next : eds
    })
  }, [searchTerm, highlightIds, filteredNodeIds, focusNodeId, focusNeighbourSet, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  // Handle node click — also toggle Focus Mode
  const handleNodeClick = useCallback((_, node) => {
    if (focusNodeId === node.id) {
      // Second click on same node: exit focus mode
      setFocusNodeId(null)
    } else {
      setFocusNodeId(node.id)
    }
    onNodeClick?.(node)
  }, [focusNodeId, onNodeClick])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={MIN_ZOOM}
        maxZoom={2}
        nodesDraggable={true}
        defaultEdgeOptions={{ type: 'animatedEdge' }}
      >
        <Background color="rgba(255,255,255,0.06)" gap={24} size={1} />

        {/* Layout + visual-mode toggles */}
        <Panel position="bottom-center">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Impact Mode Indicator */}
            {Array.isArray(highlightIds) && highlightIds.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.6)',
                borderRadius: '20px',
                fontSize: '11px',
                color: '#fde68a',
                fontWeight: '600',
                backdropFilter: 'blur(8px)',
              }}>
                <span>💥 Impact View ({Math.max(0, highlightIds.length - 1)} affected)</span>
                {onClearImpact && (
                  <button
                    onClick={onClearImpact}
                    style={{ background: 'none', border: 'none', color: '#fde68a', cursor: 'pointer', fontSize: '13px', padding: 0, lineHeight: 1 }}
                    title="Exit impact view"
                  >×</button>
                )}
              </div>
            )}
            {/* Focus Mode Indicator */}
            {focusNodeId && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px',
                background: 'rgba(99,102,241,0.18)',
                border: '1px solid rgba(99,102,241,0.5)',
                borderRadius: '20px',
                fontSize: '11px',
                color: '#c7d2fe',
                fontWeight: '600',
                backdropFilter: 'blur(8px)',
              }}>
                <span>⬡ Focus Mode</span>
                <button
                  onClick={() => setFocusNodeId(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', padding: 0, lineHeight: 1 }}
                  title="Exit focus mode"
                >×</button>
              </div>
            )}
            {visualMode !== 'off' && (
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
                {(visualMode === 'heat'
                  ? [[3, '#f5a623'], [5, '#fb923c'], [8, '#ef4444']]
                  : [[2, '#d8b4fe'], [3, '#a855f7'], [5, '#7c3aed']]
                ).map(([threshold, color]) => (
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
                <span style={{ color: '#6b6b6b' }}>{visualMode === 'heat' ? 'dependents' : 'contexts consumed'}</span>
              </div>
            )}
            <button
              onClick={() => setVisualMode(mode => (mode === 'heat' ? 'off' : 'heat'))}
              data-testid="heat-toggle"
              style={{
                padding: '8px 16px',
                background: visualMode === 'heat' ? '#f5a62322' : '#1a1a1a',
                border: `1px solid ${visualMode === 'heat' ? '#f5a62366' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '20px',
                color: visualMode === 'heat' ? '#f5a623' : '#a0a0a0',
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
              onClick={() => setVisualMode(mode => (mode === 'risk' ? 'off' : 'risk'))}
              data-testid="risk-toggle"
              style={{
                padding: '8px 16px',
                background: visualMode === 'risk' ? '#7c3aed22' : '#1a1a1a',
                border: `1px solid ${visualMode === 'risk' ? '#a855f766' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '20px',
                color: visualMode === 'risk' ? '#c084fc' : '#a0a0a0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
              title="Color nodes by React re-render risk (contexts consumed)"
            >
              ⚛ Risk
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

        <Controls
          fitViewOptions={FIT_VIEW_OPTIONS}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            boxShadow: 'none'
          }}
        />
        <MiniMap
          bgColor="rgba(13, 17, 28, 0.92)"
          maskColor="rgba(4, 7, 12, 0.72)"
          maskStrokeColor="rgba(129, 140, 248, 0.9)"
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            overflow: 'hidden'
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

const GraphCanvas = forwardRef(function GraphCanvas(props, ref) {
  return (
    <ReactFlowProvider>
      <FlowInnerWithRef ref={ref} {...props} />
    </ReactFlowProvider>
  )
})

export default GraphCanvas
