import React from 'react'

/**
 * ChatErrorMessage - Error display in chat
 */
export default function ChatErrorMessage({ error }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: '#1f0a0a',
      border: '1px solid #7f1d1d',
      borderRadius: '8px',
      color: '#fca5a5',
      fontSize: '12px'
    }}>❌ {error}</div>
  )
}
