import React, { useState } from 'react'
import { compareRuns, getPreviousRun } from '../../utils/runComparison'

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Unknown'
  }
}

export default function RunComparisonPanel({ runs, currentRun, selectedProject }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!currentRun || !selectedProject) {
    return null
  }

  const previousRun = getPreviousRun(runs, currentRun.id, selectedProject.id)

  // First run - minimal compact state
  if (!previousRun) {
    return (
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        background: 'rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>📊</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#c4b5fd'
            }}>
              First Run
            </span>
            <span style={{
              fontSize: '11px',
              color: '#64748b'
            }}>
              Compare changes after next analysis
            </span>
          </div>
        </div>
      </div>
    )
  }

  const comparison = compareRuns(currentRun, previousRun)

  if (!comparison) {
    return (
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        background: 'rgba(15, 23, 42, 0.4)'
      }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Unable to compare runs
        </span>
      </div>
    )
  }

  const { fileChanges, metricChanges, cycleChanges } = comparison

  // Check what changed
  const hasFileChanges = fileChanges.added.length > 0 || fileChanges.removed.length > 0
  const hasComponentChanges = metricChanges.totalComponents !== 0
  const hasCycleChanges = cycleChanges.new.length > 0 || cycleChanges.resolved.length > 0

  // Build compact summary
  const summaries = []

  // Files summary
  if (hasFileChanges) {
    const parts = []
    if (fileChanges.added.length > 0) parts.push(`+${fileChanges.added.length}`)
    if (fileChanges.removed.length > 0) parts.push(`-${fileChanges.removed.length}`)
    summaries.push({
      label: 'Files',
      value: parts.join(' / '),
      color: fileChanges.added.length > fileChanges.removed.length ? '#4ade80' : '#f87171'
    })
  }

  // Components summary
  if (hasComponentChanges) {
    const change = metricChanges.totalComponents
    summaries.push({
      label: 'Components',
      value: change > 0 ? `+${change}` : `${change}`,
      color: change > 0 ? '#4ade80' : '#f87171'
    })
  }

  // Circular deps summary
  if (hasCycleChanges) {
    if (cycleChanges.new.length > 0) {
      summaries.push({
        label: 'Cycles',
        value: `${cycleChanges.new.length} new`,
        color: '#f87171'
      })
    } else if (cycleChanges.resolved.length > 0) {
      summaries.push({
        label: 'Cycles',
        value: `${cycleChanges.resolved.length} resolved`,
        color: '#4ade80'
      })
    }
  }

  // No changes
  if (summaries.length === 0) {
    summaries.push({
      label: 'Changes',
      value: 'None',
      color: '#94a3b8'
    })
  }

  return (
    <div style={{
      borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
      background: 'rgba(15, 23, 42, 0.4)'
    }}>
      {/* Compact header row */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px' }}>📊</span>
          <span style={{
            fontSize: '11px',
            color: '#64748b',
            marginRight: '8px'
          }}>
            vs {formatDate(comparison.previousRunDate)}
          </span>
          
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {summaries.map((s, i) => (
              <span key={i} style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(30, 41, 59, 0.6)',
                color: s.color,
                border: `1px solid ${s.color}33`
              }}>
                {s.label}: {s.value}
              </span>
            ))}
          </div>
        </div>

        {/* Show details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'color 150ms'
          }}
          onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
          onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(71, 85, 105, 0.2)',
          background: 'rgba(15, 23, 42, 0.3)'
        }}>
          {/* File changes */}
          {(fileChanges.added.length > 0 || fileChanges.removed.length > 0) && (
            <DetailSection>
              <DetailLabel>Files</DetailLabel>
              {fileChanges.added.length > 0 && (
                <DetailItem color="#4ade80">
                  +{fileChanges.added.length} added
                </DetailItem>
              )}
              {fileChanges.removed.length > 0 && (
                <DetailItem color="#f87171">
                  -{fileChanges.removed.length} removed
                </DetailItem>
              )}
            </DetailSection>
          )}

          {/* Metrics */}
          {(metricChanges.totalComponents !== 0 ||
            metricChanges.totalHooks !== 0 ||
            metricChanges.totalContexts !== 0) && (
            <DetailSection>
              <DetailLabel>Structure</DetailLabel>
              {metricChanges.totalComponents !== 0 && (
                <DetailItem color={metricChanges.totalComponents > 0 ? '#4ade80' : '#f87171'}>
                  Components: {metricChanges.totalComponents > 0 ? '+' : ''}{metricChanges.totalComponents}
                </DetailItem>
              )}
              {metricChanges.totalHooks !== 0 && (
                <DetailItem color={metricChanges.totalHooks > 0 ? '#4ade80' : '#f87171'}>
                  Hooks: {metricChanges.totalHooks > 0 ? '+' : ''}{metricChanges.totalHooks}
                </DetailItem>
              )}
            </DetailSection>
          )}

          {/* Cycles */}
          {(cycleChanges.new.length > 0 || cycleChanges.resolved.length > 0) && (
            <DetailSection>
              <DetailLabel>Circular Dependencies</DetailLabel>
              {cycleChanges.new.length > 0 && (
                <DetailItem color="#f87171">
                  {cycleChanges.new.length} new cycle{cycleChanges.new.length > 1 ? 's' : ''}
                </DetailItem>
              )}
              {cycleChanges.resolved.length > 0 && (
                <DetailItem color="#4ade80">
                  {cycleChanges.resolved.length} resolved
                </DetailItem>
              )}
            </DetailSection>
          )}

          {/* No significant changes */}
          {!hasFileChanges && !hasComponentChanges && !hasCycleChanges && (
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              textAlign: 'center',
              padding: '8px'
            }}>
              No significant changes detected
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailSection({ children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
      ':last-child': { marginBottom: 0 }
    }}>
      {children}
    </div>
  )
}

function DetailLabel({ children }) {
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      minWidth: '80px'
    }}>
      {children}
    </span>
  )
}

function DetailItem({ children, color }) {
  return (
    <span style={{
      fontSize: '12px',
      color: color || '#cbd5e1'
    }}>
      {children}
    </span>
  )
}
