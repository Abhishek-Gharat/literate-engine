import React, { useState, useCallback, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../../styles.js'
import { GraphToolbar } from './GraphToolbar.jsx'
import { GraphFilters } from './GraphFilters.jsx'
import { NodeInspector } from './NodeInspector.jsx'
import { DEMO_NODES, DEMO_EDGES, DEMO_FINDINGS } from '../../demoData.js'

const NODE_TYPE_COLORS = {
  root: '#6366f1',
  page: '#0891b2',
  component: '#059669',
  hook: '#d97706',
  context: '#7c3aed',
  util: '#64748b',
  config: '#475569'
}

export function GraphView({ onBack }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [filteredTypes, setFilteredTypes] = useState([])
  const [depthFilter, setDepthFilter] = useState('all')
  const [showIssues, setShowIssues] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [mobileSheet, setMobileSheet] = useState(null) // 'filters' | 'inspector' | null

  // Initialize nodes and edges
  React.useEffect(() => {
    const flowNodes = DEMO_NODES.map((node, index) => ({
      id: node.id,
      type: 'default',
      position: { 
        x: 100 + (index % 5) * 200, 
        y: 100 + Math.floor(index / 5) * 150 
      },
      data: { ...node },
      style: {
        background: `${NODE_TYPE_COLORS[node.nodeType] || NODE_TYPE_COLORS.component}15`,
        border: `1px solid ${NODE_TYPE_COLORS[node.nodeType] || NODE_TYPE_COLORS.component}44`,
        borderRadius: DEMO_RADIUS.md,
        padding: '8px 12px',
        fontSize: DEMO_TYPOGRAPHY.sizes.sm,
        fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
        color: DEMO_COLORS.text.primary,
        minWidth: '120px',
        textAlign: 'center'
      }
    }))

    const flowEdges = DEMO_EDGES.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { 
        stroke: DEMO_COLORS.border.light, 
        strokeWidth: 1 
      }
    }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [setNodes, setEdges])

  // Handle responsive
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.map(node => {
      const matchesSearch = !searchQuery || 
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filteredTypes.length === 0 || 
        !filteredTypes.includes(node.data.nodeType)
      
      return {
        ...node,
        hidden: !matchesSearch || !matchesType
      }
    })
  }, [nodes, searchQuery, filteredTypes])

  const filteredEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      const shouldShow = !sourceNode?.hidden && !targetNode?.hidden
      
      return {
        ...edge,
        hidden: !shouldShow
      }
    })
  }, [edges, nodes])

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data)
    if (isMobile) {
      setMobileSheet('inspector')
    }
  }, [isMobile])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const toggleTypeFilter = useCallback((type) => {
    setFilteredTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }, [])

  const handleFitView = useCallback(() => {
    // ReactFlow fitView
  }, [])

  const handleReset = useCallback(() => {
    setFilteredTypes([])
    setDepthFilter('all')
    setSearchQuery('')
  }, [])

  const handleExport = useCallback(() => {
    console.log('Export graph')
  }, [])

  // Container styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: DEMO_COLORS.bg.primary,
    color: DEMO_COLORS.text.primary,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.sans,
    overflow: 'hidden'
  }

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  }

  const leftPanelStyle = {
    width: '280px',
    flexShrink: 0,
    background: DEMO_COLORS.bg.secondary,
    borderRight: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    display: isMobile ? 'none' : 'flex',
    flexDirection: 'column'
  }

  const canvasContainerStyle = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  }

  const rightPanelStyle = {
    width: '320px',
    flexShrink: 0,
    background: DEMO_COLORS.bg.secondary,
    borderLeft: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    display: isMobile ? 'none' : 'flex',
    flexDirection: 'column'
  }

  // Mobile floating buttons
  const mobileButtonsStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: isMobile ? 'flex' : 'none',
    gap: DEMO_SPACING.md,
    zIndex: 50
  }

  const floatingButtonStyle = {
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.full,
    color: DEMO_COLORS.text.primary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)'
  }

  // Mobile sheet styles
  const sheetOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    display: mobileSheet ? 'block' : 'none'
  }

  const sheetStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70vh',
    background: DEMO_COLORS.bg.secondary,
    borderTop: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: `${DEMO_RADIUS.xl} ${DEMO_RADIUS.xl} 0 0`,
    zIndex: 101,
    display: mobileSheet ? 'flex' : 'none',
    flexDirection: 'column',
    transform: mobileSheet ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${DEMO_TRANSITIONS.normal}`
  }

  const sheetHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const sheetContentStyle = {
    flex: 1,
    overflow: 'auto'
  }

  return (
    <div style={containerStyle}>
      <GraphToolbar
        onBack={onBack}
        onSearch={setSearchQuery}
        onFitView={handleFitView}
        onReset={handleReset}
        onExport={handleExport}
        searchQuery={searchQuery}
      />

      <div style={mainContentStyle}>
        <div style={leftPanelStyle}>
          <GraphFilters
            nodes={DEMO_NODES}
            filteredTypes={filteredTypes}
            onToggleType={toggleTypeFilter}
            depthFilter={depthFilter}
            onDepthChange={setDepthFilter}
            issues={DEMO_FINDINGS}
            showIssues={showIssues}
            onToggleIssues={() => setShowIssues(!showIssues)}
          />
        </div>

        <div style={canvasContainerStyle}>
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
            minZoom={0.2}
            maxZoom={4}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: DEMO_COLORS.border.light, strokeWidth: 1 }
            }}
          >
            <Background 
              color={DEMO_COLORS.border.DEFAULT} 
              gap={20} 
              size={1} 
            />
            <Controls 
              style={{
                background: DEMO_COLORS.bg.card,
                border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
                borderRadius: DEMO_RADIUS.md,
                margin: '16px'
              }}
            />
            <MiniMap 
              style={{
                background: DEMO_COLORS.bg.card,
                border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
                borderRadius: DEMO_RADIUS.md,
                margin: '16px'
              }}
              nodeColor={(node) => NODE_TYPE_COLORS[node.data?.nodeType] || NODE_TYPE_COLORS.component}
            />
          </ReactFlow>
        </div>

        <div style={rightPanelStyle}>
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onViewCode={() => console.log('View code')}
            onTracePath={() => console.log('Trace path')}
            onAskAI={() => console.log('Ask AI')}
            onShowDependencies={() => console.log('Show dependencies')}
          />
        </div>
      </div>

      {/* Mobile floating buttons */}
      <div style={mobileButtonsStyle}>
        <button 
          style={floatingButtonStyle}
          onClick={() => setMobileSheet('filters')}
        >
          <span>🔍</span>
          Filters
        </button>
        {selectedNode && (
          <button 
            style={floatingButtonStyle}
            onClick={() => setMobileSheet('inspector')}
          >
            <span>📋</span>
            Inspector
          </button>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <div 
        style={sheetOverlayStyle} 
        onClick={() => setMobileSheet(null)}
      />
      <div style={sheetStyle}>
        <div style={sheetHeaderStyle}>
          <h2 style={{
            fontSize: DEMO_TYPOGRAPHY.sizes.lg,
            fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
            margin: 0
          }}>
            {mobileSheet === 'filters' ? 'Filters' : 'Node Inspector'}
          </h2>
          <button 
            style={{
              background: 'transparent',
              border: 'none',
              color: DEMO_COLORS.text.muted,
              fontSize: '24px',
              cursor: 'pointer'
            }}
            onClick={() => setMobileSheet(null)}
          >
            ×
          </button>
        </div>
        <div style={sheetContentStyle}>
          {mobileSheet === 'filters' ? (
            <GraphFilters
              nodes={DEMO_NODES}
              filteredTypes={filteredTypes}
              onToggleType={toggleTypeFilter}
              depthFilter={depthFilter}
              onDepthChange={setDepthFilter}
              issues={DEMO_FINDINGS}
              showIssues={showIssues}
              onToggleIssues={() => setShowIssues(!showIssues)}
              isMobile
            />
          ) : (
            <NodeInspector
              node={selectedNode}
              onClose={() => setMobileSheet(null)}
              onViewCode={() => console.log('View code')}
              onTracePath={() => console.log('Trace path')}
              onAskAI={() => console.log('Ask AI')}
              onShowDependencies={() => console.log('Show dependencies')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
