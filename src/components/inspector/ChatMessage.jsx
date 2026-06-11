import React from 'react'

/**
 * ChatMessage - Renders a single chat message (user or assistant)
 * 
 * @param {Object} props
 * @param {Object} props.msg - Message object with role, content, id, streaming
 */
export default function ChatMessage({ msg }) {
  if (msg.role === 'user') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: '8px',
        alignItems: 'flex-start'
      }}>
        <div style={{
          maxWidth: '82%',
          padding: '10px 14px',
          background: '#7c3aed',
          borderRadius: '16px 16px 4px 16px'
        }}>
          <span style={{ fontSize: '13px', color: '#fff', lineHeight: '1.6' }}>
            {msg.content}
          </span>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '26px',
        height: '26px',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        marginTop: '2px'
      }}>✦</div>
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        background: '#13131f',
        border: '1px solid #1e1e2e',
        borderRadius: '4px 16px 16px 16px'
      }}>
        <RenderMessage text={msg.content} />
        {msg.streaming && (
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '14px',
            background: '#818cf8',
            marginLeft: '2px',
            verticalAlign: 'middle',
            animation: 'blink 1s ease infinite'
          }} />
        )}
      </div>
    </div>
  )
}

/**
 * RenderMessage - Renders message text with markdown-like formatting
 * 
 * @param {Object} props
 * @param {string} props.text - Message text content
 */
function RenderMessage({ text }) {
  if (!text) return null

  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />
        const isBullet = /^[-•*]/.test(line.trim())
        const clean = isBullet ? line.replace(/^[-•*]\s*/, '') : line
        const parts = clean.split(/\*\*(.*?)\*\*|`(.*?)`/g)
        return (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '5px' }}>
            {isBullet && (
              <span style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }}>•</span>
            )}
            <span style={{ fontSize: '13px', lineHeight: '1.7', color: '#cbd5e1' }}>
              {parts.map((part, j) => {
                if (j % 3 === 1) return (
                  <strong key={j} style={{ color: '#f1f5f9', fontWeight: '600' }}>{part}</strong>
                )
                if (j % 3 === 2) return (
                  <code key={j} style={{
                    background: '#1e1e3f',
                    color: '#a78bfa',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>{part}</code>
                )
                return <span key={j}>{part}</span>
              })}
            </span>
          </div>
        )
      })}
    </>
  )
}
