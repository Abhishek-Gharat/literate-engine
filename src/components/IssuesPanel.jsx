import { useState, useEffect } from 'react'

export function IssuesPanel({ nodes, edges, cyclicEdges, stats, onNodeClick, isOpen, onToggle }) {
  // Calculate issues from real data
  const orphanFiles = nodes.filter(n => 
    n.data && 
    (!n.data.imports || n.data.imports.length === 0) && 
    (!n.data.importedBy || n.data.importedBy.length === 0)
  )

  const mostConnected = nodes.length > 0 
    ? nodes.reduce((max, n) => {
        const connections = (n.data?.imports?.length || 0) + (n.data?.importedBy?.length || 0)
        const maxConnections = (max.data?.imports?.length || 0) + (max.data?.importedBy?.length || 0)
        return connections > maxConnections ? n : max
      })
    : null

  const topRefactorTarget = nodes.length > 0
    ? nodes.reduce((max, n) => {
        const usedBy = n.data?.importedBy?.length || 0
        const maxUsedBy = max.data?.importedBy?.length || 0
        return usedBy > maxUsedBy ? n : max
      })
    : null

  const circularCount = cyclicEdges?.length || 0
  const orphanCount = orphanFiles.length
  const totalIssues = circularCount + orphanCount

  // Don't show anything if no issues and not explicitly opened
  if (totalIssues === 0 && !mostConnected && !isOpen) {
    return null
  }

  // Compact button when panel is closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: '#0d0d14',
          border: '1px solid #1e1e2e',
          borderRadius: '8px',
          color: '#f1f5f9',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#7c3aed'
          e.currentTarget.style.background = '#13131f'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1e1e2e'
          e.currentTarget.style.background = '#0d0d14'
        }}
      >
        <span style={{ fontSize: '14px' }}>⚠️</span>
        <span>Issues</span>
        {totalIssues > 0 && (
          <span style={{
            padding: '2px 8px',
            background: circularCount > 0 ? '#ef4444' : '#f59e0b',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#fff',
          }}>
            {totalIssues}
          </span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '280px',
      background: '#0d0d14',
      border: '1px solid #1e1e2e',
      borderRadius: '10px',
      padding: '16px',
      zIndex: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #1e1e2e',
      }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          color: '#f1f5f9',
        }}>Architecture Issues</span>
        {totalIssues > 0 && (
          <span style={{
            marginLeft: 'auto',
            marginRight: '8px',
            padding: '2px 8px',
            background: circularCount > 0 ? '#ef444422' : '#f59e0b22',
            border: `1px solid ${circularCount > 0 ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            color: circularCount > 0 ? '#ef4444' : '#f59e0b',
          }}>
            {totalIssues}
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#64748b',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1e1e2e'
            e.currentTarget.style.color = '#f1f5f9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#64748b'
          }}
          title="Close panel"
        >
          ×
        </button>
      </div>

      {/* Circular Dependencies */}
      {circularCount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', color: '#ef4444' }}>🔄</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>
              Circular Dependencies ({circularCount})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cyclicEdges.slice(0, 3).map((edge, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                background: '#13131f',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }} onClick={() => onNodeClick?.({ data: { label: edge.source } })}>
                <span style={{ color: '#ef4444' }}>{edge.source}</span>
                <span style={{ margin: '0 4px' }}>↔</span>
                <span style={{ color: '#ef4444' }}>{edge.target}</span>
              </div>
            ))}
            {circularCount > 3 && (
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                padding: '4px',
              }}>
                +{circularCount - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orphan Files */}
      {orphanCount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', color: '#f59e0b' }}>👻</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
              Unreferenced Files ({orphanCount})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {orphanFiles.slice(0, 3).map((node, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                background: '#13131f',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }} onClick={() => onNodeClick?.(node)}>
                {node.data?.label || node.id}
              </div>
            ))}
            {orphanCount > 3 && (
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                padding: '4px',
              }}>
                +{orphanCount - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Most Connected Component */}
      {mostConnected && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', color: '#818cf8' }}>🔗</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#818cf8' }}>
              Most Connected
            </span>
          </div>
          <div style={{
            padding: '10px',
            background: '#13131f',
            borderRadius: '6px',
            border: '1px solid #1e1e2e',
            cursor: 'pointer',
          }} onClick={() => onNodeClick?.(mostConnected)}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#f1f5f9',
              fontFamily: 'monospace',
              marginBottom: '4px',
              wordBreak: 'break-word',
            }}>
              {mostConnected.data?.label || mostConnected.id}
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '11px',
              color: '#64748b',
            }}>
              <span>↓ {(mostConnected.data?.imports?.length || 0)} imports</span>
              <span>↑ {(mostConnected.data?.importedBy?.length || 0)} used by</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Refactor Target */}
      {topRefactorTarget && (topRefactorTarget.data?.importedBy?.length || 0) > 3 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', color: '#f472b6' }}>🔧</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f472b6' }}>
              Refactor Target
            </span>
          </div>
          <div style={{
            padding: '10px',
            background: '#13131f',
            borderRadius: '6px',
            border: '1px solid #1e1e2e',
            cursor: 'pointer',
          }} onClick={() => onNodeClick?.(topRefactorTarget)}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#f1f5f9',
              fontFamily: 'monospace',
              marginBottom: '6px',
              wordBreak: 'break-word',
            }}>
              {topRefactorTarget.data?.label || topRefactorTarget.id}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              lineHeight: '1.5',
            }}>
              Used by {(topRefactorTarget.data?.importedBy?.length || 0)} components
              <br />
              Consider splitting or abstracting
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
