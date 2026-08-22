import React, { useMemo } from 'react'
import { ReactFlow, Background, ReactFlowProvider } from '@xyflow/react'
import dagre from 'dagre'
import { computeGraphDiff } from '../../utils/graphDiff'

const NODE_WIDTH = 190
const NODE_HEIGHT = 54

const STATUS_COLORS = {
  added: '#22c55e',
  removed: '#ef4444',
  unchanged: '#64748b',
}

function layoutNodes(nodes) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', ranksep: 70, nodesep: 30, marginx: 20, marginy: 20 })
  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  dagre.layout(g)
  return new Map(nodes.map((node) => {
    const pos = g.node(node.id)
    return [node.id, { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 }]
  }))
}

function buildFlowElements(diff) {
  const allNodes = [
    ...diff.addedNodes.map((node) => ({ node, status: 'added' })),
    ...diff.removedNodes.map((node) => ({ node, status: 'removed' })),
    ...diff.commonNodes.map((node) => ({ node, status: 'unchanged' })),
  ]
  const positions = layoutNodes(allNodes.map(({ node }) => node))

  const flowNodes = allNodes.map(({ node, status }) => {
    const color = STATUS_COLORS[status]
    const dim = status === 'unchanged'
    return {
      id: node.id,
      position: positions.get(node.id),
      draggable: false,
      data: { label: node.data?.label || node.id },
      style: {
        background: dim ? '#1a1a1a' : `${color}1f`,
        border: `1px solid ${dim ? 'rgba(255,255,255,0.14)' : color}`,
        borderRadius: '8px',
        color: dim ? '#a0a0a0' : color,
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', monospace",
        padding: '6px 10px',
        width: NODE_WIDTH,
        opacity: dim ? 0.55 : 1,
      },
    }
  })

  const toFlowEdge = (edge, status) => {
    const color = STATUS_COLORS[status]
    const dim = status === 'common'
    return {
      id: `diff-${status}-${edgeKeySafe(edge)}`,
      source: edge.source,
      target: edge.target,
      animated: status === 'added',
      style: {
        stroke: dim ? 'rgba(255,255,255,0.07)' : color,
        strokeWidth: dim ? 1 : 1.6,
        strokeDasharray: status === 'removed' ? '4 4' : undefined,
        opacity: dim ? 0.5 : 0.9,
      },
    }
  }

  const flowEdges = [
    ...diff.addedEdges.map((edge) => toFlowEdge(edge, 'added')),
    ...diff.removedEdges.map((edge) => toFlowEdge(edge, 'removed')),
    ...diff.commonEdges.map((edge) => toFlowEdge(edge, 'common')),
  ]

  return { flowNodes, flowEdges }
}

function edgeKeySafe(edge) {
  return edge.id || `${edge.source}__${edge.target}`
}

/**
 * GraphDiffModal - Full-screen read-only evolution view between two runs.
 * Green = added since previous run, red = removed, grey = unchanged.
 */
export default function GraphDiffModal({ previousRun, currentRun, onClose }) {
  const diff = useMemo(
    () => computeGraphDiff(previousRun, currentRun),
    [previousRun, currentRun]
  )

  if (!diff) return null

  const { summary } = diff
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexShrink: 0
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
            Graph Diff
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {new Date(previousRun.createdAt).toLocaleString()} → {new Date(currentRun.createdAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LegendChip color={STATUS_COLORS.added} label={`+${summary.addedFiles} files`} />
          <LegendChip color={STATUS_COLORS.removed} label={`-${summary.removedFiles} files`} />
          <LegendChip color="#94a3b8" label={`${summary.unchangedFiles} unchanged`} />
          <LegendChip color={STATUS_COLORS.added} label={`+${summary.addedDeps} deps`} dashed />
          <LegendChip color={STATUS_COLORS.removed} label={`-${summary.removedDeps} deps`} dashed />
          <button
            onClick={onClose}
            data-testid="graph-diff-close"
            style={{
              width: '32px',
              height: '32px',
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#ededed',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1
            }}
          >×</button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden' }}>
        <ReactFlowProvider>
          <FlowCanvas diff={diff} />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

function FlowCanvas({ diff }) {
  const { flowNodes, flowEdges } = useMemo(() => buildFlowElements(diff), [diff])

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      fitView
      fitViewOptions={{ padding: 0.08 }}
      minZoom={0.2}
      maxZoom={1.5}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="rgba(255,255,255,0.06)" gap={24} size={1} />
    </ReactFlow>
  )
}

function LegendChip({ color, label, dashed = false }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: 'monospace',
      color,
      padding: '3px 9px',
      borderRadius: '999px',
      border: `1px solid ${color}44`,
      background: `${color}12`
    }}>
      <span style={{
        width: '10px',
        height: 0,
        borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}`
      }} />
      {label}
    </span>
  )
}
