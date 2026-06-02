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
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: '12px', padding: '16px',
      width: '300px', zIndex: 10, color: '#f1f5f9',
      fontFamily: 'sans-serif'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px' }}>🧠</span>
        <span style={{ fontWeight: '700', fontSize: '14px' }}>AI Explain</span>
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
              background: '#0f172a', border: '1px solid #334155',
              borderRadius: '6px', color: '#f1f5f9',
              fontSize: '12px', outline: 'none'
            }}
          />
          <button
            onClick={() => setShowKey(s => !s)}
            style={{
              padding: '6px 10px', background: '#334155',
              border: 'none', borderRadius: '6px',
              color: '#94a3b8', cursor: 'pointer', fontSize: '12px'
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '11px', margin: '4px 0 0' }}>
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
            background: selectedNode && !loading ? '#7c3aed' : '#334155',
            border: 'none', borderRadius: '6px',
            color: selectedNode ? '#fff' : '#475569',
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
            background: !loading ? '#0891b2' : '#334155',
            border: 'none', borderRadius: '6px',
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px', fontWeight: '600'
          }}
        >
          {loading ? '...' : 'Explain All'}
        </button>
      </div>

      {/* Output */}
      {loading && !explanation && (
        <div style={{ color: '#7c3aed', fontSize: '13px' }}>⏳ Thinking...</div>
      )}
      {error && (
        <div style={{ color: '#ef4444', fontSize: '12px' }}>❌ {error}</div>
      )}
      {explanation && (
        <div style={{
          background: '#0f172a', borderRadius: '8px',
          padding: '12px', fontSize: '13px',
          color: '#e2e8f0', lineHeight: '1.6',
          border: '1px solid #334155', whiteSpace: 'pre-wrap'
        }}>
          {explanation}
        </div>
      )}

      {!selectedNode && !explanation && !loading && (
        <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
          Node pe click karo phir "Explain Node" dabao
        </p>
      )}
    </div>
  )
}