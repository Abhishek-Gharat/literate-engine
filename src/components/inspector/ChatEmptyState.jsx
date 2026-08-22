import React from 'react'

/**
 * ChatEmptyState - Empty state for chat with quick action chips
 */
export default function ChatEmptyState({ hasNode, onQuickSend }) {
  const quickChips = hasNode ? [
    'What does this file do?',
    'Why does it have so many imports?',
    'What would break if this was removed?',
    'Is this file well structured?',
  ] : [
    'Give me an overview of this project',
    'Which file is most critical?',
    'Are there any architecture problems?',
    'How is state managed?',
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      paddingTop: '10px'
    }}>
      <div style={{ fontSize: '28px' }}>🧠</div>
      <div style={{
        color: '#a1a1a1',
        fontSize: '13px',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        {hasNode
          ? 'Ask me anything about this file'
          : 'Ask me anything about your project'
        }
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {quickChips.slice(0, 4).map((chip, i) => (
          <button
            key={i}
            onClick={() => onQuickSend(chip)}
            style={{
              padding: '9px 12px',
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#a1a1a1',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              lineHeight: '1.4',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = '#a1a1a1'
              e.currentTarget.style.background = '#1a1a1a'
            }}
          >{chip}</button>
        ))}
      </div>
    </div>
  )
}
