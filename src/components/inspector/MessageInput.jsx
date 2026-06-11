import React from 'react'

/**
 * MessageInput - Message input area
 */
export default function MessageInput({ input, loading, onInputChange, onSend }) {
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder="Ask anything... (Enter to send)"
        rows={2}
        style={{
          width: '100%',
          padding: '10px 44px 10px 14px',
          background: '#13131f',
          border: `1px solid ${input ? '#7c3aed66' : '#1e1e2e'}`,
          borderRadius: '12px',
          color: '#f1f5f9',
          fontSize: '13px',
          outline: 'none',
          resize: 'none',
          lineHeight: '1.5',
          fontFamily: 'system-ui, sans-serif',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || loading}
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          width: '28px',
          height: '28px',
          background: input.trim() && !loading ? '#7c3aed' : '#1e1e2e',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          transition: 'all 0.2s'
        }}
      >↑</button>
    </div>
  )
}
