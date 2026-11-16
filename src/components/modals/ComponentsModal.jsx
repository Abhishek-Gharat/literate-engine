import React from 'react'

const TYPE_CONFIG = {
  root:      { icon: '⚡', label: 'Entry Points', color: '#e2e2e2' },
  entry:     { icon: '🚪', label: 'Entry Points', color: '#4a7c9b' },
  page:      { icon: '📄', label: 'Pages', color: '#4a7c9b' },
  index:     { icon: '📦', label: 'Barrels', color: '#8b6fb0' },
  component: { icon: '🧩', label: 'Components', color: '#5a9e6f' },
  hook:      { icon: '🪝', label: 'Hooks', color: '#b07a8a' },
  context:   { icon: '🌐', label: 'Contexts', color: '#7c3aed' },
  style:     { icon: '🎨', label: 'Styles', color: '#d97706' },
  config:    { icon: '⚙️', label: 'Config Files', color: '#64748b' },
  ghost:     { icon: '👻', label: 'External', color: '#8a8a8a' },
}

const ORDER = ['root', 'entry', 'page', 'component', 'hook', 'context', 'index', 'style', 'config', 'ghost']

/**
 * ComponentsModal - Component library for the latest analysis run:
 * every detected file grouped by type with dependency counts.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Array} props.nodes - Snapshot nodes of the latest run
 * @param {string|null} props.projectName - Selected project name
 * @param {Function} props.onClose
 */
export default function ComponentsModal({ isOpen, nodes = [], projectName, onClose }) {
  if (!isOpen) return null

  const groups = new Map()
  for (const node of nodes) {
    const type = node.isGhost ? 'ghost' : (node.type || node.data?.nodeType || 'component')
    if (!groups.has(type)) groups.set(type, [])
    groups.get(type).push(node)
  }
  const sortedTypes = [...groups.keys()].sort(
    (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="components-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '20px 24px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>Component Library</h3>
            <span style={{ fontSize: '11px', color: '#71717a' }}>
              {projectName ? `${projectName} · ` : ''}{nodes.length} files in latest run
            </span>
          </div>
          <button
            onClick={onClose}
            data-testid="components-modal-close"
            style={{
              width: '28px', height: '28px',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '7px',
              color: '#ededed', cursor: 'pointer', fontSize: '14px', lineHeight: 1
            }}
          >×</button>
        </div>

        {nodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>
            Run an analysis to populate your component library.
          </div>
        ) : (
          <div style={{ overflowY: 'auto', minHeight: 0 }}>
            {sortedTypes.map((type) => {
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.component
              const items = groups.get(type)
              return (
                <div key={type} style={{ marginBottom: '14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '11px', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '1.2px',
                    color: config.color,
                    marginBottom: '6px'
                  }}>
                    <span>{config.icon}</span>{config.label}
                    <span style={{
                      marginLeft: 'auto',
                      fontFamily: 'monospace',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '999px',
                      padding: '0 8px'
                    }}>{items.length}</span>
                  </div>
                  {items.map((node) => (
                    <div key={node.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '6px 10px', marginBottom: '3px',
                      background: '#111111',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      <code style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#ededed',
                        flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{node.id}</code>
                      <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace', flexShrink: 0 }}>
                        ↓{node.imports?.length || 0} ↑{node.importedBy?.length || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
