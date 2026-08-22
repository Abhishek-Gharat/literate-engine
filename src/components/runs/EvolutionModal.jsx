import React, { useMemo, useRef, useState, useEffect } from 'react'
import { ReactFlow, Background, ReactFlowProvider } from '@xyflow/react'
import dagre from 'dagre'
import { buildEvolutionSteps } from '../../utils/evolution'

const NODE_WIDTH = 170
const NODE_HEIGHT = 50

const STATUS_STYLE = {
  base: { border: '1px solid rgba(255,255,255,0.25)', color: '#e2e2e2', bg: '#1a1a1a' },
  added: { border: '1px solid #22c55e', color: '#4ade80', bg: '#22c55e1f' },
  unchanged: { border: '1px solid rgba(255,255,255,0.12)', color: '#8a8a8a', bg: '#141414' },
}

function layout(nodes) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', ranksep: 60, nodesep: 26, marginx: 16, marginy: 16 })
  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  dagre.layout(g)
  return new Map(nodes.map((node) => {
    const pos = g.node(node.id)
    return [node.id, { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 }]
  }))
}

/**
 * EvolutionModal - Scrub or play through how the architecture changed
 * across every saved run of a project.
 */
export default function EvolutionModal({ runs = [], onClose }) {
  const steps = useMemo(() => buildEvolutionSteps(runs), [runs])
  const [stepIndex, setStepIndex] = useState(steps.length > 0 ? steps.length - 1 : 0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const togglePlay = () => {
    if (playing) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setPlaying(false)
      return
    }
    if (steps.length < 2) return
    let next = stepIndex >= steps.length - 1 ? 0 : stepIndex + 1
    setStepIndex(next)
    timerRef.current = setInterval(() => {
      next += 1
      if (next >= steps.length) {
        clearInterval(timerRef.current)
        timerRef.current = null
        setPlaying(false)
        return
      }
      setStepIndex(next)
    }, 1400)
    setPlaying(true)
  }

  if (!steps.length) return null

  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const healthScore = typeof step.run.stats?.healthScore === 'number'
    ? step.run.stats.healthScore
    : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
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
        flexShrink: 0,
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
            ⏱ Evolution Time-Traveller
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Step {stepIndex + 1} / {steps.length} · {new Date(step.run.createdAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Chip label={`${step.summary.totalFiles} files`} />
          <Chip label={`${step.summary.components} comps`} />
          {healthScore !== null && (
            <Chip label={`♥ ${healthScore}`} color="#f5a623" />
          )}
          {step.summary.addedCount > 0 && (
            <Chip label={`+${step.summary.addedCount}`} color="#22c55e" />
          )}
          {step.removed.length > 0 && (
            <Chip label={`-${step.removed.length}`} color="#ef4444" />
          )}
          <button
            onClick={onClose}
            data-testid="evolution-close"
            style={{
              width: '32px', height: '32px',
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#ededed', cursor: 'pointer',
              fontSize: '16px', lineHeight: 1
            }}
          >×</button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden' }}>
        <ReactFlowProvider>
          <StepCanvas step={step} />
        </ReactFlowProvider>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginTop: '12px',
        flexShrink: 0
      }}>
        <button
          onClick={togglePlay}
          data-testid="evolution-play"
          disabled={steps.length < 2}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: playing ? '#e2e2e2' : '#ffffff',
            border: 'none',
            color: '#000000',
            fontSize: '14px',
            fontWeight: '800',
            cursor: steps.length < 2 ? 'not-allowed' : 'pointer',
            opacity: steps.length < 2 ? 0.4 : 1
          }}
        >{playing ? '❚❚' : '▶'}</button>
        <input
          type="range"
          min={0}
          max={Math.max(steps.length - 1, 0)}
          value={stepIndex}
          data-testid="evolution-slider"
          onChange={(e) => {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
              setPlaying(false)
            }
            setStepIndex(Number(e.target.value))
          }}
          style={{ flex: 1, accentColor: '#ffffff' }}
        />
        <span style={{ fontSize: '11px', color: '#6b6b6b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          green = new since previous run · grey ghost = removed
        </span>
      </div>
    </div>
  )
}

function StepCanvas({ step }) {
  const { flowNodes, flowEdges } = useMemo(() => {
    const visible = step.nodes.map(({ node }) => node)
    const positions = layout([...visible, ...step.removed])

    const flowNodes = [
      ...step.nodes.map(({ node, status }) => {
        const s = STATUS_STYLE[status]
        return {
          id: node.id,
          position: positions.get(node.id),
          draggable: false,
          data: { label: node.data?.label || node.id },
          style: {
            background: s.bg,
            border: s.border,
            borderRadius: '7px',
            color: s.color,
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            width: NODE_WIDTH,
            opacity: status === 'unchanged' ? 0.5 : 1,
          }
        }
      }),
      ...step.removed.map((node) => ({
        id: node.id,
        position: positions.get(node.id),
        draggable: false,
        data: { label: node.data?.label || node.id },
        style: {
          background: 'transparent',
          border: '1px dashed #ef444488',
          borderRadius: '7px',
          color: '#ef4444aa',
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          width: NODE_WIDTH,
          opacity: 0.45,
        }
      })),
    ]

    const flowEdges = (step.run.snapshot?.edges || [])
      .filter((edge) => edge.source && edge.target)
      .map((edge) => ({
        id: `evo-${edge.id || `${edge.source}__${edge.target}`}`,
        source: edge.source,
        target: edge.target,
        style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 },
      }))

    return { flowNodes, flowEdges }
  }, [step])

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

function Chip({ label, color }) {
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: 'monospace',
      color: color || '#94a3b8',
      padding: '3px 9px',
      borderRadius: '999px',
      border: `1px solid ${color ? `${color}44` : 'rgba(255,255,255,0.15)'}`,
      background: color ? `${color}12` : 'rgba(30,41,59,0.6)'
    }}>{label}</span>
  )
}
