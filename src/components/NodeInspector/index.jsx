import { useState, useRef, useEffect } from 'react'
import ChatTab from '../inspector/ChatTab'
import InfoTab from '../inspector/InfoTab'

const TYPE_COLORS = {
  root: '#7c3aed',
  component: '#059669',
  hook: '#d97706',
  page: '#0891b2',
  ghost: '#475569'
}

/**
 * NodeInspector - Right panel for node inspection and AI chat
 * Refactored into smaller sub-components
 * 
 * @param {Object} props
 * @param {Object} props.node - Selected node data
 * @param {Array} props.messages - Chat messages
 * @param {boolean} props.loading - AI loading state
 * @param {string} props.error - Error message
 * @param {string} props.apiKey - API key
 * @param {Function} props.onSendMessage - Send message handler
 * @param {Function} props.onClearChat - Clear chat handler
 * @param {Function} props.onApiKeyChange - API key change handler
 * @param {Function} props.onClose - Close panel handler
 */
export default function NodeInspector({
  node,
  messages,
  loading,
  error,
  apiKey,
  onSendMessage,
  onClearChat,
  onApiKeyChange,
  onClose
}) {
  const [input, setInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [tab, setTab] = useState('chat')
  const bottomRef = useRef(null)

  const color = node ? (TYPE_COLORS[node.nodeType] || '#7c3aed') : '#7c3aed'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    onSendMessage(msg)
    setTab('chat')
  }

  const handleQuickSend = (text) => {
    handleSend(text)
  }

  return (
    <div style={{
      width: '320px',
      flexShrink: 0,
      background: '#0d0d14',
      borderLeft: '1px solid #1e1e2e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        height: '48px',
        flexShrink: 0,
        borderBottom: '1px solid #1e1e2e',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>✦</div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
            AI Assistant
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear chat"
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >🗑</button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >×</button>
        </div>
      </div>

      {/* Node Context Chip */}
      {node && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #1e1e2e',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: `${color}11`,
            border: `1px solid ${color}33`,
            borderRadius: '20px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: color,
              flexShrink: 0
            }} />
            <code style={{
              fontSize: '12px',
              color: color,
              fontFamily: 'monospace',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{node.label}</code>
            <span style={{ fontSize: '10px', color: '#475569', flexShrink: 0 }}>
              {node.imports?.length || 0}↓ {node.importedBy?.length || 0}↑
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1e1e2e',
        flexShrink: 0
      }}>
        {['chat', 'info'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? '#7c3aed' : 'transparent'}`,
              color: tab === t ? '#a78bfa' : '#475569',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: tab === t ? '600' : '400',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
          >{t === 'chat' ? '💬 Chat' : '📋 Info'}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'chat' ? (
          <ChatTab
            messages={messages}
            loading={loading}
            error={error}
            input={input}
            showKey={showKey}
            apiKey={apiKey}
            hasNode={Boolean(node)}
            onInputChange={setInput}
            onSend={() => handleSend()}
            onClear={onClearChat}
            onKeyChange={onApiKeyChange}
            onShowKeyToggle={() => setShowKey(s => !s)}
            onQuickSend={handleQuickSend}
          />
        ) : (
          <InfoTab
            node={node}
            onSwitchToChat={() => setTab('chat')}
          />
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}
