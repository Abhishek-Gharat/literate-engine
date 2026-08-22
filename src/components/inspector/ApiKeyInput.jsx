import React from 'react'

/**
 * ApiKeyInput - API key input section
 */
export default function ApiKeyInput({ apiKey, showKey, onKeyChange, onShowKeyToggle }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
      <input
        type={showKey ? 'text' : 'password'}
        value={apiKey}
        onChange={e => onKeyChange(e.target.value)}
        placeholder="OpenRouter API key..."
        style={{
          flex: 1,
          padding: '7px 10px',
          background: '#1a1a1a',
          border: `1px solid ${apiKey ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '8px',
          color: '#f5f5f5',
          fontSize: '11px',
          outline: 'none'
        }}
      />
      <button
        onClick={onShowKeyToggle}
        style={{
          background: 'none',
          border: 'none',
          color: '#6b6b6b',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >{showKey ? '🙈' : '👁'}</button>
    </div>
  )
}
