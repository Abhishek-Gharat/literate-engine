import React from 'react'

/**
 * InfoTab - Node information display
 * 
 * @param {Object} props
 * @param {Object} props.node - Node data
 * @param {Function} props.onSwitchToChat - Callback to switch to chat tab
 */
export default function InfoTab({ node, onSwitchToChat }) {
  if (!node) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '40px',
        gap: '10px',
        opacity: 0.3
      }}>
        <div style={{ fontSize: '24px' }}>📋</div>
        <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
          Click a node to see its info
        </div>
      </div>
    )
  }

  const TYPE_COLORS = {
    root: '#7c3aed',
    component: '#059669',
    hook: '#d97706',
    page: '#0891b2',
    ghost: '#475569'
  }

  const color = TYPE_COLORS[node.nodeType] || '#7c3aed'
  const importCount = node.imports?.length || 0
  const usedByCount = node.importedBy?.length || 0

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      {/* Node card */}
      <div style={{
        background: '#13131f',
        border: '1px solid #2a2a3d',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '3px 10px',
          background: `${color}22`,
          border: `1px solid ${color}44`,
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '10px',
            color: color,
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>{node.nodeType}</span>
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '15px',
          fontWeight: '700',
          color: '#f1f5f9',
          wordBreak: 'break-word'
        }}>{node.label}</div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {[
          { label: 'Imports', value: importCount, color: '#7c3aed' },
          { label: 'Used by', value: usedByCount, color: '#22c55e' },
          { label: 'Type', value: node.nodeType?.toUpperCase(), color },
          { label: 'Status', value: node.isGhost ? 'External' : 'Local', color: node.isGhost ? '#475569' : '#0891b2' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#13131f',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px' }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: stat.color,
              fontFamily: 'monospace'
            }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Imports */}
      {node.imports?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            color: '#475569',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}>Imports</div>
          {node.imports.map((imp, i) => (
            <div key={i} style={{
              padding: '7px 10px',
              marginBottom: '4px',
              background: '#13131f',
              borderRadius: '6px',
              borderLeft: '2px solid #7c3aed',
              color: '#a78bfa',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>{imp}</div>
          ))}
        </div>
      )}

      {/* Used By */}
      {node.importedBy?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            color: '#475569',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}>Used By</div>
          {node.importedBy.map((imp, i) => (
            <div key={i} style={{
              padding: '7px 10px',
              marginBottom: '4px',
              background: '#13131f',
              borderRadius: '6px',
              borderLeft: '2px solid #22c55e',
              color: '#86efac',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>{imp}</div>
          ))}
        </div>
      )}

      {/* Ask in chat button */}
      <button
        onClick={onSwitchToChat}
        style={{
          width: '100%',
          padding: '10px',
          background: '#7c3aed22',
          border: '1px solid #7c3aed44',
          borderRadius: '8px',
          color: '#a78bfa',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600'
        }}
      >💬 Ask AI about this file →</button>
    </div>
  )
}
