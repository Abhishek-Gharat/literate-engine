import React, { useState, useCallback, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS,
  DEMO_SHADOWS 
} from '../styles.js'
import { getNodeColor } from '../../utils/nodeColors.js'

const NODE_TYPE_CONFIG = {
  page: { icon: '📄', color: DEMO_COLORS.node.page, label: 'Page' },
  component: { icon: '🧩', color: DEMO_COLORS.node.component, label: 'Component' },
  hook: { icon: '🪝', color: DEMO_COLORS.node.hook, label: 'Hook' },
  context: { icon: '📦', color: DEMO_COLORS.node.context, label: 'Context' },
  util: { icon: '🔧', color: DEMO_COLORS.node.util, label: 'Util' },
  config: { icon: '⚙', color: DEMO_COLORS.node.config, label: 'Config' },
  root: { icon: '⚡', color: DEMO_COLORS.node.root, label: 'Entry' }
}

const filterableTypes = ['page', 'component', 'hook', 'context', 'util', 'config', 'root']

/**
 * DemoGraphView - Graph visualization with guided exploration
 * Left panel: filters and issues
 * Center: graph canvas  
 * Right panel: inspector / AI panel
 */
export function DemoGraphView({ 
  nodes: initialNodes, 
  edges: initialEdges, 
  onBack,
  findings = []
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filteredTypes, setFilteredTypes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [depthFilter, setDepthFilter] = useState('all')
  const [showIssues, setShowIssues] = useState(true)

  // Filter nodes based on search and type filters
  const filteredNodes = useMemo(() => {
    return nodes.map(node => {
      const matchesSearch = !searchQuery || 
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filteredTypes.length === 0 || 
        filteredTypes.includes(node.data.nodeType)
      
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
  }, [])

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

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: DEMO_COLORS.bg.primary,
    color: DEMO_COLORS.text.primary,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.sans,
    overflow: 'hidden'
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: `0 ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    background: DEMO_COLORS.bg.secondary,
    flexShrink: 0
  }

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg
  }

  const headerRightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md
  }

  const toolbarButtonStyle = {
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.tertiary,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.secondary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const searchInputStyle = {
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.input,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.primary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    width: '200px',
    outline: 'none'
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
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }

  const canvasStyle = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  }

  const rightPanelStyle = {
    width: selectedNode ? '320px' : '0',
    flexShrink: 0,
    background: DEMO_COLORS.bg.secondary,
    borderLeft: selectedNode ? `1px solid ${DEMO_COLORS.border.DEFAULT}` : 'none',
    overflow: 'hidden',
    transition: `width ${DEMO_TRANSITIONS.normal}`
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <button 
            style={toolbarButtonStyle}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DEMO_COLORS.border.light
              e.currentTarget.style.color = DEMO_COLORS.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
              e.currentTarget.style.color = DEMO_COLORS.text.secondary
            }}
          >
            ← Back
          </button>
          <span style={{ color: DEMO_COLORS.text.muted }}>|</span>
          <span style={{ fontWeight: DEMO_TYPOGRAPHY.weights.semibold }}>
            Dependency Graph
          </span>
        </div>

        <div style={headerRightStyle}>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
          <button style={toolbarButtonStyle}>Fit</button>
          <button style={toolbarButtonStyle}>Reset</button>
          <button style={toolbarButtonStyle}>Export</button>
        </div>
      </header>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Left Panel - Filters */}
        <div style={leftPanelStyle}>
          <div style={{ 
            padding: DEMO_SPACING.lg,
            borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
            flexShrink: 0
          }}>
            <h3 style={{ 
              fontSize: DEMO_TYPOGRAPHY.sizes.sm, 
              fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: DEMO_COLORS.text.muted,
              margin: `0 0 ${DEMO_SPACING.lg} 0`
            }}>
              Node Types
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: DEMO_SPACING.sm }}>
              {filterableTypes.map(type => {
                const config = NODE_TYPE_CONFIG[type]
                const isActive = !filteredTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: DEMO_SPACING.md,
                      padding: DEMO_SPACING.md,
                      background: isActive ? DEMO_COLORS.bg.elevated : 'transparent',
                      border: `1px solid ${isActive ? config.color + '44' : DEMO_COLORS.border.DEFAULT}`,
                      borderRadius: DEMO_RADIUS.md,
                      cursor: 'pointer',
                      transition: `all ${DEMO_TRANSITIONS.fast}`
                    }}
                  >
                    <span style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: DEMO_RADIUS.full, 
                      background: config.color 
                    }} />
                    <span style={{ 
                      flex: 1, 
                      textAlign: 'left',
                      color: DEMO_COLORS.text.secondary,
                      fontSize: DEMO_TYPOGRAPHY.sizes.sm
                    }}>
                      {config.label}
                    </span>
                    <span style={{
                      fontSize: DEMO_TYPOGRAPHY.sizes.xs,
                      color: DEMO_COLORS.text.muted,
                      background: DEMO_COLORS.bg.tertiary,
                      padding: `${DEMO_SPACING.xs} ${DEMO_SPACING.sm}`,
                      borderRadius: DEMO_RADIUS.sm
                    }}>
                      {nodes.filter(n => n.data.nodeType === type).length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ 
            padding: DEMO_SPACING.lg,
            flex: 1,
            overflow: 'auto'
          }}>
            <h3 style={{ 
              fontSize: DEMO_TYPOGRAPHY.sizes.sm, 
              fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: DEMO_COLORS.text.muted,
              margin: `0 0 ${DEMO_SPACING.lg} 0`
            }}>
              Findings
            </h3>
            {findings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: DEMO_SPACING.md }}>
                {findings.slice(0, 3).map(finding => (
                  <div
                    key={finding.id}
                    style={{
                      padding: DEMO_SPACING.md,
                      background: DEMO_COLORS.bg.elevated,
                      borderRadius: DEMO_RADIUS.md,
                      borderLeft: `3px solid ${finding.type === 'positive' ? DEMO_COLORS.status.success : DEMO_COLORS.status.info}`
                    }}
                  >
                    <div style={{
                      fontSize: DEMO_TYPOGRAPHY.sizes.sm,
                      fontWeight: DEMO_TYPOGRAPHY.weights.medium,
                      color: DEMO_COLORS.text.primary,
                      marginBottom: DEMO_SPACING.xs
                    }}>
                      {finding.title}
                    </div>
                    <div style={{
                      fontSize: DEMO_TYPOGRAPHY.sizes.xs,
                      color: DEMO_COLORS.text.muted
                    }}>
                      {finding.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: DEMO_COLORS.text.muted, fontSize: DEMO_TYPOGRAPHY.sizes.sm }}>
                No issues found
              </p>
            )}
          </div>
        </div>

        {/* Center - Graph Canvas */}
        <div style={canvasStyle}>
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
            <Background color={DEMO_COLORS.border.DEFAULT} gap={20} size={1} />
            <Controls 
              style={{
                background: DEMO_COLORS.bg.card,
                border: `1px solid ${DEMO_COLORS.border.DEFAULT}`
              }}
            />
            <MiniMap 
              style={{
                background: DEMO_COLORS.bg.card,
                border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
                borderRadius: DEMO_RADIUS.md
              }}
              nodeColor={(node) => getNodeColor(node.data?.nodeType)}
            />
          </ReactFlow>
        </div>

        {/* Right Panel - Inspector */}
        <div style={rightPanelStyle}>
          {selectedNode && (
            <NodeInspectorPanel 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * NodeInspectorPanel - Right panel showing node details and actions
 */
function NodeInspectorPanel({ node, onClose }) {
  const config = NODE_TYPE_CONFIG[node.nodeType] || NODE_TYPE_CONFIG.component
  
  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }

  const headerStyle = {
    padding: DEMO_SPACING.lg,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DEMO_SPACING.md
  }

  const typeBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.xs} ${DEMO_SPACING.sm}`,
    background: `${config.color}22`,
    border: `1px solid ${config.color}44`,
    borderRadius: DEMO_RADIUS.sm,
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: config.color,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: DEMO_COLORS.text.muted,
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    cursor: 'pointer',
    padding: DEMO_SPACING.sm,
    lineHeight: 1
  }

  const contentStyle = {
    flex: 1,
    padding: DEMO_SPACING.lg,
    overflow: 'auto'
  }

  const nameStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    color: DEMO_COLORS.text.primary,
    margin: `0 0 ${DEMO_SPACING.xl} 0`,
    wordBreak: 'break-word'
  }

  const sectionStyle = {
    marginBottom: DEMO_SPACING.xl
  }

  const sectionTitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: `0 0 ${DEMO_SPACING.md} 0`
  }

  const metricStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DEMO_SPACING.md} 0`,
    borderBottom: `1px solid ${DEMO_COLORS.border.subtle}`
  }

  const metricLabelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary
  }

  const metricValueStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary
  }

  const actionsStyle = {
    padding: DEMO_SPACING.lg,
    borderTop: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md
  }

  const primaryActionStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.accent.DEFAULT,
    color: '#fff',
    border: 'none',
    borderRadius: DEMO_RADIUS.md,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const secondaryActionStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: 'transparent',
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.secondary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={typeBadgeStyle}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>

      <div style={contentStyle}>
        <h2 style={nameStyle}>{node.label}</h2>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Metrics</h3>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Imports</span>
            <span style={metricValueStyle}>{node.imports?.length || 0}</span>
          </div>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Used By</span>
            <span style={metricValueStyle}>{node.importedBy?.length || 0}</span>
          </div>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Entry Point</span>
            <span style={metricValueStyle}>
              {node.isEntryPoint ? (
                <span style={{ color: DEMO_COLORS.status.success }}>Yes</span>
              ) : (
                <span style={{ color: DEMO_COLORS.text.muted }}>No</span>
              )}
            </span>
          </div>
        </div>

        {node.imports?.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Imports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: DEMO_SPACING.sm }}>
              {node.imports.map((imp, i) => (
                <div key={i} style={{
                  padding: DEMO_SPACING.sm,
                  background: DEMO_COLORS.bg.elevated,
                  borderRadius: DEMO_RADIUS.sm,
                  fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
                  fontSize: DEMO_TYPOGRAPHY.sizes.xs,
                  color: DEMO_COLORS.text.secondary
                }}>
                  {imp}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={actionsStyle}>
        <button 
          style={primaryActionStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = DEMO_COLORS.accent.dark
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = DEMO_COLORS.accent.DEFAULT
          }}
        >
          <span>💬</span>
          Ask AI about this file
        </button>
        <button 
          style={secondaryActionStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>🔍</span>
          Trace Path
        </button>
      </div>
    </div>
  )
}
