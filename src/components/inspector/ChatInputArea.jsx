import React from 'react'
import ApiKeyInput from './ApiKeyInput'
import MessageInput from './MessageInput'

/**
 * ChatInputArea - Input area with API key and message input
 */
export default function ChatInputArea({
  input,
  loading,
  apiKey,
  showKey,
  onInputChange,
  onSend,
  onKeyChange,
  onShowKeyToggle
}) {
  return (
    <div style={{
      borderTop: '1px solid #1e1e2e',
      padding: '12px 16px',
      flexShrink: 0
    }}>
      <ApiKeyInput
        apiKey={apiKey}
        showKey={showKey}
        onKeyChange={onKeyChange}
        onShowKeyToggle={onShowKeyToggle}
      />
      <MessageInput
        input={input}
        loading={loading}
        onInputChange={onInputChange}
        onSend={onSend}
      />
      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        color: '#1e293b',
        fontSize: '10px'
      }}>
        🔒 Only file structure sent — no actual code
      </div>
    </div>
  )
}
