import { useState, useRef, useEffect } from 'react'

function RenderMessage({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />
        const isBullet = /^[-•*]/.test(line.trim())
        const clean = isBullet ? line.replace(/^[-•*]\s*/, '') : line
        const parts = clean.split(/\*\*(.*?)\*\*|`(.*?)`/g)
        return (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '5px' }}>
            {isBullet && (
              <span style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }}>•</span>
            )}
            <span style={{ fontSize: '13px', lineHeight: '1.7', color: '#cbd5e1' }}>
              {parts.map((part, j) => {
                if (j % 3 === 1) return (
                  <strong key={j} style={{ color: '#f1f5f9', fontWeight: '600' }}>{part}</strong>
                )
                if (j % 3 === 2) return (
                  <code key={j} style={{
                    background: '#1e1e3f', color: '#a78bfa',
                    padding: '1px 6px', borderRadius: '4px',
                    fontSize: '12px', fontFamily: 'monospace'
                  }}>{part}</code>
                )
                return <span key={j}>{part}</span>
              })}
            </span>
          </div>
        )
      })}
    </>
  )
}

export default function NodeInspector({
  node, depMap, stats,
  messages, loading, error,
  onSendMessage, onClearChat,
  apiKey, onApiKeyChange,
  onClose
}) {
  const [input, setInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [tab, setTab] = useState('chat') // 'chat' | 'info'
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const TYPE_COLORS = {
    root: '#7c3aed', component: '#059669',
    hook: '#d97706', page: '#0891b2', ghost: '#475569'
  }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickChips = node ? [
    `What does ${node.label} do?`,
    `Why does it have ${node.imports?.length || 0} imports?`,
    `What would break if ${node.label} was removed?`,
    `Is this file well structured?`,
    `Can this be simplified?`,
  ] : [
    'Give me an overview of this project',
    'Which file is most critical?',
    'Are there any architecture problems?',
    'How is state managed?',
    'What should I refactor first?',
  ]

  return (
    <div style={{
      width: '320px', flexShrink: 0,
      background: '#0d0d14',
      borderLeft: '1px solid #1e1e2e',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', height: '100%'
    }}>

      {/* ── HEADER ── */}
      <div style={{
        height: '48px', flexShrink: 0,
        borderBottom: '1px solid #1e1e2e',
        padding: '0 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '6px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '12px'
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
                background: 'none', border: 'none',
                color: '#475569', cursor: 'pointer', fontSize: '13px'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >🗑</button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#475569', cursor: 'pointer', fontSize: '20px'
          }}>×</button>
        </div>
      </div>

      {/* ── NODE CONTEXT CHIP ── */}
      {node && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #1e1e2e',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px',
            background: `${color}11`,
            border: `1px solid ${color}33`,
            borderRadius: '20px'
          }}>
            <div style={{
              width: '6px', height: '6px',
              borderRadius: '50%', background: color, flexShrink: 0
            }} />
            <code style={{
              fontSize: '12px', color: color,
              fontFamily: 'monospace', flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{node.label}</code>
            <span style={{ fontSize: '10px', color: '#475569', flexShrink: 0 }}>
              {node.imports?.length || 0}↓ {node.importedBy?.length || 0}↑
            </span>
          </div>
        </div>
      )}

      {/* ── TABS ── */}
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
              flex: 1, padding: '10px',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? '#7c3aed' : 'transparent'}`,
              color: tab === t ? '#a78bfa' : '#475569',
              cursor: 'pointer', fontSize: '12px',
              fontWeight: tab === t ? '600' : '400',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
          >
            {t === 'chat' ? '💬 Chat' : '📋 Info'}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px',
            display: 'flex', flexDirection: 'column',
            gap: '14px'
          }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '12px',
                paddingTop: '10px'
              }}>
                <div style={{ fontSize: '28px' }}>🧠</div>
                <div style={{
                  color: '#64748b', fontSize: '13px',
                  textAlign: 'center', lineHeight: '1.6'
                }}>
                  {node
                    ? `Ask me anything about ${node.label}`
                    : 'Ask me anything about your project'
                  }
                </div>

                {/* Quick chips */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickChips.slice(0, 4).map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      style={{
                        padding: '9px 12px',
                        background: '#13131f',
                        border: '1px solid #1e1e2e',
                        borderRadius: '8px',
                        color: '#94a3b8', cursor: 'pointer',
                        fontSize: '12px', textAlign: 'left',
                        lineHeight: '1.4', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#7c3aed44'
                        e.currentTarget.style.color = '#c4b5fd'
                        e.currentTarget.style.background = '#7c3aed11'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#1e1e2e'
                        e.currentTarget.style.color = '#94a3b8'
                        e.currentTarget.style.background = '#13131f'
                      }}
                    >{chip}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '8px', alignItems: 'flex-start'
              }}>
                {/* AI avatar */}
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '26px', height: '26px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    borderRadius: '6px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', marginTop: '2px'
                  }}>✦</div>
                )}

                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  background: msg.role === 'user' ? '#7c3aed' : '#13131f',
                  border: msg.role === 'user' ? 'none' : '1px solid #1e1e2e',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '4px 16px 16px 16px',
                }}>
                  {msg.role === 'user' ? (
                    <span style={{ fontSize: '13px', color: '#fff', lineHeight: '1.6' }}>
                      {msg.content}
                    </span>
                  ) : (
                    <div>
                      <RenderMessage text={msg.content} />
                      {msg.streaming && (
                        <span style={{
                          display: 'inline-block',
                          width: '2px', height: '14px',
                          background: '#818cf8', marginLeft: '2px',
                          verticalAlign: 'middle',
                          animation: 'blink 1s ease infinite'
                        }} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  width: '26px', height: '26px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  borderRadius: '6px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '11px'
                }}>✦</div>
                <div style={{
                  padding: '10px 14px', background: '#13131f',
                  border: '1px solid #1e1e2e',
                  borderRadius: '4px 16px 16px 16px',
                  display: 'flex', gap: '5px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%', background: '#7c3aed',
                      animation: `bounce 1.2s ease ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 12px',
                background: '#1f0a0a', border: '1px solid #7f1d1d',
                borderRadius: '8px', color: '#fca5a5', fontSize: '12px'
              }}>❌ {error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div style={{
            borderTop: '1px solid #1e1e2e',
            padding: '12px 16px', flexShrink: 0
          }}>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <button
                onClick={() => handleSend(
                  node
                    ? `Explain ${node.label} in simple terms`
                    : 'Give me a friendly overview of this project'
                )}
                disabled={loading}
                style={{
                  padding: '5px 12px',
                  background: 'transparent',
                  border: '1px solid #7c3aed44',
                  borderRadius: '20px', color: '#a78bfa',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '11px', fontWeight: '600', transition: 'all 0.2s'
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = '#7c3aed22')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >⚡ {node ? 'Explain Node' : 'Explain Project'}</button>

              {node && (
                <button
                  onClick={() => handleSend(`What issues or improvements do you see in ${node.label}?`)}
                  disabled={loading}
                  style={{
                    padding: '5px 12px',
                    background: 'transparent',
                    border: '1px solid #0891b244',
                    borderRadius: '20px', color: '#67e8f9',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '11px', fontWeight: '600', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = '#0891b222')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >🔍 Find Issues</button>
              )}
            </div>

            {/* API Key */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => onApiKeyChange(e.target.value)}
                placeholder="OpenRouter API key..."
                style={{
                  flex: 1, padding: '7px 10px',
                  background: '#13131f',
                  border: `1px solid ${apiKey ? '#7c3aed44' : '#1e1e2e'}`,
                  borderRadius: '8px', color: '#f1f5f9',
                  fontSize: '11px', outline: 'none'
                }}
              />
              <button
                onClick={() => setShowKey(s => !s)}
                style={{
                  background: 'none', border: 'none',
                  color: '#475569', cursor: 'pointer', fontSize: '13px'
                }}
              >{showKey ? '🙈' : '👁'}</button>
            </div>

            {/* Message textarea */}
            <div style={{ position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Enter to send)"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 44px 10px 14px',
                  background: '#13131f',
                  border: `1px solid ${input ? '#7c3aed66' : '#1e1e2e'}`,
                  borderRadius: '12px', color: '#f1f5f9',
                  fontSize: '13px', outline: 'none',
                  resize: 'none', lineHeight: '1.5',
                  fontFamily: 'system-ui, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  position: 'absolute', right: '10px', bottom: '10px',
                  width: '28px', height: '28px',
                  background: input.trim() && !loading ? '#7c3aed' : '#1e1e2e',
                  border: 'none', borderRadius: '8px',
                  color: '#fff',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >↑</button>
            </div>

            <div style={{
              textAlign: 'center', marginTop: '8px',
              color: '#1e293b', fontSize: '10px'
            }}>
              🔒 Only file structure sent — no actual code
            </div>
          </div>
        </>
      )}

      {/* ── INFO TAB ── */}
      {tab === 'info' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {node ? (
            <>
              {/* Node card */}
              <div style={{
                background: '#13131f', border: '1px solid #2a2a3d',
                borderRadius: '10px', padding: '14px', marginBottom: '16px'
              }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px',
                  background: `${color}22`, border: `1px solid ${color}44`,
                  borderRadius: '4px', marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '10px', color: color,
                    fontWeight: '700', textTransform: 'uppercase'
                  }}>{node.nodeType}</span>
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: '15px',
                  fontWeight: '700', color: '#f1f5f9', wordBreak: 'break-word'
                }}>{node.label}</div>
              </div>

              {/* Stats grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '10px', marginBottom: '16px'
              }}>
                {[
                  { label: 'Imports', value: node.imports?.length || 0, color: '#7c3aed' },
                  { label: 'Used by', value: node.importedBy?.length || 0, color: '#22c55e' },
                  { label: 'Type', value: node.nodeType?.toUpperCase(), color },
                  { label: 'Status', value: node.isGhost ? 'External' : 'Local', color: node.isGhost ? '#475569' : '#0891b2' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: '#13131f', border: '1px solid #1e1e2e',
                    borderRadius: '8px', padding: '12px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px' }}>
                      {stat.label}
                    </div>
                    <div style={{
                      fontSize: '16px', fontWeight: '700',
                      color: stat.color, fontFamily: 'monospace'
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Imports */}
              {node.imports?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '11px', color: '#475569', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'
                  }}>Imports</div>
                  {node.imports.map((imp, i) => (
                    <div key={i} style={{
                      padding: '7px 10px', marginBottom: '4px',
                      background: '#13131f', borderRadius: '6px',
                      borderLeft: '2px solid #7c3aed',
                      color: '#a78bfa', fontSize: '12px', fontFamily: 'monospace'
                    }}>{imp}</div>
                  ))}
                </div>
              )}

              {/* Used By */}
              {node.importedBy?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '11px', color: '#475569', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'
                  }}>Used By</div>
                  {node.importedBy.map((imp, i) => (
                    <div key={i} style={{
                      padding: '7px 10px', marginBottom: '4px',
                      background: '#13131f', borderRadius: '6px',
                      borderLeft: '2px solid #22c55e',
                      color: '#86efac', fontSize: '12px', fontFamily: 'monospace'
                    }}>{imp}</div>
                  ))}
                </div>
              )}

              {/* Ask in chat button */}
              <button
                onClick={() => setTab('chat')}
                style={{
                  width: '100%', padding: '10px',
                  background: '#7c3aed22',
                  border: '1px solid #7c3aed44',
                  borderRadius: '8px', color: '#a78bfa',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                }}
              >💬 Ask AI about this file →</button>
            </>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', paddingTop: '40px',
              gap: '10px', opacity: 0.3
            }}>
              <div style={{ fontSize: '24px' }}>📋</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                Click a node to see its info
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}