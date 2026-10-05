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
      background: 'rgba(10, 14, 23, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '22px 20px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '900',
          lineHeight: 1,
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
          flexShrink: 0
        }}>↯</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '18px',
            lineHeight: '1.2',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>ReactViz</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              padding: '1px 6px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>v1.0</span>
          </div>
          <div style={{
            marginTop: '3px',
            color: '#64748b',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '11px',
            lineHeight: '14px',
            letterSpacing: '0.5px'
          }}>
            Architecture Engine
          </div>
        </div>
      </div>

      {/* New Project CTA */}
      <div style={{ padding: '16px 20px' }}>
        <button
          onClick={onCreateClick}
          disabled={isAnalyzing}
          data-testid="new-project-button"
          style={{
            width: '100%',
            height: '42px',
            background: isAnalyzing
              ? 'rgba(255, 255, 255, 0.06)'
              : 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            border: 'none',
            borderRadius: '10px',
            color: isAnalyzing ? '#64748b' : '#090d16',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isAnalyzing ? 'none' : '0 4px 16px rgba(255, 255, 255, 0.15)',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={e => {
            if (!isAnalyzing) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.25)'
            }
          }}
          onMouseLeave={e => {
            if (!isAnalyzing) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.15)'
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          <span>New Project</span>
        </button>
      </div>

      {/* Section Header */}
      <div style={{
        padding: '0 20px 8px',
        color: '#64748b',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Projects</span>
        {projects && projects.length > 0 && (
          <span style={{
            fontSize: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '1px 6px',
            borderRadius: '4px',
            color: '#94a3b8'
          }}>{projects.length}</span>
        )}
      </div>

      {/* Projects List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
        {projectsLoading ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            Loading projects...
          </div>
        ) : projectsError ? (
          <div data-testid="projects-error" style={{
            padding: '24px 16px',
            textAlign: 'center',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            margin: '8px'
          }}>
            <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>
              {projectsError}
            </div>
            <button
              onClick={onRetry}
              disabled={projectsLoading}
              data-testid="retry-projects-button"
              style={{
                padding: '6px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div data-testid="empty-projects" style={{
            padding: '40px 16px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            margin: '8px 4px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.6 }}>📂</div>
            <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              No projects yet
            </div>
            <div style={{ color: '#64748b', fontSize: '11px', lineHeight: '1.4' }}>
              Create your first project to get started
            </div>
          </div>
        ) : (
          projects.map(project => {
            const isSelected = selectedProject?.id === project.id
            return (
              <div
                key={project.id}
                onClick={() => !isAnalyzing && onSelectProject(project)}
                data-testid={`project-item-${project.id}`}
                role="button"
                style={{
                  minHeight: '44px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  marginBottom: '4px',
                  background: isSelected
                    ? 'rgba(99, 102, 241, 0.14)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(99, 102, 241, 0.35)'
                    : '1px solid transparent',
                  borderLeft: isSelected
                    ? '3px solid #818cf8'
                    : '3px solid transparent',
                  opacity: isAnalyzing ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isSelected ? '0 2px 10px rgba(99, 102, 241, 0.15)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isAnalyzing && !isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                <span style={{
                  fontSize: '16px',
                  color: isSelected ? '#818cf8' : '#64748b',
                  flexShrink: 0
                }}>
                  {isSelected ? '📂' : '📁'}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
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
                    }}>{project.description}</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onRetry}
          disabled={projectsLoading || isAnalyzing}
          style={{
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: (projectsLoading || isAnalyzing) ? '#64748b' : '#cbd5e1',
            cursor: (projectsLoading || isAnalyzing) ? 'not-allowed' : 'pointer',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            if (!projectsLoading && !isAnalyzing) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.color = '#ffffff'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.color = (projectsLoading || isAnalyzing) ? '#64748b' : '#cbd5e1'
          }}
        >
          <span>↻</span> {projectsLoading ? 'Loading...' : 'Refresh'}
        </button>

        <a
          href="https://github.com/Abhishek-Gharat/literate-engine"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#64748b',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '11px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <span>▤</span> Docs
        </a>
      </div>
    </aside>
  )
}
