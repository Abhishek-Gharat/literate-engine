import React from 'react'
import { formatDate } from '../../utils/format.js'

/**
 * RunHistoryItem - Individual run item component using semantic <li> and <button>
 */
function RunHistoryItem({ run, isSelected, isDisabled, onSelect }) {
  // Defensive: ensure run has required fields
  const runId = run?.id || 'unknown'
  const createdAt = run?.createdAt || ''
  const stats = run?.stats || {}
  
  const handleClick = () => {
    if (!isDisabled && runId !== 'unknown') {
      onSelect(runId)
    }
  }

  return (
    <li
      data-testid={`run-item-${runId}`}
      style={{
        listStyle: 'none',
        marginBottom: '6px'
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-current={isSelected ? 'true' : undefined}
        data-selected={isSelected ? 'true' : 'false'}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          background: isSelected ? '#7c3aed22' : '#13131f',
          border: isSelected ? '1px solid #7c3aed44' : '1px solid #1e1e2e',
          opacity: isDisabled ? 0.5 : 1,
          transition: 'all 0.15s',
          outline: 'none',
          textAlign: 'left',
          color: '#f1f5f9',
          fontFamily: 'inherit',
          fontSize: 'inherit'
        }}
        onMouseEnter={e => {
          if (!isDisabled && !isSelected) {
            e.currentTarget.style.borderColor = '#7c3aed44'
          }
        }}
        onMouseLeave={e => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#1e1e2e'
          }
        }}
      >
        <div style={{
          fontSize: '11px',
          color: '#94a3b8',
          marginBottom: '4px'
        }}>
          {formatDate(createdAt) || 'Unknown date'}
        </div>
        {stats && (stats.totalFiles > 0 || stats.totalComponents > 0) && (
          <div style={{
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            {stats.totalFiles > 0 && <span>{stats.totalFiles} files</span>}
            {stats.totalComponents > 0 && <span>{stats.totalComponents} comps</span>}
          </div>
        )}
        <div style={{
          fontSize: '11px',
          color: '#7c3aed',
          marginTop: '6px',
          fontWeight: '500'
        }}>
          {isDisabled ? 'Loading...' : isSelected ? 'Selected ✓' : 'Click to load →'}
        </div>
      </button>
    </li>
  )
}

/**
 * RunHistoryList - Displays saved analysis runs with loading, empty, and error states
 */
export default function RunHistoryList({
  runs = [],
  selectedRunId = null,
  loading = false,
  error = null,
  onRetry,
  onSelectRun
}) {
  // Defensive: normalize runs to always be an array
  const runsArray = Array.isArray(runs) ? runs : []
  
  // Filter out invalid runs
  const validRuns = runsArray.filter(run => run && typeof run === 'object' && run.id)

  const handleRetryClick = () => {
    if (onRetry && typeof onRetry === 'function') {
      onRetry()
    }
  }

  const handleSelectRun = (runId) => {
    if (onSelectRun && typeof onSelectRun === 'function' && runId) {
      onSelectRun(runId)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div data-testid="run-history-loading" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ color: '#64748b', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>⏳</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
          Loading runs...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load runs'
    return (
      <div data-testid="run-history-error" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '24px' }}>⚠️</div>
        <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
          {errorMessage}
        </div>
        <button
          type="button"
          onClick={handleRetryClick}
          disabled={loading}
          data-testid="run-history-retry-button"
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #7c3aed',
            borderRadius: '6px',
            color: '#7c3aed',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (validRuns.length === 0) {
    return (
      <div
        data-testid="run-history-empty"
        style={{
          padding: '60px 20px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
          No Runs Yet
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Analyze files to save your first run
        </div>
      </div>
    )
  }

  // Populated state - semantic list
  return (
    <ul
      data-testid="run-history-list"
      role="list"
      style={{
        padding: '8px',
        margin: 0,
        listStyle: 'none'
      }}
    >
      {validRuns.map(run => (
        <RunHistoryItem
          key={run.id}
          run={run}
          isSelected={selectedRunId === run.id}
          isDisabled={loading}
          onSelect={handleSelectRun}
        />
      ))}
    </ul>
  )
}
