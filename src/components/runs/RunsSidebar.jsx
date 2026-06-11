import React from 'react'
import RunHistoryList from '../RunHistoryList'

/**
 * RunsSidebar - Right sidebar with run history
 * 
 * @param {Object} props
 * @param {Array} props.runs - List of runs
 * @param {boolean} props.runsLoading - Whether runs are loading
 * @param {string|null} props.runsError - Error message
 * @param {Object|null} props.selectedProject - Currently selected project
 * @param {string|null} props.selectedRunId - Currently selected run ID
 * @param {boolean} props.isAnalyzing - Whether analysis is in progress
 * @param {Function} props.onRetry - Callback to retry loading runs
 * @param {Function} props.onSelectRun - Callback when a run is selected
 */
export default function RunsSidebar({
  runs,
  runsLoading,
  runsError,
  selectedProject,
  selectedRunId,
  isAnalyzing,
  onRetry,
  onSelectRun
}) {
  return (
    <div style={{
      width: '100%',
      flex: 1,
      minWidth: 0,
      background: '#0b1424',
      borderLeft: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid #3b465d',
        background: '#101a2b'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#d8b4fe',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>Saved Runs</div>
        {selectedProject && (
          <div style={{
            fontSize: '15px',
            color: '#d7d2e6',
            marginTop: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{selectedProject.name}</div>
        )}
      </div>

      {/* Runs List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {!selectedProject ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              No Project Selected
            </div>
            <div style={{ fontSize: '12px' }}>Select a project to view its saved analysis runs</div>
          </div>
        ) : (
          <RunHistoryList
            runs={runs}
            selectedRunId={selectedRunId}
            loading={runsLoading}
            error={runsError}
            onRetry={onRetry}
            onSelectRun={onSelectRun}
          />
        )}
      </div>

      {/* Refresh runs */}
      {selectedProject && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid #3b465d' }}>
          <button
            onClick={onRetry}
            disabled={runsLoading || isAnalyzing}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: '1px solid #1e1e2e',
              borderRadius: '6px',
              color: (runsLoading || isAnalyzing) ? '#334155' : '#64748b',
              cursor: (runsLoading || isAnalyzing) ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >{runsLoading ? 'Loading...' : 'Refresh'}</button>
        </div>
      )}
    </div>
  )
}
