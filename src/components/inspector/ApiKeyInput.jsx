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
          background: '#13131f',
          border: `1px solid ${apiKey ? '#7c3aed44' : '#1e1e2e'}`,
          borderRadius: '8px',
          color: '#f1f5f9',
          fontSize: '11px',
          outline: 'none'
        }}
      />
      <button
        onClick={onShowKeyToggle}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >{showKey ? '🙈' : '👁'}</button>
    </div>
  )
}
