import { useState } from 'react'
import { useAIExplain } from '../../hooks/useAIExplain'

export default function AIExplainPanel({ selectedNode, depMap, stats }) {
  const { explanation, loading, error, explainNode, explainFullGraph } = useAIExplain()
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('reactviz_api_key') || ''
  )
  const [showKey, setShowKey] = useState(false)

  const saveKey = (val) => {
    setApiKey(val)
    localStorage.setItem('reactviz_api_key', val)
  }

  return (
    <div style={{
      position: 'absolute', bottom: '20px', left: '20px',
      background: '#111111', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px', padding: '16px',
      width: '300px', zIndex: 10, color: '#ededed',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px' }}>✦</span>
        <span style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>AI Explain</span>
      </div>

      {/* API Key input */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => saveKey(e.target.value)}
            placeholder="OpenRouter API key"
            style={{
              flex: 1, padding: '7px 10px',
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', color: '#ededed',
              fontSize: '12px', outline: 'none'
            }}
          />
          <button
            onClick={() => setShowKey(s => !s)}
            style={{
              padding: '6px 10px', background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
              color: '#a1a1a1', cursor: 'pointer', fontSize: '12px'
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ color: '#71717a', fontSize: '11px', margin: '4px 0 0' }}>
          Free key: openrouter.ai → Sign up → Free tier
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => selectedNode && explainNode(selectedNode, apiKey)}
          disabled={!selectedNode || loading}
          style={{
            flex: 1, padding: '8px',
            background: selectedNode && !loading ? '#ffffff' : '#1a1a1a',
            border: 'none', borderRadius: '6px',
            color: selectedNode && !loading ? '#000000' : '#71717a',
            cursor: selectedNode && !loading ? 'pointer' : 'not-allowed',
            fontSize: '12px', fontWeight: '600'
          }}
        >
          {loading ? '...' : 'Explain Node'}
        </button>
        <button
          onClick={() => explainFullGraph(depMap, stats, apiKey)}
          disabled={loading}
          style={{
            flex: 1, padding: '8px',
            background: !loading ? '#1a1a1a' : '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
            color: !loading ? '#ededed' : '#71717a', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px', fontWeight: '600'
          }}
        >
          {loading ? '...' : 'Explain All'}
        </button>
      </div>

      {/* Output */}
      {loading && !explanation && (
        <div style={{ color: '#ffffff', fontSize: '13px' }}>⏳ Thinking...</div>
      )}
      {error && (
        <div style={{ color: '#ff5c5c', fontSize: '12px' }}>❌ {error}</div>
      )}
      {explanation && (
        <div style={{
          background: '#0a0a0a', borderRadius: '8px',
          padding: '12px', fontSize: '13px',
          color: '#ededed', lineHeight: '1.6',
          border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'pre-wrap'
        }}>
          {explanation}
        </div>
      )}

      {!selectedNode && !explanation && !loading && (
        <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
          Click a node, then press "Explain Node"
        </p>
      )}
    </div>
  )
}
