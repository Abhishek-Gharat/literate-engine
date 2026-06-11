import React from 'react'

/**
 * RunDetailActionHint - Action hint section
 */
export default function RunDetailActionHint() {
  return (
    <div
      data-testid="run-detail-action-hint"
      style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #7c3aed15, #4f46e515)',
        borderRadius: '8px',
        border: '1px solid #7c3aed30',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500', marginBottom: '4px' }}>
        Click "View Graph" to open visualization
      </div>
      <div style={{ fontSize: '12px', color: '#7c3aed' }}>
        Explore the component dependency graph
      </div>
    </div>
  )
}
