import React, { useState, useEffect, useCallback } from 'react'
import ProjectsSidebar from '../projects/ProjectsSidebar'
import UploadCenter from '../uploads/UploadCenter'
import RunsSidebar from '../runs/RunsSidebar'
import RunComparisonPanel from '../runs/RunComparisonPanel'
import CreateProjectModal from '../modals/CreateProjectModal'
import SettingsModal from '../modals/SettingsModal'
import { AnimateTabs } from '../ui/animate'
import { useFileInput } from '../../hooks/useFileInput'

/**
 * FileInput - Main dashboard component
 * Orchestrates ProjectsSidebar, UploadCenter, and RunsSidebar
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
  onTryDemo,
  activeTab,
  onTabChange,
  apiKey = '',
  onApiKeyChange,
  hideHeader = false,
  hideProjectsSidebar = false,
  demoMode = false,
  demoRuns = []
}) {
  const [showSettings, setShowSettings] = useState(false)

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
    analyzing,
    selectedProject
  })

  // Load runs when project changes - use the ID string to avoid infinite loops
  const selectedProjectId = selectedProject?.id
  useEffect(() => {
    if (selectedProjectId) {
      loadRuns(selectedProjectId)
    }
  }, [selectedProjectId, loadRuns])

  // Effective runs: if demoMode or demoRuns provided, use demoRuns
  const effectiveRuns = (demoMode && demoRuns?.length) ? demoRuns : runs
  const effectiveRunId = (demoMode && demoRuns?.length) ? (selectedRunId || demoRuns[0]?.id) : selectedRunId
  const effectiveSelectedRun = effectiveRuns.find(r => r.id === effectiveRunId) || (demoMode ? demoRuns[0] : null)

  // Find the currently selected run object
  const selectedRun = effectiveSelectedRun

  // Wrap handleLoadRun to ensure tab context is preserved
  const handleSelectRunWithContext = useCallback((runOrId) => {
    if (activeTab !== 'Runs') {
      onTabChange('Runs')
    }
    handleLoadRun(runOrId)
  }, [handleLoadRun, activeTab, onTabChange])

  const hasAnalysisError = error || analysisError

  const dashboardTabs = [
    { id: 'Dashboard', label: 'Architecture Workspace', icon: '📊' },
    { id: 'Runs', label: 'Runs History', icon: '🕘', badge: effectiveRuns?.length || 0 }
  ]

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: '100vh',
        background: '#07090e',
        color: '#ededed',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        overflow: 'hidden'
      }}
    >
      {!hideProjectsSidebar && (
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
      )}

      <main style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#07090e'
      }}>
        {!hideHeader && (
          <header style={{
            height: '64px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(10, 14, 23, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            boxSizing: 'border-box',
            gap: '24px'
          }}>
            {/* AnimateTabs for Header Tabs */}
            <div>
              <AnimateTabs
                tabs={dashboardTabs}
                activeTab={activeTab}
                onChange={onTabChange}
                layoutId="dashboard-header-tab-indicator"
                tabStyle={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  padding: '7px 16px',
                  height: '36px'
                }}
              />
            </div>

            {/* Right Header Controls */}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onTryDemo}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
                  border: '1px solid rgba(129, 140, 248, 0.45)',
                  color: '#e0e7ff',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>✦</span> Launch Demo Project
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(true)}
                title="Configure API key and AI settings"
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: apiKey ? '#34d399' : '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
              >
                <span>⚙</span>
                <span>Settings</span>
                {apiKey ? (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'
                  }} />
                ) : null}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '11.5px',
                color: '#34d399',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Ready</span>
              </div>
            </div>
          </header>
        )}

        {activeTab === 'Runs' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <div style={{ flexShrink: 0 }}>
              <RunComparisonPanel
                runs={effectiveRuns}
                currentRun={effectiveSelectedRun}
                selectedProject={selectedProject}
              />
            </div>
            <div style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto'
            }}>
              <RunsSidebar
                runs={effectiveRuns}
                loading={demoMode ? false : runsLoading}
                error={demoMode ? null : runsError}
                selectedProject={selectedProject}
                selectedRunId={effectiveRunId}
                isAnalyzing={isAnalyzing}
                onRetry={() => selectedProject && loadRuns(selectedProject.id)}
                onSelectRun={handleSelectRunWithContext}
              />
            </div>
          </div>
        ) : (
           <UploadCenter
            mode={mode}
            setMode={setMode}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            runs={effectiveRuns}
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

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onApiKeyChange={onApiKeyChange}
      />
    </div>
  )
}
