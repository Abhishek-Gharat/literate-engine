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
        background: 'linear-gradient(135deg, #ffffff, #a1a1a1)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px'
      }}>✦</div>
      <div style={{
        padding: '10px 14px',
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.12)',
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
            background: '#ffffff',
            animation: `bounce 1.2s ease ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  )
}
