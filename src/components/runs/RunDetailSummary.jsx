import React from 'react'

/**
 * RunDetailSummary - Analysis summary section
 * 
 * @param {Object} props
 * @param {Object} props.stats - Run statistics
 * @param {boolean} props.hasSnapshot - Whether snapshot exists
 * @param {string} props.insight - Generated insight text
 */
export default function RunDetailSummary({ stats, hasSnapshot, insight }) {
  const totalFiles = stats?.totalFiles || 0
  const totalComponents = stats?.totalComponents || 0

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#7c3aed',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '12px'
        }}
      >
        Analysis Summary
      </div>
      <div
        data-testid="run-detail-summary"
        style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #1e293b, #13131f)',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Files</div>
            <div style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600' }}>{totalFiles}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Components</div>
            <div style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600' }}>{totalComponents}</div>
          </div>
        </div>
        <div
          style={{
            padding: '8px 12px',
            background: hasSnapshot ? '#22c55e15' : '#334155',
            borderRadius: '6px',
            border: hasSnapshot ? '1px solid #22c55e30' : '1px solid #475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px'
          }}
        >
          <span style={{ fontSize: '10px', color: hasSnapshot ? '#22c55e' : '#94a3b8' }}>
            {hasSnapshot ? '✓ Snapshot ready' : '— No snapshot'}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500' }}>
          {insight}
        </div>
      </div>
    </div>
  )
}
