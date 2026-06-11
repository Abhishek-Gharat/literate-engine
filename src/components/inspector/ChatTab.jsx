import React from 'react'
import ChatMessages from './ChatMessages'
import ChatInputArea from './ChatInputArea'

/**
 * ChatTab - Chat interface with messages and input
 * 
 * @param {Object} props
 * @param {Array} props.messages - Chat messages
 * @param {boolean} props.loading - Whether AI is responding
 * @param {string} props.error - Error message
 * @param {string} props.input - Current input value
 * @param {boolean} props.showKey - Whether to show API key input
 * @param {string} props.apiKey - API key value
 * @param {boolean} props.hasNode - Whether a node is selected
 * @param {Function} props.onInputChange - Input change handler
 * @param {Function} props.onSend - Send message handler
 * @param {Function} props.onClear - Clear chat handler
 * @param {Function} props.onKeyChange - API key change handler
 * @param {Function} props.onShowKeyToggle - Toggle API key visibility
 * @param {Function} props.onQuickSend - Quick action handler
 */
export default function ChatTab({
  messages,
  loading,
  error,
  input,
  showKey,
  apiKey,
  hasNode,
  onInputChange,
  onSend,
  onClear,
  onKeyChange,
  onShowKeyToggle,
  onQuickSend
}) {
  return (
    <>
      <ChatMessages
        messages={messages}
        loading={loading}
        error={error}
        hasNode={hasNode}
        onQuickSend={onQuickSend}
      />
      <ChatInputArea
        input={input}
        loading={loading}
        apiKey={apiKey}
        showKey={showKey}
        onInputChange={onInputChange}
        onSend={onSend}
        onKeyChange={onKeyChange}
        onShowKeyToggle={onShowKeyToggle}
      />
    </>
  )
}
