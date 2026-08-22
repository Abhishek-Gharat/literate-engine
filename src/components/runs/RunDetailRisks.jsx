import React, { useMemo } from 'react'
import { getRerenderRisks } from '../../utils/rerenderRisk.js'

/**
 * RunDetailRisks - React re-render risk section: most-consumed contexts and
 * widely-used components that are not memoized.
 *
 * @param {Object} props
 * @param {Object|null} props.run - Run whose snapshot nodes carry signals
 */
export default function RunDetailRisks({ run }) {
  const risks = useMemo(() => {
    const snapshot = run?.snapshot || {}
    const nodes = snapshot.nodes || []
    if (nodes.length === 0) return null
    return getRerenderRisks(nodes)
  }, [run])

  if (!risks || (risks.contexts.length === 0 && risks.wideUnmemoized.length === 0)) {
    return null
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}
      >
        Re-render Risks
      </div>

      {risks.contexts.map((context) => (
        <div
          key={context.name}
          title={`Consumed in: ${context.files.join(', ')}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 2px',
            borderBottom: '1px solid #1e293b80',
            fontSize: '12px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: context.consumers >= 5 ? '#7c3aed' : '#a855f7',
              flexShrink: 0
            }} />
            <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{context.name}</code>
            <span style={{ color: '#64748b' }}>context</span>
          </span>
          <span style={{ fontFamily: 'monospace', color: '#c084fc' }}>
            {context.consumers} consumers
          </span>
        </div>
      ))}

      {risks.wideUnmemoized.map((entry) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 2px',
            borderBottom: '1px solid #1e293b80',
            fontSize: '12px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#fb923c', flexShrink: 0
            }} />
            <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{entry.id}</code>
            <span style={{ color: '#64748b' }}>unmemoized</span>
          </span>
          <span style={{ fontFamily: 'monospace', color: '#f5a623' }}>
            used by {entry.fanIn}
          </span>
        </div>
      ))}
    </div>
  )
}
