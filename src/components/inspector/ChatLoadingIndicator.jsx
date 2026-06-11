import React from 'react'

/**
 * ChatLoadingIndicator - Loading state for AI response
 */
export default function ChatLoadingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div style={{
        width: '26px',
        height: '26px',
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px'
      }}>✦</div>
      <div style={{
        padding: '10px 14px',
        background: '#13131f',
        border: '1px solid #1e1e2e',
        borderRadius: '4px 16px 16px 16px',
        display: 'flex',
        gap: '5px',
        alignItems: 'center'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7c3aed',
            animation: `bounce 1.2s ease ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  )
}
