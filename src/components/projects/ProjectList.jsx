import { useProjects } from '../../hooks/useProjects'

/**
 * ProjectList - Displays list of projects with selection
 * 
 * @param {Object} props
 * @param {string|null} props.selectedProjectId - Currently selected project ID
 * @param {boolean} props.isAnalyzing - Whether analysis is in progress
 * @param {Function} props.onSelectProject - Callback when project is selected
 */
export default function ProjectList({
  selectedProjectId,
  isAnalyzing,
  onSelectProject
}) {
  const { projects, loading, error, loadProjects } = useProjects({ onSelectProject })

  const handleProjectClick = (project) => {
    if (!isAnalyzing && project.id !== selectedProjectId) {
      onSelectProject(project)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            Loading projects...
          </div>
        </div>
      ) : error ? (
        <div data-testid="projects-error" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '24px' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
          <button
            onClick={loadProjects}
            disabled={loading}
            data-testid="retry-projects-button"
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #e2e2e2',
              borderRadius: '6px',
              color: '#e2e2e2',
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
            onClick={() => handleProjectClick(project)}
            data-testid={`project-item-${project.id}`}
            role="button"
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              marginBottom: '4px',
              background: selectedProjectId === project.id ? '#e2e2e222' : 'transparent',
              border: selectedProjectId === project.id ? '1px solid #e2e2e244' : '1px solid transparent',
              opacity: isAnalyzing ? 0.5 : 1,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              if (!isAnalyzing && selectedProjectId !== project.id) {
                e.currentTarget.style.background = '#1a1a1a'
              }
            }}
            onMouseLeave={e => {
              if (selectedProjectId !== project.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: selectedProjectId === project.id ? '#a78bfa' : '#f1f5f9',
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
  )
}
