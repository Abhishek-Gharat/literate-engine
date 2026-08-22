import React from 'react'
import { useRunInsight } from '../runs/useRunInsight'
import RunDetailHeader from '../runs/RunDetailHeader'
import RunDetailSummary from '../runs/RunDetailSummary'
import RunDetailStats from '../runs/RunDetailStats'
import RunDetailHealth from '../runs/RunDetailHealth'
import RunDetailRisks from '../runs/RunDetailRisks'
import RunDetailDeadCode from '../runs/RunDetailDeadCode'
import RunDetailSnapshot from '../runs/RunDetailSnapshot'
import RunDetailActionHint from '../runs/RunDetailActionHint'
import LoadingState from '../feedback/LoadingState'
import ErrorState from '../feedback/ErrorState'
import EmptyState from '../feedback/EmptyState'
import { formatDate } from '../../utils/format.js'

/**
 * RunDetailPanel - Displays detailed information about a selected run
 * @param {Object} props
 * @param {Object|null} props.run - The run object to display
 * @param {boolean} props.loading - Whether the run is being loaded
 * @param {string|null} props.error - Error message if loading failed
 */
export default function RunDetailPanel({ run, loading = false, error = null }) {
  // Extract values defensively FIRST (before any conditional returns)
  const runId = run?.id || 'Unknown'
  const createdAt = run?.createdAt || null
  const stats = run?.stats || {}
  const hasSnapshot = Boolean(run?.snapshot)
  
  // Call hooks BEFORE any conditional returns (Rules of Hooks)
  const insight = useRunInsight(stats)
  
  // Loading state
  if (loading) {
    return <LoadingState testId="run-detail-loading" message="Loading run details..." />
  }

  // Error state
  if (error) {
    return <ErrorState testId="run-detail-error" message={error} />
  }

  // No selection empty state
  if (!run || typeof run !== 'object') {
    return (
      <EmptyState
        testId="run-detail-empty"
        icon="📊"
        title="No Run Selected"
        subtitle="Select a saved run from the list to view its details"
      />
    )
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
      <RunDetailHeader runId={runId} createdAt={formatDate(createdAt)} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}
      >
        <RunDetailSummary stats={stats} hasSnapshot={hasSnapshot} insight={insight} />
        <RunDetailStats stats={stats} />
        <RunDetailHealth run={run} />
        <RunDetailRisks run={run} />
        <RunDetailDeadCode run={run} />
        <RunDetailSnapshot hasSnapshot={hasSnapshot} />
        {hasSnapshot && <RunDetailActionHint />}
        <div
          data-testid="run-detail-placeholder"
          style={{
            marginBottom: '20px',
            padding: '24px',
            background: '#1e293b50',
            borderRadius: '8px',
            border: '1px dashed #475569',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '13px'
          }}
        >
          📈 Graph Preview
          <div style={{ marginTop: '6px', fontSize: '12px' }}>Coming soon</div>
        </div>
      </div>
    </div>
  )
}
