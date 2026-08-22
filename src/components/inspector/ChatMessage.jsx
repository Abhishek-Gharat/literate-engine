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
          background: '#ffffff',
          borderRadius: '16px 16px 4px 16px'
        }}>
          <span style={{ fontSize: '13px', color: '#000000', lineHeight: '1.6' }}>
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
        background: 'linear-gradient(135deg, #ffffff, #a1a1a1)',
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
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '4px 16px 16px 16px'
      }}>
        <RenderMessage text={msg.content} />
        {msg.streaming && (
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '14px',
            background: '#e2e2e2',
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
              <span style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }}>•</span>
            )}
            <span style={{ fontSize: '13px', lineHeight: '1.7', color: '#a1a1a1' }}>
              {parts.map((part, j) => {
                if (j % 3 === 1) return (
                  <strong key={j} style={{ color: '#ededed', fontWeight: '500' }}>{part}</strong>
                )
                if (j % 3 === 2) return (
                  <code key={j} style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace"
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
