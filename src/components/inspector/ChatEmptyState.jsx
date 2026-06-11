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
        color: '#64748b',
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
              background: '#13131f',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              lineHeight: '1.4',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#7c3aed44'
              e.currentTarget.style.color = '#c4b5fd'
              e.currentTarget.style.background = '#7c3aed11'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e1e2e'
              e.currentTarget.style.color = '#94a3b8'
              e.currentTarget.style.background = '#13131f'
            }}
          >{chip}</button>
        ))}
      </div>
    </div>
  )
}
