import React from 'react'

export default function ChatInputArea({
  input,
  loading,
  onInputChange,
  onSend
}) {
  return (
    <div style={{
      padding: '10px 14px 14px',
      flexShrink: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#1a1a1a',
        border: '0.5px solid rgba(255,255,255,0.15)',
        borderRadius: '999px',
        padding: '8px 10px 8px 14px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <button
          aria-label="Add attachment"
          style={{
            width: '28px', height: '28px',
            borderRadius: '50%', border: 'none',
            background: 'transparent', color: '#6b6b6b',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            flexShrink: 0, padding: '0'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="What would you like to know?"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '13px',
            color: '#f5f5f5',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif"
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            aria-label="Voice input"
            style={{
              width: '28px', height: '28px',
              borderRadius: '50%', border: 'none',
              background: 'transparent', color: '#6b6b6b',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              flexShrink: 0, padding: '0'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
          <button
            aria-label="Send message"
            onClick={onSend}
            disabled={!input.trim() || loading}
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%', flexShrink: 0,
              border: 'none',
              background: !input.trim() || loading ? '#1a1a1a' : '#ffffff',
              color: !input.trim() || loading ? '#6b6b6b' : '#000000',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              padding: '0', opacity: !input.trim() || loading ? 0.4 : 1
            }}
            onMouseEnter={e => {
              if (input.trim() && !loading) {
                e.currentTarget.style.background = '#ffffff'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = !input.trim() || loading ? '#1a1a1a' : '#ffffff'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '10px'
      }}>
        🔒 Only file structure sent — no actual code
      </div>
    </div>
  )
}
