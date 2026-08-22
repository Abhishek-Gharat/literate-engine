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
    root: '#e2e2e2',
    component: '#5a9e6f',
    hook: '#b07a8a',
    page: '#4a7c9b',
    ghost: '#8a8a8a'
  }

  const color = TYPE_COLORS[node.nodeType] || '#e2e2e2'
  const importCount = node.imports?.length || 0
  const usedByCount = node.importedBy?.length || 0

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      {/* Node card */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.12)',
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
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '15px',
          fontWeight: '500',
          color: '#f5f5f5',
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
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b6b6b', marginBottom: '6px' }}>
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
            color: '#6b6b6b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}>Imports</div>
          {node.imports.map((imp, i) => (
            <div key={i} style={{
              padding: '7px 10px',
              marginBottom: '4px',
              background: '#1a1a1a',
              borderRadius: '6px',
              borderLeft: '2px solid #e2e2e2',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace"
            }}>{imp}</div>
          ))}
        </div>
      )}

      {/* Used By */}
      {node.importedBy?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            color: '#6b6b6b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}>Used By</div>
          {node.importedBy.map((imp, i) => (
            <div key={i} style={{
              padding: '7px 10px',
              marginBottom: '4px',
              background: '#1a1a1a',
              borderRadius: '6px',
              borderLeft: '2px solid #5a9e6f',
              color: '#86efac',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace"
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
          background: '#e2e2e222',
          border: '1px solid #e2e2e244',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600'
        }}
      >💬 Ask AI about this file →</button>
    </div>
  )
}
