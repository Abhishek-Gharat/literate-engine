import { useState, useCallback } from 'react'
import { listRuns, getRun } from '../services/runsApi'

/**
 * useRuns - Hook for managing runs for a project
 * 
 * @param {Object} options
 * @param {Function} options.onRunsChange - Callback when runs change
 * @param {Function} options.onLoadRun - Callback when a run is loaded
 * @param {Function} options.onSelectRun - Callback when a run is selected
 * @returns {Object} Runs state and handlers
 */
export function useRuns({ onRunsChange, onLoadRun, onSelectRun } = {}) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingRunId, setLoadingRunId] = useState(null)

  const loadRuns = useCallback(async (projectId) => {
    if (!projectId) {
      setRuns([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await listRuns(projectId)
      setRuns(data)
      if (onRunsChange) onRunsChange(data)
    } catch (err) {
      console.error('Failed to load runs:', err)
      setError(err.message || 'Failed to load runs')
      setRuns([])
      if (onRunsChange) onRunsChange([])
    } finally {
      setLoading(false)
    }
  }, [onRunsChange])

  const handleLoadRun = useCallback(async (runId) => {
    setLoadingRunId(runId)
    try {
      const run = await getRun(runId)
      if (run.snapshot) {
        if (onLoadRun) onLoadRun(run.snapshot, run)
        if (onSelectRun) onSelectRun(run)
        return true
      } else {
        throw new Error('Run has no snapshot data')
      }
    } catch (err) {
      console.error('Failed to load run:', err)
      throw err
    } finally {
      setLoadingRunId(null)
    }
  }, [onLoadRun, onSelectRun])

  return {
    runs,
    loading,
    error,
    loadingRunId,
    loadRuns,
    handleLoadRun,
  }
}
