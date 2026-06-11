import React from 'react'
import ChatMessage from './ChatMessage'
import ChatEmptyState from './ChatEmptyState'
import ChatLoadingIndicator from './ChatLoadingIndicator'
import ChatErrorMessage from './ChatErrorMessage'

/**
 * ChatMessages - Message list component
 */
export default function ChatMessages({ messages, loading, error, hasNode, onQuickSend }) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {messages.length === 0 ? (
        <ChatEmptyState hasNode={hasNode} onQuickSend={onQuickSend} />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {loading && messages[messages.length - 1]?.role === 'user' && (
            <ChatLoadingIndicator />
          )}

          {error && <ChatErrorMessage error={error} />}
        </>
      )}
    </div>
  )
}
