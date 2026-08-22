import React from 'react'
import ApiKeyInput from '../inspector/ApiKeyInput'

/**
 * Minimal markdown renderer for model output.
 * Supports ## / ### headings, bullets, numbered items, **bold**, `code`.
 * Builds React elements directly — no innerHTML, so output is XSS-safe.
 */
function renderInline(text, keyPrefix) {
  const parts = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match
  let i = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-b${i}`}>{token.slice(2, -2)}</strong>)
    } else {
      parts.push(
        <code key={`${keyPrefix}-c${i}`} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.92em',
          background: '#2a2a2a',
          padding: '1px 5px',
          borderRadius: '4px',
          color: '#e2e2e2'
        }}>{token.slice(1, -1)}</code>
      )
    }
    last = match.index + token.length
    i += 1
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function ReportBody({ report }) {
  const blocks = []
  const lines = report.split('\n')
  let bullets = []

  const flushBullets = (key) => {
    if (bullets.length === 0) return
    blocks.push(
      <ul key={key} style={{ margin: '6px 0', paddingLeft: '20px' }}>
        {bullets.map((item, i) => (
          <li key={i} style={{ color: '#d4d4d4', fontSize: '13px', lineHeight: '1.65', marginBottom: '4px' }}>
            {renderInline(item, `${key}-${i}`)}
          </li>
        ))}
      </ul>
    )
    bullets = []
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd()
    const key = `l${idx}`

    if (/^#{2,3}\s+/.test(line)) {
      flushBullets(`${key}-u`)
      blocks.push(
        <h3 key={key} style={{
          fontSize: '13px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#e2e2e2',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '6px',
          marginTop: '18px',
          marginBottom: '8px'
        }}>
          {line.replace(/^#{2,3}\s+/, '')}
        </h3>
      )
      return
    }

    if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ''))
      return
    }

    flushBullets(`${key}-u`)

    if (line.trim() === '') {
      blocks.push(<div key={key} style={{ height: '6px' }} />)
      return
    }

    blocks.push(
      <p key={key} style={{ margin: '6px 0', color: '#d4d4d4', fontSize: '13px', lineHeight: '1.65' }}>
        {renderInline(line, key)}
      </p>
    )
  })

  flushBullets('tail')
  return <div>{blocks}</div>
}

/**
 * ReviewModal - One-click AI architecture review of the current graph.
 */
export default function ReviewModal({
  apiKey,
  onApiKeyChange,
  report,
  loading,
  error,
  onGenerate,
  onClose
}) {
  const hasKey = Boolean(apiKey)

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div style={{
        width: 'min(720px, 100%)',
        maxHeight: '86vh',
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '26px',
              height: '26px',
              background: 'linear-gradient(135deg, #e2e2e2, #b0b0b0)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#000'
            }}>✦</span>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
              AI Architecture Review
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {hasKey && !loading && (
              <button
                onClick={() => onGenerate()}
                data-testid="review-regenerate"
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '7px',
                  color: '#ededed',
                  cursor: 'pointer'
                }}
              >↻ Regenerate</button>
            )}
            <button
              onClick={onClose}
              data-testid="review-close"
              style={{
                width: '30px',
                height: '30px',
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#ededed',
                cursor: 'pointer',
                fontSize: '15px',
                lineHeight: 1
              }}
            >×</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!hasKey ? (
            <div>
              <p style={{ color: '#a1a1a1', fontSize: '13px', lineHeight: '1.6', marginTop: 0 }}>
                Add your free OpenRouter API key to generate architecture reviews.
                The graph digest stays local — only the summary is sent to the model.
              </p>
              <ApiKeyInput
                apiKey={apiKey}
                showKey={true}
                onKeyChange={onApiKeyChange}
                onShowKeyToggle={() => {}}
              />
            </div>
          ) : loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '60px 0'
            }}>
              <span style={{
                width: '34px',
                height: '34px',
                border: '3px solid rgba(255,255,255,0.15)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                Reviewing your architecture…
              </span>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '26px', marginBottom: '10px' }}>⚠️</div>
              <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
              <button
                onClick={() => onGenerate()}
                data-testid="review-retry"
                style={{
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  color: '#000000',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >Retry</button>
            </div>
          ) : report ? (
            <ReportBody report={report} />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <button
                onClick={() => onGenerate()}
                data-testid="review-start"
                style={{
                  padding: '10px 22px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000000',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✦ Generate Review
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
      </div>
    </div>
  )
}
