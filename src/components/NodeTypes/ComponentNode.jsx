import { Handle, Position } from '@xyflow/react'

const TYPE_CONFIG = {
  root:      { icon: '⚡', color: '#e2e2e2', label: 'Root' },
  entry:     { icon: '🚪', color: '#4a7c9b', label: 'Entry Point' },
  page:      { icon: '📄', color: '#4a7c9b', label: 'Page' },
  component: { icon: '🧩', color: '#5a9e6f', label: 'Component' },
  hook:      { icon: '🪝', color: '#b07a8a', label: 'Hook' },
  index:     { icon: '📦', color: '#8b6fb0', label: 'Index' },
  ghost:     { icon: '👻', color: '#8a8a8a', label: 'External' },
}

const HEAT_LEVELS = {
  1: { color: '#f5a623', name: 'warm' },
  2: { color: '#fb923c', name: 'hot' },
  3: { color: '#ef4444', name: 'critical' },
}

const RISK_LEVELS = {
  1: { color: '#d8b4fe', name: 'elevated' },
  2: { color: '#a855f7', name: 'high' },
  3: { color: '#7c3aed', name: 'critical' },
}

export default function ComponentNode({ data, selected }) {
  const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.component
  const importCount = data.imports?.length || 0
  const usedByCount = data.importedBy?.length || 0
  const heat = data.heatEnabled && data.heatLevel > 0 ? HEAT_LEVELS[data.heatLevel] : null
  const risk = data.riskEnabled && data.riskLevel > 0 ? RISK_LEVELS[data.riskLevel] : null
  const accent = heat || risk
  const consumers = data.signals?.contextConsumers?.length || 0

  return (
    <div
      title={
        heat
          ? `${usedByCount} files depend on this (${heat.name})`
          : risk
            ? `${consumers} context${consumers === 1 ? '' : 's'} consumed (${risk.name} re-render risk)`
            : undefined
      }
      style={{
      background: accent
        ? `linear-gradient(90deg, ${accent.color}14, #1a1a1a 45%)`
        : selected ? '#1a1a1a' : '#1a1a1a',
      border: `1px solid ${selected ? config.color : 'rgba(255,255,255,0.12)'}`,
      borderLeft: accent ? `3px solid ${accent.color}` : undefined,
      borderRadius: '10px',
      minWidth: '170px',
      maxWidth: '200px',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: selected
        ? `0 0 0 1px ${config.color}, 0 8px 32px ${config.color}33`
        : '0 2px 8px #00000066',
      transition: 'all 0.15s ease',
      overflow: 'hidden',
      cursor: 'pointer',
    }}>

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: config.color,
          width: 7, height: 7,
          border: '2px solid #0a0a12',
          top: -4
        }}
      />

      {/* Type header */}
      <div style={{
        padding: '7px 10px 5px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        borderBottom: `1px solid rgba(255,255,255,0.12)`,
      }}>
        <span style={{ fontSize: '11px' }}>{config.icon}</span>
        <span style={{
          fontSize: '10px',
          color: config.color,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}>{config.label}</span>
        {heat && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '9px',
            fontWeight: '700',
            fontFamily: 'monospace',
            color: heat.color,
            background: `${heat.color}1a`,
            border: `1px solid ${heat.color}44`,
            padding: '0 5px',
            borderRadius: '4px'
          }}>{usedByCount}×</span>
        )}
        {risk && (
          <span style={{
            marginLeft: heat ? 0 : 'auto',
            fontSize: '9px',
            fontWeight: '700',
            fontFamily: 'monospace',
            color: risk.color,
            background: `${risk.color}1a`,
            border: `1px solid ${risk.color}44`,
            padding: '0 5px',
            borderRadius: '4px'
          }}>⚛{consumers}</span>
        )}
        {data.isGhost && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '9px',
            color: '#6b6b6b',
            background: 'rgba(255,255,255,0.08)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>external</span>
        )}
      </div>

{/* Filename */}
<div style={{
  padding: '8px 10px 6px',
  color: '#f5f5f5',
  fontWeight: '500',
  fontSize: '13px',
  fontFamily: "'JetBrains Mono', monospace",
  wordBreak: 'break-word',
  lineHeight: '1.4',
  letterSpacing: '0.2px'
}}>
  {data.label}
</div>

{/* Stats */}
<div style={{
  padding: '4px 10px 8px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
}}>
  <span style={{
    fontSize: '11px',
    color: importCount > 0 ? '#8b6fb0' : 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', gap: '4px',
    fontWeight: '500'
  }}>
    ↓ <span>{importCount} imp</span>
  </span>
  <span style={{
    fontSize: '11px',
    color: usedByCount > 0 ? '#5a9e6f' : 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', gap: '4px',
    fontWeight: '500'
  }}>
    ↑ <span>{usedByCount} used</span>
  </span>
</div>


      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: config.color,
          width: 7, height: 7,
          border: '2px solid #0a0a12',
          bottom: -4
        }}
      />
    </div>
  )
}