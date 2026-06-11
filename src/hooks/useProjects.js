import { useState, useCallback, useEffect, useRef } from 'react'
import { listProjects, createProject } from '../services/projectsApi'

const TOAST_TIMEOUT = 5000

/**
 * useProjects - Hook for managing projects list and creation
 * 
 * @param {Object} options
 * @param {Function} options.onSelectProject - Callback when project is selected
 * @returns {Object} Projects state and handlers
 */
export function useProjects({ onSelectProject } = {}) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timeoutsRef = useRef([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const setAutoClear = useCallback((setter, duration = TOAST_TIMEOUT) => {
    const timeout = setTimeout(() => setter(''), duration)
    timeoutsRef.current.push(timeout)
    return timeout
  }, [])

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    return () => clearAllTimeouts()
  }, [loadProjects, clearAllTimeouts])

  const createNewProject = useCallback(async (name, description) => {
    if (!name.trim()) {
      throw new Error('Project name is required')
    }
    if (name.trim().length > 255) {
      throw new Error('Project name must be 255 characters or fewer')
    }
    if (description.trim().length > 500) {
      throw new Error('Description must be 500 characters or fewer')
    }

    const project = await createProject(name, description)
    setProjects(prev => [project, ...prev])
    if (onSelectProject) {
      onSelectProject(project)
    }
    return project
  }, [onSelectProject])

  return {
    projects,
    loading,
    error,
    loadProjects,
    createNewProject,
    setAutoClear,
  }
}
