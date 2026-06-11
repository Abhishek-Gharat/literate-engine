import React from 'react'

/**
 * RunDetailSnapshot - Snapshot status section
 * 
 * @param {Object} props
 * @param {boolean} props.hasSnapshot - Whether snapshot exists
 */
export default function RunDetailSnapshot({ hasSnapshot }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}
      >
        Snapshot
      </div>
      <div
        data-testid="run-detail-snapshot"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: hasSnapshot ? '#22c55e15' : '#334155',
          borderRadius: '8px',
          border: hasSnapshot ? '1px solid #22c55e40' : '1px solid #475569'
        }}
      >
        <span style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: hasSnapshot ? '#22c55e' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px'
        }}>{hasSnapshot ? '✓' : '—'}</span>
        <span
          style={{
            fontSize: '13px',
            color: hasSnapshot ? '#22c55e' : '#94a3b8',
            fontWeight: '500'
          }}
        >
          {hasSnapshot ? 'Ready to visualize' : 'No snapshot data'}
        </span>
      </div>
    </div>
  )
}
