import React, { useState } from 'react'

/**
 * RunDetailHeader - Header section for run detail panel
 *
 * @param {Object} props
 * @param {string} props.runId - Run ID
 * @param {string|null} props.createdAt - Creation date
 */
export default function RunDetailHeader({ runId, createdAt }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/share/${runId}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      style={{
        padding: '20px',
        borderBottom: '1px solid #1e1e2e',
        background: 'linear-gradient(135deg, #7c3aed10, transparent)'
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: '#7c3aed',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>Run Details</span>
        <button
          onClick={handleCopyLink}
          data-testid="copy-share-link"
          title="Copy public read-only link to this run"
          style={{
            background: copied ? '#22c55e22' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${copied ? '#22c55e55' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '5px',
            color: copied ? '#4ade80' : '#94a3b8',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 8px',
            cursor: 'pointer'
          }}
        >{copied ? '✓ Link copied' : '🔗 Share'}</button>
      </div>
      <div
        data-testid="run-detail-id"
        style={{
          fontSize: '14px',
          color: '#f1f5f9',
          fontWeight: '600',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          letterSpacing: '0.5px'
        }}
      >
        {runId}
      </div>
      <div
        data-testid="run-detail-date"
        style={{
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '8px'
        }}
      >
        {createdAt}
      </div>
    </div>
  )
}
