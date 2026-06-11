import React from 'react'

/**
 * EmptyState - Empty state for panels
 */
export default function EmptyState({ 
  icon = '📊', 
  title = 'No Data', 
  subtitle = 'Select an item to view details',
  testId = 'empty'
}) {
  return (
    <div
      data-testid={testId}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>
        {subtitle}
      </div>
    </div>
  )
}
