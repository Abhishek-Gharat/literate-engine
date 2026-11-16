import React from 'react'

/**
 * InfoTab - Comprehensive Node Architecture Inspector
 * Provides dependency trace, impact analysis, risk signals, and contextual AI triggers.
 */
export default function InfoTab({
  node,
  impact,
  showImpact,
  onToggleImpact,
  onSwitchToChat,
  onSelectNodeByPath,
  issues = [],
}) {
  if (!node) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '40px',
        gap: '10px',
        opacity: 0.4
      }}>
        <div style={{ fontSize: '24px' }}>📋</div>
        <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
          Select any node on the graph to inspect its architecture role, trace dependencies, and evaluate impact.
        </div>
      </div>
    )
  }

  const TYPE_COLORS = {
    root: '#e2e2e2',
    component: '#5a9e6f',
    hook: '#b07a8a',
    page: '#4a7c9b',
    ghost: '#8a8a8a',
    context: '#a855f7',
    service: '#38bdf8',
  }

  const color = TYPE_COLORS[node.nodeType] || '#818cf8'
  const importCount = node.imports?.length || 0
  const usedByCount = node.importedBy?.length || 0
  const totalImpact = impact?.total ?? usedByCount

  // Determine Architecture Role
  const getArchitectureRole = () => {
    const label = node.label || node.id || ''
    if (label.includes('Context')) return 'Context Provider / Global State'
    if (label.startsWith('use') || node.nodeType === 'hook') return 'Custom React Hook'
    if (node.nodeType === 'page' || label.includes('Page') || label.includes('View')) return 'Route Page / View Container'
    if (label.includes('Service') || label.includes('Api') || label.includes('Client')) return 'Data / API Service'
    if (label.includes('Util') || label.includes('Helper')) return 'Utility / Helper Module'
    if (node.isGhost) return 'External / Third-party Dependency'
    return 'UI Presentation Component'
  }

  // Determine Risk Level & Explanation
  const getRiskInfo = () => {
    if (totalImpact >= 12 || importCount >= 15 || usedByCount >= 8) {
      return {
        level: 'High',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        desc: `High blast radius (${totalImpact} affected modules) and heavy fan-in/out. Modifications carry significant regression risk.`
      }
    }
    if (totalImpact >= 5 || importCount >= 8 || usedByCount >= 4) {
      return {
        level: 'Medium',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.15)',
        border: 'rgba(234, 179, 8, 0.4)',
        desc: `Moderate coupling (${usedByCount} direct callers). Changes will impact related features.`
      }
    }
    return {
      level: 'Low',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      desc: 'Isolated or leaf module. Safe to refactor with minimal blast radius.'
    }
  }

  const risk = getRiskInfo()

  // Filter issues for this node
  const nodeIssues = issues.filter(i => 
    i.nodeId === node.id || 
    i.secondaryNodeId === node.id || 
    (Array.isArray(i.affectedNodes) && i.affectedNodes.includes(node.id))
  )

  const contextualPrompts = [
    `Why is ${node.label} considered ${risk.level.toLowerCase()} risk?`,
    `What modules will break if ${node.label} changes?`,
    `How can I decouple ${node.label} to reduce its blast radius?`,
    `Suggest a refactoring approach for ${node.label}.`,
    `Explain the architectural purpose of ${node.label}.`,
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Node Identity Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '14px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '10px',
            color: color,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '2px 8px',
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: '999px'
          }}>
            {node.nodeType}
          </span>
          <span style={{
            fontSize: '10px',
            color: risk.color,
            fontWeight: '700',
            padding: '2px 8px',
            background: risk.bg,
            border: `1px solid ${risk.border}`,
            borderRadius: '4px'
          }}>
            Risk: {risk.level}
          </span>
        </div>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '14px',
          fontWeight: '700',
          color: '#f8fafc',
          wordBreak: 'break-word',
          lineHeight: '1.4'
        }}>
          {node.label}
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
          <strong>Role:</strong> {getArchitectureRole()}
        </div>
      </div>

      {/* Change Impact (Blast Radius) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>💥</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Change Impact Analysis
            </span>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: 'monospace',
            color: totalImpact > 0 ? '#f59e0b' : '#10b981'
          }}>
            {totalImpact} affected
          </span>
        </div>

        <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '10px' }}>
          {totalImpact === 0
            ? 'Leaf module: nothing in the analyzed codebase imports this file.'
            : `${impact?.directCount || usedByCount} direct · ${impact?.indirectCount || 0} indirect dependents (up to ${impact?.maxDepth || 1} level${(impact?.maxDepth || 1) === 1 ? '' : 's'} deep).`}
        </div>

        {onToggleImpact && totalImpact > 0 && (
          <button
            onClick={onToggleImpact}
            style={{
              width: '100%',
              padding: '7px 10px',
              background: showImpact ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${showImpact ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '7px',
              color: showImpact ? '#fde047' : '#f1f5f9',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{showImpact ? '✦' : '◉'}</span>
            <span>{showImpact ? 'Impact Highlight Active (Click to Hide)' : 'View Impact Graph'}</span>
          </button>
        )}
      </div>

      {/* Dependency Trace: Imports vs Dependents */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '12px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#f8fafc',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🔗</span> Dependency Trace
        </div>

        {/* Outgoing: Imports */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            <span><strong>Imports</strong> (Outgoing)</span>
            <span>{importCount}</span>
          </div>
          {importCount === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>None (Root / Leaf)</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '120px', overflowY: 'auto' }}>
              {node.imports.map((imp, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectNodeByPath?.(imp)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: '2px solid #818cf8',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#c7d2fe',
                    cursor: onSelectNodeByPath ? 'pointer' : 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  title={onSelectNodeByPath ? `Focus ${imp}` : undefined}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imp}</span>
                  {onSelectNodeByPath && <span style={{ opacity: 0.5, fontSize: '9px' }}>→</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming: Dependents (Used By) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            <span><strong>Used By</strong> (Dependents)</span>
            <span>{usedByCount}</span>
          </div>
          {usedByCount === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>None (Orphan / Top-level Page)</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '120px', overflowY: 'auto' }}>
              {node.importedBy.map((caller, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectNodeByPath?.(caller)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: '2px solid #10b981',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#a7f3d0',
                    cursor: onSelectNodeByPath ? 'pointer' : 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  title={onSelectNodeByPath ? `Focus ${caller}` : undefined}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caller}</span>
                  {onSelectNodeByPath && <span style={{ opacity: 0.5, fontSize: '9px' }}>→</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Relevant Issues */}
      {nodeIssues.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f87171', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚠️ Issues Affecting This Node ({nodeIssues.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {nodeIssues.map((iss) => (
              <div key={iss.id} style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                • <strong>{iss.title}</strong>: {iss.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual AI Actions */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '10px',
        padding: '12px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#a5b4fc',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>✦</span> Contextual AI Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {contextualPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSwitchToChat?.(prompt)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt}</span>
              <span style={{ color: '#818cf8', fontSize: '10px', flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
