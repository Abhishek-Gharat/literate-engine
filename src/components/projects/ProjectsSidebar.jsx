import React from 'react'

/**
 * ProjectsSidebar - Left sidebar with project list and creation
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
      background: '#0a0a0a',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      color: '#ededed'
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
          background: '#ffffff',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontSize: '24px',
          fontWeight: '800',
          lineHeight: 1
        }}>↯</div>
        <div>
          <div style={{
            fontSize: '21px',
            lineHeight: '1',
            fontWeight: '800',
            color: '#ffffff',
            textShadow: 'none'
          }}>ReactViz</div>
          <div style={{
            marginTop: '6px',
            color: '#a1a1a1',
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
            background: isAnalyzing ? '#1a1a1a' : '#ffffff',
            border: 'none',
            borderRadius: '2px',
            color: '#000',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '800',
            boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
          }}
        >+ New Project</button>
      </div>

      <div style={{
        padding: '0 24px',
        color: '#71717a',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1.8px',
        textTransform: 'uppercase'
      }}>Projects</div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 16px' }}>
        {projectsLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a1a1a1' }}>
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
                border: '1px solid #ffffff',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div data-testid="empty-projects" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '10px' }}>
              No projects yet
            </div>
            <div style={{ color: '#71717a', fontSize: '12px' }}>
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
                background: selectedProject?.id === project.id ? '#1a1a1a' : 'transparent',
                borderLeft: selectedProject?.id === project.id ? '3px solid #ffffff' : '3px solid transparent',
                opacity: isAnalyzing ? 0.5 : 1,
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={e => {
                if (!isAnalyzing && selectedProject?.id !== project.id) {
                  e.currentTarget.style.background = '#111111'
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
                border: '2px solid #a1a1a1',
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
                  border: '2px solid #a1a1a1',
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
                  color: selectedProject?.id === project.id ? '#ffffff' : '#ededed',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {project.name}
                </div>
                {project.description && (
                  <div style={{
                    fontSize: '11px',
                    color: '#71717a',
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
          color: '#71717a',
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
              color: '#a1a1a1',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '15px',
              letterSpacing: '1.2px'
            }}
          >
            <span style={{ width: '26px', textAlign: 'center', color: '#a1a1a1' }}>□</span>
            {item}
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px 24px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
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
            color: (projectsLoading || isAnalyzing) ? '#71717a' : '#ededed',
            cursor: (projectsLoading || isAnalyzing) ? 'not-allowed' : 'pointer',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '16px',
            letterSpacing: '1.4px',
            textAlign: 'left'
          }}
        >↻ {projectsLoading ? 'Loading...' : 'Refresh'}</button>
        <div style={{
          color: '#a1a1a1',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '16px',
          letterSpacing: '1.4px'
        }}>▤ Documentation</div>
      </div>
    </aside>
  )
}
