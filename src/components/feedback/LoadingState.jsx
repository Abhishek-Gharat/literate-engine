import React from 'react'

/**
 * LoadingState - Loading indicator for panels
 */
export default function LoadingState({ icon = '⏳', message = 'Loading...', testId = 'loading' }) {
  return (
    <div
      data-testid={testId}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{message}</div>
    </div>
  )
}
