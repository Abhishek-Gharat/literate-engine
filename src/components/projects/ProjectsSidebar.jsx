import React from 'react'

/**
 * ProjectsSidebar - Left sidebar with project list and creation
 *
 * @param {Object} props
 * @param {Array} props.projects - List of projects
 * @param {boolean} props.projectsLoading - Whether projects are loading
 * @param {string|null} props.projectsError - Error message
 * @param {Object|null} props.selectedProject - Currently selected project
 * @param {boolean} props.isAnalyzing - Whether analysis is in progress
 * @param {Function} props.onSelectProject - Callback to select a project
 * @param {Function} props.onCreateClick - Callback to open create modal
 * @param {Function} props.onRetry - Callback to retry loading projects
 */
export default function ProjectsSidebar({
  projects,
  projectsLoading,
  projectsError,
  selectedProject,
  isAnalyzing,
  onSelectProject,
  onCreateClick,
  onRetry
}) {
  return (
    <aside style={{
      width: '280px',
      flexShrink: 0,
      background: '#121b2b',
      borderRight: '1px solid #3b465d',
      display: 'flex',
      flexDirection: 'column',
      color: '#ece8ff'
    }}>
      <div style={{
        padding: '24px 24px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: '#7c3aed',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
          fontWeight: '800',
          lineHeight: 1
        }}>↯</div>
        <div>
          <div style={{
            fontSize: '21px',
            lineHeight: '1',
            fontWeight: '800',
            color: '#ead7ff',
            textShadow: '2px 2px 0 #2a1c4a'
          }}>ReactViz</div>
          <div style={{
            marginTop: '6px',
            color: '#9aa4bd',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '12px',
            lineHeight: '16px',
            letterSpacing: '1.2px'
          }}>
            v1.0.4 - Analysis<br />Engine
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px 24px' }}>
        <button
          onClick={onCreateClick}
          disabled={isAnalyzing}
          data-testid="new-project-button"
          style={{
            width: '100%',
            height: '48px',
            background: isAnalyzing ? '#334155' : '#7c3aed',
            border: 'none',
            borderRadius: '2px',
            color: '#fff',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '800',
            boxShadow: '0 8px 20px #7c3aed22'
          }}
        >+ New Project</button>
      </div>

      <div style={{
        padding: '0 24px',
        color: '#6f7890',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1.8px',
        textTransform: 'uppercase'
      }}>Projects</div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 16px' }}>
        {projectsLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
            Loading projects...
          </div>
        ) : projectsError ? (
          <div data-testid="projects-error" style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
              {projectsError}
            </div>
            <button
              onClick={onRetry}
              disabled={projectsLoading}
              data-testid="retry-projects-button"
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid #7c3aed',
                borderRadius: '4px',
                color: '#c4b5fd',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div data-testid="empty-projects" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>
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
                minHeight: '48px',
                padding: '0 12px',
                borderRadius: 0,
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                marginBottom: '4px',
                background: selectedProject?.id === project.id ? '#211c46' : 'transparent',
                borderLeft: selectedProject?.id === project.id ? '3px solid #ddd2ff' : '3px solid transparent',
                opacity: isAnalyzing ? 0.5 : 1,
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={e => {
                if (!isAnalyzing && selectedProject?.id !== project.id) {
                  e.currentTarget.style.background = '#182235'
                }
              }}
              onMouseLeave={e => {
                if (selectedProject?.id !== project.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{
                width: '20px',
                height: '15px',
                border: '2px solid #d7cfe8',
                borderRadius: '3px',
                position: 'relative',
                flexShrink: 0,
                boxSizing: 'border-box'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '3px',
                  top: '-6px',
                  width: '8px',
                  height: '5px',
                  border: '2px solid #d7cfe8',
                  borderBottom: 'none',
                  borderRadius: '2px 2px 0 0',
                  boxSizing: 'border-box'
                }} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '1.4px',
                  color: selectedProject?.id === project.id ? '#ead7ff' : '#d7d2e6',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {project.name}
                </div>
                {project.description && (
                  <div style={{
                    fontSize: '11px',
                    color: '#7d89a5',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{project.description}</div>
                )}
              </div>
            </div>
          ))
        )}

        <div style={{
          marginTop: '24px',
          color: '#6f7890',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '1.8px',
          textTransform: 'uppercase'
        }}>System</div>

        {['Components', 'Graphs', 'Settings'].map((item) => (
          <div
            key={item}
            style={{
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#d7d2e6',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '15px',
              letterSpacing: '1.2px'
            }}
          >
            <span style={{ width: '26px', textAlign: 'center', color: '#d7cfe8' }}>□</span>
            {item}
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px 24px 24px',
        borderTop: '1px solid #3b465d',
        display: 'grid',
        gap: '16px'
      }}>
        <button
          onClick={onRetry}
          disabled={projectsLoading || isAnalyzing}
          style={{
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: (projectsLoading || isAnalyzing) ? '#475569' : '#d7d2e6',
            cursor: (projectsLoading || isAnalyzing) ? 'not-allowed' : 'pointer',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '16px',
            letterSpacing: '1.4px',
            textAlign: 'left'
          }}
        >↻ {projectsLoading ? 'Loading...' : 'Refresh'}</button>
        <div style={{
          color: '#d7d2e6',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '16px',
          letterSpacing: '1.4px'
        }}>▤ Documentation</div>
      </div>
    </aside>
  )
}
