import React from 'react'
import ChatMessages from './ChatMessages'
import ChatInputArea from './ChatInputArea'

export default function ChatTab({
  messages,
  loading,
  error,
  input,
  hasNode,
  onInputChange,
  onSend,
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
        onInputChange={onInputChange}
        onSend={onSend}
      />
    </>
  )
}
