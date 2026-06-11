import React from 'react'

/**
 * ErrorState - Error display for panels
 */
export default function ErrorState({ message = 'An error occurred', testId = 'error' }) {
  const errorMessage = typeof message === 'string' ? message : 'Failed to load run details'
  
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
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
      <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '4px' }}>
        {errorMessage}
      </div>
    </div>
  )
}
