import React, { useEffect, useState } from 'react'
import ProjectsSidebar from '../projects/ProjectsSidebar'
import UploadCenter from '../uploads/UploadCenter'
import RunsSidebar from '../runs/RunsSidebar'
import CreateProjectModal from '../modals/CreateProjectModal'
import { useFileInput } from '../../hooks/useFileInput'

/**
 * FileInput - Main dashboard component
 * Orchestrates ProjectsSidebar, UploadCenter, and RunsSidebar
 * 
 * @param {Object} props
 * @param {Function} props.onFilesReady - Callback when files are ready
 * @param {boolean} props.analyzing - External analyzing state
 * @param {string} props.analysisError - External analysis error
 * @param {Object|null} props.selectedProject - Currently selected project
 * @param {Function} props.onSelectProject - Callback when project is selected
 * @param {Function} props.onLoadRun - Callback when run is loaded
 * @param {string|null} props.selectedRunId - Currently selected run ID
 * @param {Function} props.onSelectRun - Callback when run is selected
 * @param {Function} props.onRunsChange - Callback when runs change
 */
export default function FileInput({
  onFilesReady,
  analyzing = false,
  analysisError = '',
  selectedProject,
  onSelectProject,
  onLoadRun,
  selectedRunId,
  onSelectRun,
  onRunsChange,
  onTryDemo
}) {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const {
    mode,
    setMode,
    githubUrl,
    setGithubUrl,
    error,
    analysisSuccess,
    isAnalyzing,
    projects,
    projectsLoading,
    projectsError,
    loadProjects,
    runs,
    runsLoading,
    runsError,
    loadRuns,
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
    handleLocalFiles,
    handleGithubFetch,
    handleLoadRun
  } = useFileInput({
    onFilesReady,
    onSelectProject,
    onLoadRun,
    onSelectRun,
    onRunsChange,
    analyzing
  })

  // Load runs when project changes - use the ID string to avoid infinite loops
  const selectedProjectId = selectedProject?.id
  useEffect(() => {
    if (selectedProjectId) {
      loadRuns(selectedProjectId)
    }
  }, [selectedProjectId, loadRuns])

  const hasAnalysisError = error || analysisError

  const tabs = ['Dashboard','Runs']

  return (
  <div
  style={{
    display: 'flex',
    flex: 1,
    width: '100%',
    minWidth: 0,
    height: '100vh',
    background: '#0b1424',
    color: '#f1f5f9',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    overflow: 'hidden'
  }}
>
      <ProjectsSidebar
        projects={projects}
        projectsLoading={projectsLoading}
        projectsError={projectsError}
        selectedProject={selectedProject}
        isAnalyzing={isAnalyzing}
        onSelectProject={onSelectProject}
        onCreateClick={openCreateForm}
        onRetry={loadProjects}
      />

      <main style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b1424'
      }}>
        <header style={{
          height: '64px',
          flexShrink: 0,
          borderBottom: '1px solid #3b465d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          boxSizing: 'border-box',
          gap: '32px'
        }}>
          <h1 style={{
            margin: 0,
            color: '#ead7ff',
            fontSize: '28px',
            fontWeight: '800',
            textShadow: '2px 2px 0 #2a1c4a'
          }}>Dashboard</h1>
          <nav style={{ display: 'flex', alignItems: 'stretch', gap: '32px', height: '100%' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative',
                  padding: '0',
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === tab ? '#ead7ff' : '#d7d2e6',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeTab === tab ? '800' : '600'
                }}
              >
                {tab}
                {activeTab === tab && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '0',
                    height: '2px',
                    background: '#d8b4fe'
                  }} />
                )}
              </button>
            ))}
          </nav>
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            color: '#ece8ff',
            fontSize: '24px'
          }}>
            <span>♢</span>
            <span>⚙</span>
            <div style={{
              width: '40px',
              height: '40px',
              border: '1px solid #3b465d',
              borderRadius: '10px',
              background: '#10202a',
              boxShadow: 'inset 0 0 0 1px #193746'
            }} />
          </div>
        </header>

        {activeTab === 'Runs' ? (
          <RunsSidebar
            runs={runs}
            runsLoading={runsLoading}
            runsError={runsError}
            selectedProject={selectedProject}
            selectedRunId={selectedRunId}
            isAnalyzing={isAnalyzing}
            onRetry={() => selectedProject && loadRuns(selectedProject.id)}
            onSelectRun={handleLoadRun}
          />
        ) : (
           <UploadCenter
            mode={mode}
            setMode={setMode}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            runs={runs}
            selectedProject={selectedProject}
            isAnalyzing={isAnalyzing}
            hasAnalysisError={hasAnalysisError}
            analysisError={error}
            analysisSuccess={analysisSuccess}
            onLocalFiles={(files) => handleLocalFiles(files, selectedProject)}
            onGithubFetch={() => handleGithubFetch(selectedProject)}
            onTryDemo={onTryDemo}
          />
        )}
      </main>

      <CreateProjectModal
        isOpen={showCreateForm}
        name={newProjectName}
        description={newProjectDesc}
        error={createError}
        success={createSuccess}
        isCreating={creatingProject}
        onNameChange={setNewProjectName}
        onDescriptionChange={setNewProjectDesc}
        onClose={closeCreateForm}
        onSubmit={createProjectHandler}
      />
    </div>
  )
}
