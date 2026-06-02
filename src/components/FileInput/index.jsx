import React, { useRef, useState, useEffect, useCallback } from 'react'
import { listProjects, createProject } from '../../services/projectsApi'
import { listRuns, getRun } from '../../services/runsApi'
import RunHistoryList from '../RunHistoryList'
// Toast message auto-clear timeout in ms
const TOAST_TIMEOUT = 5000

export default function FileInput({
  onFilesReady,
  analyzing = false,
  analysisError = '',
  selectedProject,
  onSelectProject,
  onLoadRun,
  selectedRunId,
  onSelectRun,
  onRunsChange
}) {
  const [mode, setMode] = useState('local')
  const [githubUrl, setGithubUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileCount, setFileCount] = useState(0)
  const inputRef = useRef()

  // Project management state
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  // Runs state
  const [runs, setRuns] = useState([])
  const [runsLoading, setRunsLoading] = useState(false)
  const [runsError, setRunsError] = useState(null)
  const [loadingRun, setLoadingRun] = useState(false)

  // Store last analyzed files for re-analysis
  const [lastAnalyzedFiles, setLastAnalyzedFiles] = useState(null)
  const [lastAnalysisSource, setLastAnalysisSource] = useState(null) // 'local', 'github', or null

  // Analysis success feedback
  const [analysisSuccess, setAnalysisSuccess] = useState('')

  // Clear timeouts ref
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

  // Load projects on mount
  useEffect(() => {
    loadProjects()
    return () => clearAllTimeouts()
  }, [])

  // Clear analysis error/success when analysis starts/ends
  useEffect(() => {
    if (analyzing) {
      setAnalysisSuccess('')
      setError('')
    }
  }, [analyzing])

  // Load runs when project is selected
  useEffect(() => {
    if (selectedProject?.id) {
      loadRuns(selectedProject.id)
    } else {
      setRuns([])
      setRunsError(null)
    }
  }, [selectedProject?.id])

  const loadProjects = async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      console.error('Failed to load projects:', err)
      setProjectsError(err.message || 'Failed to connect to server')
    } finally {
      setProjectsLoading(false)
    }
  }

  const loadRuns = async (projectId) => {
    setRunsLoading(true)
    setRunsError(null)
    try {
      const data = await listRuns(projectId)
      setRuns(data)
      if (onRunsChange) onRunsChange(data)
    } catch (err) {
      console.error('Failed to load runs:', err)
      setRunsError(err.message || 'Failed to load runs')
      setRuns([])
      if (onRunsChange) onRunsChange([])
    } finally {
      setRunsLoading(false)
    }
  }

  const handleCreateProject = async () => {
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
      const project = await createProject(newProjectName, newProjectDesc)
      setProjects(prev => [project, ...prev])
      onSelectProject(project)
      setNewProjectName('')
      setNewProjectDesc('')
      setCreateSuccess(`Project "${project.name}" created successfully`)
      setAutoClear(setCreateSuccess)
      setShowCreateForm(false)
    } catch (err) {
      setCreateError(err.message || 'Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }

  const handleLoadRun = async (runId) => {
    setLoadingRun(true)
    setError('')
    try {
      const run = await getRun(runId)
      if (run.snapshot) {
        onLoadRun(run.snapshot, run)
        if (onSelectRun) onSelectRun(run)
      } else {
        setError('Run has no snapshot data')
      }
    } catch (err) {
      console.error('Failed to load run:', err)
      setError('Failed to load saved analysis: ' + (err.message || 'Unknown error'))
    } finally {
      setLoadingRun(false)
    }
  }

  // File handling with validation
  const handleLocalFiles = async (e) => {
    if (!selectedProject) {
      setError('Please select a project before analyzing files')
      return
    }

    const files = Array.from(e.target.files).filter(f =>
      /\.(jsx?|tsx?)$/.test(f.name)
    )

    if (files.length === 0) {
      setError('No .js / .jsx / .ts / .tsx files selected')
      return
    }

    // Check for empty files
    const emptyFiles = files.filter(f => f.size === 0)
    if (emptyFiles.length > 0) {
      setError(`${emptyFiles.length} file(s) are empty and will be skipped`)
      // Continue with non-empty files
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
        validFiles.map(f =>
          f.text().then(content => ({ name: f.name, content }))
        )
      )

      setFileCount(fileData.length)
      setLastAnalyzedFiles(fileData)
      setLastAnalysisSource('local')
      await onFilesReady(fileData, selectedProject?.id)
      setAnalysisSuccess(`Analysis complete! ${fileData.length} files analyzed and saved.`)
      setAutoClear(setAnalysisSuccess)
      // Refresh runs list after successful analysis
      await loadRuns(selectedProject.id)
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubFetch = async () => {
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
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (!match) throw new Error('Invalid GitHub URL format. Use: https://github.com/owner/repo')

      const [, owner, repo] = match

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
      )
      if (!treeRes.ok) throw new Error('Repository not found or is private')

      const treeData = await treeRes.json()

      const jsFiles = treeData.tree.filter(f =>
        /\.(jsx?|tsx?)$/.test(f.path) &&
        !f.path.includes('node_modules') &&
        !f.path.includes('dist') &&
        !f.path.includes('.min.')
      )

      if (jsFiles.length === 0) throw new Error('No JS/JSX files found in this repository')
      
      let warningMsg = ''
      if (jsFiles.length > 80) {
        warningMsg = `${jsFiles.length} files found - only first 80 will be analyzed`
      }

      const fileData = await Promise.all(
        jsFiles.slice(0, 80).map(async (f) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`
          )
          if (!res.ok) throw new Error(`Failed to fetch file: ${f.path}`)
          const content = await res.text()
          const name = f.path.split('/').pop()
          return { name, content, fullPath: f.path }
        })
      )

      setFileCount(fileData.length)
      setLastAnalyzedFiles(fileData)
      setLastAnalysisSource('github')
      await onFilesReady(fileData, selectedProject?.id)
      setAnalysisSuccess(`Analysis complete! ${fileData.length} files from GitHub analyzed and saved.`)
      if (warningMsg) {
        setError(warningMsg)
        setAutoClear(setError, 8000)
      }
      setAutoClear(setAnalysisSuccess)
      // Refresh runs list after successful analysis
      await loadRuns(selectedProject.id)
    } catch (err) {
      setError(err.message || 'Failed to analyze GitHub repository')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleReanalyze = async () => {
    if (!selectedProject) {
      setError('Please select a project before re-analyzing')
      return
    }

    if (!lastAnalyzedFiles || lastAnalyzedFiles.length === 0) {
      setError('No previous analysis found. Please upload files or analyze from GitHub first.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await onFilesReady(lastAnalyzedFiles, selectedProject?.id)
      setAnalysisSuccess(`Re-analysis complete! ${lastAnalyzedFiles.length} files re-analyzed and saved.`)
      setAutoClear(setAnalysisSuccess)
      // Refresh runs list after successful re-analysis and get the updated runs
      await loadRuns(selectedProject.id)
      return true // Indicate success
    } catch (err) {
      setError(err.message || 'Re-analysis failed. Original analysis runs are still available.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const isAnalyzing = loading || analyzing || loadingRun
  const hasProject = Boolean(selectedProject)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR - Projects */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        background: '#0d0d14',
        borderRight: '1px solid #1e1e2e',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1e1e2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '6px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '12px'
            }}>⚡</div>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>
              React<span style={{ color: '#7c3aed' }}>Viz</span>
            </span>
          </div>
        </div>

        {/* Create Button */}
        <div style={{ padding: '12px', borderBottom: '1px solid #1e1e2e' }}>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isAnalyzing}
            data-testid="new-project-button"
            style={{
              width: '100%',
              padding: '8px 12px',
              background: isAnalyzing ? '#334155' : '#7c3aed',
              border: 'none',
              borderRadius: '6px',
              color: isAnalyzing ? '#64748b' : '#fff',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >+ New Project</button>
        </div>

        {/* Projects List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {projectsLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ color: '#64748b', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>⏳</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                Loading projects...
              </div>
            </div>
          ) : projectsError ? (
            <div data-testid="projects-error" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '24px' }}>⚠️</div>
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {projectsError}
              </div>
              <button
                onClick={loadProjects}
                disabled={projectsLoading}
                data-testid="retry-projects-button"
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #7c3aed',
                  borderRadius: '6px',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div data-testid="empty-projects" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ color: '#64748b', marginBottom: '12px', fontSize: '32px' }}>📁</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                No projects yet
              </div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                Create your first project to get started
              </div>
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                onClick={() => !isAnalyzing && onSelectProject(project)}
                data-testid={`project-item-${project.id}`}
                role="button"
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  marginBottom: '4px',
                  background: selectedProject?.id === project.id ? '#7c3aed22' : 'transparent',
                  border: selectedProject?.id === project.id ? '1px solid #7c3aed44' : '1px solid transparent',
                  opacity: isAnalyzing ? 0.5 : 1,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  if (!isAnalyzing && selectedProject?.id !== project.id) {
                    e.currentTarget.style.background = '#13131f'
                  }
                }}
                onMouseLeave={e => {
                  if (selectedProject?.id !== project.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: selectedProject?.id === project.id ? '#a78bfa' : '#f1f5f9',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {project.name}
                </div>
                {project.description && (
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {project.description}
                  </div>
                )}
                {project.runCount > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '2px'
                  }}>
                    {project.runCount} {project.runCount === 1 ? 'run' : 'runs'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Refresh */}
        <div style={{ padding: '12px', borderTop: '1px solid #1e1e2e' }}>
          <button
            onClick={loadProjects}
            disabled={projectsLoading || isAnalyzing}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: '1px solid #1e1e2e',
              borderRadius: '6px',
              color: (projectsLoading || isAnalyzing) ? '#334155' : '#64748b',
              cursor: (projectsLoading || isAnalyzing) ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            {projectsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* CENTER - File Input */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: runs.length > 0 ? 'flex-start' : 'center',
        padding: runs.length > 0 ? '16px 24px' : '24px',
        gap: runs.length > 0 ? '16px' : '24px',
        overflowY: 'auto'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: runs.length > 0 ? '1.25rem' : '2rem',
            fontWeight: '700',
            margin: 0,
            color: '#7c3aed'
          }}>
            Analyze Code
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: runs.length > 0 ? '13px' : '14px' }}>
            {selectedProject
              ? `Project: ${selectedProject.name}`
              : 'Select a project or create a new one'}
          </p>
        </div>

        {/* No Project Selected Warning */}
        {!hasProject && (
          <div
            data-testid="no-project-warning"
            style={{
              background: '#f59e0b15',
              border: '1px solid #f59e0b40',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '500px',
              width: '100%'
            }}
          >
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                No Project Selected
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                Select an existing project or create a new one before analyzing files
              </div>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#1e293b', borderRadius: '10px', padding: '4px' }}>
          {['local', 'github'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              disabled={isAnalyzing}
              style={{
                padding: '8px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                background: mode === m ? '#7c3aed' : 'transparent',
                color: mode === m ? '#fff' : '#94a3b8',
                opacity: isAnalyzing ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {m === 'local' ? '📁 Local Files' : '🐙 GitHub URL'}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{
          background: '#1e293b',
          borderRadius: runs.length > 0 ? '12px' : '16px',
          padding: runs.length > 0 ? '20px' : '32px',
          width: '100%',
          maxWidth: runs.length > 0 ? '400px' : '500px',
          border: '1px solid #334155',
          opacity: !hasProject ? 0.5 : 1,
          pointerEvents: !hasProject ? 'none' : 'auto'
        }}>
          {mode === 'local' ? (
            <div style={{ textAlign: 'center' }}>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".js,.jsx,.ts,.tsx"
                onChange={handleLocalFiles}
                disabled={isAnalyzing}
                data-testid="file-input"
                style={{ display: 'none' }}
              />
              <div
                data-testid="file-dropzone"
                onClick={() => !isAnalyzing && inputRef.current.click()}
                style={{
                  border: '2px dashed #4f46e5',
                  borderRadius: '10px',
                  padding: runs.length > 0 ? '24px 16px' : '40px 20px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.2s',
                  opacity: isAnalyzing ? 0.5 : 1
                }}
              >
                <div style={{ fontSize: runs.length > 0 ? '1.75rem' : '2.5rem' }}>📂</div>
                <p style={{ margin: runs.length > 0 ? '8px 0 2px' : '12px 0 4px', fontWeight: '600', fontSize: runs.length > 0 ? '14px' : '16px' }}>
                  {isAnalyzing ? 'Analyzing...' : 'Select Files'}
                </p>
                <p style={{ color: '#94a3b8', fontSize: runs.length > 0 ? '12px' : '13px', margin: 0 }}>
                  .js .jsx .ts .tsx files supported
                </p>
              </div>
              {runs.length === 0 && (
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '12px' }}>
                  Files will be analyzed and saved with the selected project
                </p>
              )}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: runs.length > 0 ? '13px' : '14px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                GitHub Public Repo URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAnalyzing && handleGithubFetch()}
                disabled={isAnalyzing}
                placeholder="https://github.com/facebook/react"
                style={{
                  width: '100%',
                  padding: runs.length > 0 ? '10px' : '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f1f5f9',
                  fontSize: runs.length > 0 ? '13px' : '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  opacity: isAnalyzing ? 0.5 : 1
                }}
              />
              <button
                onClick={handleGithubFetch}
                disabled={isAnalyzing || !githubUrl.trim()}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: runs.length > 0 ? '10px' : '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (isAnalyzing || !githubUrl.trim()) ? '#334155' : '#7c3aed',
                  color: (isAnalyzing || !githubUrl.trim()) ? '#64748b' : '#fff',
                  fontWeight: '600',
                  fontSize: runs.length > 0 ? '14px' : '15px',
                  cursor: (isAnalyzing || !githubUrl.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Repo →'}
              </button>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {isAnalyzing && (
          <div
            data-testid="analyzing-indicator"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#7c3aed',
              fontWeight: '600'
            }}
          >
            <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            Analyzing files...
          </div>
        )}

        {analysisSuccess && (
          <div
            data-testid="success-message"
            style={{
              background: '#22c55e15',
              border: '1px solid #22c55e40',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#22c55e',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>✓</span>
            {analysisSuccess}
          </div>
        )}

        {(error || analysisError) && (
          <div
            data-testid="error-message"
            style={{
              background: '#ef444415',
              border: '1px solid #ef444440',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️</span>
            {error || analysisError}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR - Runs */}
      <div style={{
        width: '300px',
        flexShrink: 0,
        background: '#0d0d14',
        borderLeft: '1px solid #1e1e2e',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #1e1e2e',
          background: 'linear-gradient(135deg, #7c3aed10, transparent)'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#7c3aed',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Saved Runs
          </div>
          {selectedProject && (
            <div style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {selectedProject.name}
            </div>
          )}
        </div>

        {/* Re-analyze button */}
        {selectedProject && (
          <div style={{ padding: '12px', borderBottom: '1px solid #1e1e2e' }}>
            <button
              type="button"
              onClick={handleReanalyze}
              disabled={isAnalyzing || !lastAnalyzedFiles}
              data-testid="reanalyze-button"
              title={!lastAnalyzedFiles ? 'Analyze files first to enable re-analysis' : 'Re-analyze the last uploaded files'}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: (isAnalyzing || !lastAnalyzedFiles) ? '#334155' : '#7c3aed',
                border: 'none',
                borderRadius: '6px',
                color: (isAnalyzing || !lastAnalyzedFiles) ? '#64748b' : '#fff',
                cursor: (isAnalyzing || !lastAnalyzedFiles) ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {isAnalyzing ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Re-analyze Project
                </>
              )}
            </button>
            {!lastAnalyzedFiles && (
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                marginTop: '6px',
                textAlign: 'center'
              }}>
                Upload files to enable re-analysis
              </div>
            )}
          </div>
        )}

        {/* Runs List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {!selectedProject ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                No Project Selected
              </div>
              <div style={{ fontSize: '12px' }}>
                Select a project to view its saved analysis runs
              </div>
            </div>
          ) : (
            <RunHistoryList
              runs={runs}
              selectedRunId={selectedRunId}
              loading={runsLoading}
              error={runsError}
              onRetry={() => loadRuns(selectedProject.id)}
              onSelectRun={handleLoadRun}
            />
          )}
        </div>

        {/* Refresh runs */}
        {selectedProject && (
          <div style={{ padding: '12px', borderTop: '1px solid #1e1e2e' }}>
            <button
              onClick={() => loadRuns(selectedProject.id)}
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
            >
              {runsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: '#0d0d14',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
              Create New Project
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Project Name *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                disabled={creatingProject}
                placeholder="My React App"
                maxLength={255}
                data-testid="project-name-input"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #1e1e2e',
                  background: '#13131f',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  opacity: creatingProject ? 0.5 : 1
                }}
              />
              <div style={{
                fontSize: '11px',
                color: newProjectName.length > 200 ? '#fbbf24' : '#64748b',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {newProjectName.length}/255
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Description (optional)
              </label>
              <textarea
                value={newProjectDesc}
                onChange={e => setNewProjectDesc(e.target.value)}
                disabled={creatingProject}
                placeholder="A brief description..."
                rows={2}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #1e1e2e',
                  background: '#13131f',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  opacity: creatingProject ? 0.5 : 1
                }}
              />
              <div style={{
                fontSize: '11px',
                color: newProjectDesc.length > 450 ? '#fbbf24' : '#64748b',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {newProjectDesc.length}/500
              </div>
            </div>

            {createError && (
              <div style={{
                color: '#ef4444',
                fontSize: '13px',
                marginBottom: '12px',
                padding: '8px',
                background: '#ef444415',
                borderRadius: '6px'
              }}>
                ⚠️ {createError}
              </div>
            )}

            {createSuccess && (
              <div style={{
                color: '#22c55e',
                fontSize: '13px',
                marginBottom: '12px',
                padding: '8px',
                background: '#22c55e15',
                borderRadius: '6px'
              }}>
                ✓ {createSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  if (!creatingProject) {
                    setShowCreateForm(false)
                    setNewProjectName('')
                    setNewProjectDesc('')
                    setCreateError('')
                    setCreateSuccess('')
                  }
                }}
                disabled={creatingProject}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid #1e1e2e',
                  borderRadius: '6px',
                  color: creatingProject ? '#334155' : '#94a3b8',
                  cursor: creatingProject ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creatingProject || !newProjectName.trim()}
                data-testid="create-project-submit"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: (creatingProject || !newProjectName.trim()) ? '#334155' : '#7c3aed',
                  border: 'none',
                  borderRadius: '6px',
                  color: (creatingProject || !newProjectName.trim()) ? '#64748b' : '#fff',
                  cursor: (creatingProject || !newProjectName.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {creatingProject ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
