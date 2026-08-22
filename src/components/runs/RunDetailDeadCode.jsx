import React, { useMemo } from 'react'

const MAX_FILES = 8
const MAX_NAMES = 4

/**
 * RunDetailDeadCode - Files exporting symbols that nothing in the project imports.
 *
 * @param {Object} props
 * @param {Object|null} props.run - Run whose snapshot nodes carry deadExports
 */
export default function RunDetailDeadCode({ run }) {
  const deadFiles = useMemo(() => {
    const snapshot = run?.snapshot || {}
    const nodes = snapshot.nodes || []
    return nodes
      .filter((node) => !node.isGhost && (node.deadExports?.length || 0) > 0)
      .sort((a, b) => b.deadExports.length - a.deadExports.length || a.id.localeCompare(b.id))
      .slice(0, MAX_FILES)
  }, [run])

  if (deadFiles.length === 0) return null

  const total = deadFiles.reduce((sum, file) => sum + file.deadExports.length, 0)

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <span style={{
          fontSize: '11px',
          color: '#64748b',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>Dead Exports</span>
        <span style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: '700',
          color: '#fb923c'
        }}>{total}</span>
      </div>

      {deadFiles.map((file) => {
        const shown = file.deadExports.slice(0, MAX_NAMES)
        const rest = file.deadExports.length - shown.length
        return (
          <div key={file.id} style={{
            padding: '8px 2px',
            borderBottom: '1px solid #1e293b80',
            fontSize: '12px'
          }}>
            <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#cbd5e1',
              display: 'block',
              marginBottom: '4px',
              wordBreak: 'break-all'
            }}>{file.id}</code>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {shown.map((name) => (
                <span key={name} style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#fca5a5',
                  background: '#ef444415',
                  border: '1px solid #ef444433',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>{name}</span>
              ))}
              {rest > 0 && (
                <span style={{ fontSize: '10px', color: '#64748b' }}>+{rest} more</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
