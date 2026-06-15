import { Handle, Position } from '@xyflow/react'

const TYPE_CONFIG = {
  root:      { icon: '⚡', color: '#7c3aed', label: 'Root' },
  entry:     { icon: '🚪', color: '#f59e0b', label: 'Entry Point' },
  page:      { icon: '📄', color: '#0891b2', label: 'Page' },
  component: { icon: '🧩', color: '#059669', label: 'Component' },
  hook:      { icon: '🪝', color: '#d97706', label: 'Hook' },
  index:     { icon: '📦', color: '#6366f1', label: 'Index' },
  ghost:     { icon: '👻', color: '#475569', label: 'External' },
}

export default function ComponentNode({ data, selected }) {
  const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.component
  const importCount = data.imports?.length || 0
  const usedByCount = data.importedBy?.length || 0

  return (
    <div style={{
      background: selected ? '#13131f' : '#13131f',
      border: `1px solid ${selected ? config.color : '#2a2a3d'}`,
      borderRadius: '10px',
      minWidth: '170px',
      maxWidth: '200px',
      fontFamily: 'system-ui, sans-serif',
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
        borderBottom: `1px solid #1e1e2e`,
      }}>
        <span style={{ fontSize: '11px' }}>{config.icon}</span>
        <span style={{
          fontSize: '10px',
          color: config.color,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}>{config.label}</span>
        {data.isGhost && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '9px',
            color: '#475569',
            background: '#1e293b',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>external</span>
        )}
      </div>

{/* Filename */}
<div style={{
  padding: '8px 10px 6px',
  color: '#f1f5f9',
  fontWeight: '700',
  fontSize: '13px',
  fontFamily: 'monospace',
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
    color: importCount > 0 ? '#818cf8' : '#334155',
    display: 'flex', alignItems: 'center', gap: '4px',
    fontWeight: '500'
  }}>
    ↓ <span>{importCount} imp</span>
  </span>
  <span style={{
    fontSize: '11px',
    color: usedByCount > 0 ? '#34d399' : '#334155',
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