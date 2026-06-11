import React from 'react'

/**
 * StatRow - A labeled stat display
 * 
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {string|number} props.value - Stat value
 * @param {string} props.testId - Test ID for the component
 */
export default function StatRow({ label, value, testId }) {
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        background: '#13131f',
        borderRadius: '8px',
        marginBottom: '10px',
        border: '1px solid #1e1e2e',
        transition: 'all 0.2s'
      }}
    >
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '16px', color: '#f1f5f9', fontWeight: '600' }}>{value}</span>
    </div>
  )
}
