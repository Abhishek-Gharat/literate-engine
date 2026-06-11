import React from 'react'

/**
 * RunDetailHeader - Header section for run detail panel
 * 
 * @param {Object} props
 * @param {string} props.runId - Run ID
 * @param {string|null} props.createdAt - Creation date
 */
export default function RunDetailHeader({ runId, createdAt }) {
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
          marginBottom: '6px'
        }}
      >
        Run Details
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
        {runId.substring(0, 8)}...{runId.substring(runId.length - 4)}
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
