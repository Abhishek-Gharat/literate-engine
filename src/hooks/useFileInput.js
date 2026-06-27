import { useState, useEffect, useCallback } from 'react'
import { listProjects, createProject } from '../services/projectsApi'
import { listRuns, getRun } from '../services/runsApi'

const TOAST_TIMEOUT = 5000
const SOURCE_EXTENSIONS = /\.(jsx?|tsx?)$/

/**
 * useFileInput - Hook for managing FileInput component state and logic
 * 
 * @param {Object} options
 * @param {Function} options.onFilesReady - Callback when files are ready
 * @param {Function} options.onSelectProject - Callback when project is selected
 * @param {Function} options.onLoadRun - Callback when run is loaded
 * @param {Function} options.onSelectRun - Callback when run is selected
 * @param {Function} options.onRunsChange - Callback when runs change
 * @param {boolean} options.analyzing - External analyzing state
 * @returns {Object} FileInput state and handlers
 */
export function useFileInput({
  onFilesReady,
  onSelectProject,
  onLoadRun,
  onSelectRun,
  onRunsChange,
  analyzing = false
}) {
  const [mode, setMode] = useState('local')
  const [githubUrl, setGithubUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisSuccess, setAnalysisSuccess] = useState('')

  // Project state
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState(null)

  // Runs state
  const [runs, setRuns] = useState([])
  const [runsLoading, setRunsLoading] = useState(false)
  const [runsError, setRunsError] = useState(null)

  // Create project modal state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      setProjectsError(err.message || 'Failed to connect to server')
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  const loadRuns = useCallback(async (projectId) => {
    setRunsLoading(true)
    setRunsError(null)
    try {
      const data = await listRuns(projectId)
      setRuns(data)
      if (onRunsChange) onRunsChange(data)
    } catch (err) {
      setRunsError(err.message || 'Failed to load runs')
      setRuns([])
      if (onRunsChange) onRunsChange([])
    } finally {
      setRunsLoading(false)
    }
  }, [onRunsChange])

  const openCreateForm = useCallback(() => {
    setShowCreateForm(true)
    setCreateError('')
    setCreateSuccess('')
  }, [])

  const closeCreateForm = useCallback(() => {
    if (!creatingProject) {
      setShowCreateForm(false)
      setNewProjectName('')
      setNewProjectDesc('')
      setCreateError('')
      setCreateSuccess('')
    }
  }, [creatingProject])

  const createProjectHandler = useCallback(async () => {
    if (!newProjectName.trim()) {
      setCreateError('Project name is required')
      return
    }
    if (newProjectName.trim().length > 255) {
      setCreateError('Project name must be 255 characters or fewer')
      return
    }
    if (newProjectDesc.trim().length > 500) {
      setCreateError('Description must be 500 characters or fewer')
      return
    }

    setCreateError('')
    setCreatingProject(true)

    try {
      const project = await createProject(newProjectName.trim(), newProjectDesc.trim())
      setProjects(prev => [project, ...prev])
      if (onSelectProject) onSelectProject(project)
      setCreateSuccess(`Project "${newProjectName.trim()}" created successfully`)
      // Close modal and clear form immediately
      setShowCreateForm(false)
      setNewProjectName('')
      setNewProjectDesc('')
      // Clear success message after timeout
      setTimeout(() => {
        setCreateSuccess('')
      }, TOAST_TIMEOUT)
    } catch (err) {
      setCreateError(err.message || 'Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }, [newProjectName, newProjectDesc, onSelectProject])

  const handleLocalFiles = useCallback(async (fileList, selectedProject) => {
    if (!selectedProject) {
      setError('Please select a project before analyzing files')
      return
    }

    const files = Array.from(fileList).filter(f => SOURCE_EXTENSIONS.test(f.name))
    if (files.length === 0) {
      setError('No .js / .jsx / .ts / .tsx files selected')
      return
    }

    const validFiles = files.filter(f => f.size > 0)
    if (validFiles.length === 0) {
      setError('All selected files are empty')
      return
    }

    setError('')
    setLoading(true)

    try {
      const fileData = await Promise.all(
        validFiles.map(f => f.text().then(content => ({ name: f.name, content })))
      )

      await onFilesReady(fileData, selectedProject.id)
      setAnalysisSuccess(`Analysis complete! ${fileData.length} files analyzed and saved.`)
      setTimeout(() => setAnalysisSuccess(''), TOAST_TIMEOUT)
      await loadRuns(selectedProject.id)
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [onFilesReady, loadRuns])

  const handleGithubFetch = useCallback(async (selectedProject) => {
    if (!selectedProject) {
      setError('Please select a project before analyzing')
      return
    }
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub repository URL')
      return
    }

    setError('')
    setLoading(true)

    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/)
      if (!match) throw new Error('Invalid GitHub URL format')

      const [, owner, repo] = match

      // First, get the default branch
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (repoRes.status === 403 || repoRes.status === 429) {
        const body = await repoRes.json().catch(() => ({}))
        throw new Error(body.message || 'GitHub API rate limit reached. Try again later.')
      }
      if (repoRes.status === 404) throw new Error('Repository not found')
      const repoData = await repoRes.json()
      const branch = repoData.default_branch

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      )
      if (treeRes.status === 403 || treeRes.status === 429) {
        const body = await treeRes.json().catch(() => ({}))
        throw new Error(body.message || 'GitHub API rate limit reached. Try again later or use local files.')
      }
      if (treeRes.status === 422) throw new Error('Repository is empty')
      if (!treeRes.ok) {
        const body = await treeRes.json().catch(() => ({}))
        throw new Error(body.message || 'Repository not found or is private')
      }

      const treeData = await treeRes.json()
      const jsFiles = treeData.tree.filter(f =>
        SOURCE_EXTENSIONS.test(f.path) &&
        !f.path.includes('node_modules') &&
        !f.path.includes('dist')
      )

      if (jsFiles.length === 0) throw new Error('No JS/JSX files found')

      const fileData = await Promise.all(
        jsFiles.slice(0, 80).map(async (f) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`
          )
          const content = await res.text()
          return { name: f.path.split('/').pop(), content, fullPath: f.path }
        })
      )

      await onFilesReady(fileData, selectedProject.id)
      setAnalysisSuccess(`Analysis complete! ${fileData.length} files from GitHub analyzed.`)
      setTimeout(() => setAnalysisSuccess(''), TOAST_TIMEOUT)
      await loadRuns(selectedProject.id)
    } catch (err) {
      setError(err.message || 'Failed to analyze GitHub repository')
    } finally {
      setLoading(false)
    }
  }, [githubUrl, onFilesReady, loadRuns])

  const handleLoadRun = useCallback(async (runOrId) => {
    try {
      // Handle both run object and run ID string
      const runId = typeof runOrId === 'object' ? runOrId?.id : runOrId
      if (!runId) {
        setError('Invalid run identifier')
        return
      }
      const run = await getRun(runId)
      if (run?.snapshot) {
        onLoadRun(run.snapshot, run)
        if (onSelectRun) onSelectRun(run)
      }
    } catch (err) {
      setError('Failed to load saved analysis')
    }
  }, [onLoadRun, onSelectRun])

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Clear messages when analysis starts
  useEffect(() => {
    if (analyzing) {
      setAnalysisSuccess('')
      setError('')
    }
  }, [analyzing])

  const isAnalyzing = loading || analyzing

  return {
    // Upload state
    mode,
    setMode,
    githubUrl,
    setGithubUrl,
    error,
    setError,
    analysisSuccess,
    setAnalysisSuccess,
    isAnalyzing,
    
    // Projects state
    projects,
    projectsLoading,
    projectsError,
    loadProjects,
    
    // Runs state
    runs,
    runsLoading,
    runsError,
    loadRuns,
    
    // Create project modal state
    showCreateForm,
    newProjectName,
    newProjectDesc,
    createError,
    createSuccess,
    creatingProject,
    setNewProjectName,
    setNewProjectDesc,
    openCreateForm,
    closeCreateForm,
    createProjectHandler,
    
    // Handlers
    handleLocalFiles,
    handleGithubFetch,
    handleLoadRun
  }
}
