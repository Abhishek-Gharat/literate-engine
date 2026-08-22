import { useState, useRef, useEffect } from 'react'
import ChatTab from '../inspector/ChatTab'
import InfoTab from '../inspector/InfoTab'
import ApiKeyInput from '../inspector/ApiKeyInput'

const TYPE_COLORS = {
  root: '#e2e2e2',
  component: '#5a9e6f',
  hook: '#b07a8a',
  page: '#4a7c9b',
  ghost: '#8a8a8a'
}

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
  const [collapsed, setCollapsed] = useState(true)
  const [lastNode, setLastNode] = useState(null)
  const bottomRef = useRef(null)

  const color = node ? (TYPE_COLORS[node.nodeType] || '#e2e2e2') : '#e2e2e2'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Expand the panel when a new node is selected (render-time adjustment
  // instead of an effect, to avoid cascading renders)
  if (node !== lastNode) {
    setLastNode(node)
    if (node) setCollapsed(false)
  }

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

  const handleClose = () => {
    setCollapsed(true)
    onClose()
  }

  // ── COLLAPSED PILL ──
  if (collapsed) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setCollapsed(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '999px',
            color: '#f5f5f5',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#e2e2e266'; e.currentTarget.style.background = '#1a1a1a' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = '#111111' }}
        >
          <span style={{
            width: '20px', height: '20px',
            background: 'linear-gradient(135deg, #e2e2e2, #b0b0b0)',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px'
          }}>✦</span>
          Ask AI
        </button>
      </div>
    )
  }

  // ── EXPANDED FLOATING PANEL ──
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '420px',
      width: 'calc(100% - 40px)',
      zIndex: 1000,
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '60vh',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '44px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px',
            background: 'linear-gradient(135deg, #e2e2e2, #b0b0b0)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px'
          }}>✦</div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f5f5f5' }}>
            AI Assistant
          </span>
          <button
            onClick={() => setShowKey(s => !s)}
            style={{
              background: 'none', border: 'none',
              color: '#6b6b6b', cursor: 'pointer', fontSize: '11px',
              padding: '2px 6px'
            }}
            title="API Key"
          >🔑</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear chat"
              style={{
                background: 'none', border: 'none',
                color: '#6b6b6b', cursor: 'pointer', fontSize: '13px'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#b07a8a'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b6b6b'}
            >🗑</button>
          )}
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none',
              color: '#6b6b6b', cursor: 'pointer', fontSize: '20px',
              lineHeight: '1'
            }}
          >×</button>
        </div>
      </div>

      {/* API Key (expandable) */}
      {showKey && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
          <ApiKeyInput
            apiKey={apiKey}
            showKey={true}
            onKeyChange={onApiKeyChange}
            onShowKeyToggle={() => setShowKey(s => !s)}
          />
        </div>
      )}

      {/* Node Context Chip */}
      {node && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
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
              width: '6px', height: '6px',
              borderRadius: '50%', background: color,
              flexShrink: 0
            }} />
            <code style={{
              fontSize: '12px', color: color,
              fontFamily: "'JetBrains Mono', monospace", flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{node.label}</code>
            <span style={{ fontSize: '10px', color: '#6b6b6b', flexShrink: 0 }}>
              {node.imports?.length || 0}↓ {node.importedBy?.length || 0}↑
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        flexShrink: 0
      }}>
        {['chat', 'info'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? '#e2e2e2' : 'transparent'}`,
              color: tab === t ? '#ffffff' : '#6b6b6b',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: tab === t ? '600' : '400',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
          >{t === 'chat' ? '💬 Chat' : '📋 Info'}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '0' }}>
        {tab === 'chat' ? (
          <ChatTab
            messages={messages}
            loading={loading}
            error={error}
            input={input}
            hasNode={Boolean(node)}
            onInputChange={setInput}
            onSend={() => handleSend()}
            onClear={onClearChat}
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
