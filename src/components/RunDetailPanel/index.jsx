import React from 'react'

/**
 * Format a date string for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Invalid date'
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a stat value with defensive handling
 * @param {number|undefined} value - The value to format
 * @param {string} unit - The unit suffix
 * @returns {string} Formatted value
 */
export function formatStat(value, unit) {
  if (typeof value !== 'number' || isNaN(value)) return `— ${unit}`
  return `${value} ${unit}${value === 1 ? '' : 's'}`
}

/**
 * StatRow - A labeled stat display
 */
function StatRow({ label, value, testId, color = '#7c3aed' }) {
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

/**
 * RunDetailPanel - Displays detailed information about a selected run
 * @param {Object} props
 * @param {Object|null} props.run - The run object to display
 * @param {boolean} props.loading - Whether the run is being loaded
 * @param {string|null} props.error - Error message if loading failed
 */
export default function RunDetailPanel({ run, loading = false, error = null }) {
  // Loading state
  if (loading) {
    return (
      <div
        data-testid="run-detail-loading"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading run details...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : 'Failed to load run details'
    return (
      <div
        data-testid="run-detail-error"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '4px' }}>
          {errorMessage}
        </div>
      </div>
    )
  }

  // No selection empty state
  if (!run || typeof run !== 'object') {
    return (
      <div
        data-testid="run-detail-empty"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
          No Run Selected
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Select a saved run from the list to view its details
        </div>
      </div>
    )
  }

  // Extract values defensively
  const runId = run?.id || 'Unknown'
  const createdAt = run?.createdAt || null
  const stats = run?.stats || {}
  const totalFiles = stats?.totalFiles || 0
  const totalComponents = stats?.totalComponents || 0
  const hasSnapshot = Boolean(run?.snapshot)

  // Generate insight based on project size
  const getInsight = () => {
    if (totalFiles === 0 && totalComponents === 0) return 'No data available'
    const componentRatio = totalFiles > 0 ? totalComponents / totalFiles : 0
    
    if (totalFiles < 10) {
      return componentRatio > 0.5 
        ? 'Small project with high component density' 
        : 'Small project'
    } else if (totalFiles < 50) {
      return componentRatio > 0.7 
        ? 'Medium project, component-heavy' 
        : 'Medium complexity project'
    } else {
      return componentRatio > 0.6 
        ? 'Large project with rich component graph' 
        : 'Large component graph'
    }
  }

  // Populated detail state
  return (
    <div
      data-testid="run-detail-panel"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
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
          {formatDate(createdAt)}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}
      >
        {/* Analysis Summary */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#7c3aed',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}
          >
            Analysis Summary
          </div>
          <div
            data-testid="run-detail-summary"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #1e293b, #13131f)',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Files</div>
                <div style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600' }}>{totalFiles}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Components</div>
                <div style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600' }}>{totalComponents}</div>
              </div>
            </div>
            <div
              style={{
                padding: '8px 12px',
                background: hasSnapshot ? '#22c55e15' : '#334155',
                borderRadius: '6px',
                border: hasSnapshot ? '1px solid #22c55e30' : '1px solid #475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}
            >
              <span style={{ fontSize: '10px', color: hasSnapshot ? '#22c55e' : '#94a3b8' }}>
                {hasSnapshot ? '✓ Snapshot ready' : '— No snapshot'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500' }}>
              {getInsight()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}
          >
            Detailed Statistics
          </div>
          <StatRow
            label="Files Analyzed"
            value={formatStat(totalFiles, 'file')}
            testId="run-detail-files"
          />
          <StatRow
            label="Components Found"
            value={formatStat(totalComponents, 'component')}
            testId="run-detail-components"
          />
        </div>

        {/* Snapshot Status */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}
          >
            Snapshot
          </div>
          <div
            data-testid="run-detail-snapshot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              background: hasSnapshot ? '#22c55e15' : '#334155',
              borderRadius: '8px',
              border: hasSnapshot ? '1px solid #22c55e40' : '1px solid #475569'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: hasSnapshot ? '#22c55e' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>{hasSnapshot ? '✓' : '—'}</span>
            <span
              style={{
                fontSize: '13px',
                color: hasSnapshot ? '#22c55e' : '#94a3b8',
                fontWeight: '500'
              }}
            >
              {hasSnapshot ? 'Ready to visualize' : 'No snapshot data'}
            </span>
          </div>
        </div>

        {/* Action hint */}
        {hasSnapshot && (
          <div
            data-testid="run-detail-action-hint"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #7c3aed15, #4f46e515)',
              borderRadius: '8px',
              border: '1px solid #7c3aed30',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500', marginBottom: '4px' }}>
              Click "View Graph" to open visualization
            </div>
            <div style={{ fontSize: '12px', color: '#7c3aed' }}>
              Explore the component dependency graph
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
