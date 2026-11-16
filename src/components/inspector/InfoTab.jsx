import React, { useState } from 'react'

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
  const [activeSubView, setActiveSubView] = useState('trace') // 'trace' | 'deps' | 'callers' | 'impact'

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
    (i.nodeId && i.nodeId === node.id) ||
    (i.secondaryNodeId && i.secondaryNodeId === node.id) ||
    (Array.isArray(i.affectedNodes) && node.id && i.affectedNodes.includes(node.id))
  )

  const contextualPrompts = [
    `Why is ${node.label} considered ${risk.level.toLowerCase()} risk?`,
    `What depends on this module (${usedByCount} callers, ${totalImpact} affected)?`,
    `How can I reduce coupling for ${node.label}?`,
    `Suggest a refactoring approach for ${node.label}.`,
    `Explain the architectural purpose and responsibility of ${node.label}.`,
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* ── Node Identity & Role Card ── */}
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
          <span style={{ color: '#64748b' }}>Role:</span> <strong style={{ color: '#e2e8f0' }}>{getArchitectureRole()}</strong>
        </div>

        {node.id !== node.label && (
          <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.id}
          </div>
        )}

        {/* Quick architecture metrics row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Imports</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8' }}>{importCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Callers</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>{usedByCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Impact</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: totalImpact > 0 ? '#f59e0b' : '#94a3b8' }}>{totalImpact}</div>
          </div>
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Issues</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: nodeIssues.length > 0 ? '#ef4444' : '#10b981' }}>{nodeIssues.length}</div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Row ── */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => setActiveSubView('trace')}
          style={{
            flex: 1,
            padding: '7px 8px',
            background: activeSubView === 'trace' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${activeSubView === 'trace' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '6px',
            color: activeSubView === 'trace' ? '#c7d2fe' : '#cbd5e1',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <span>🔗</span> Trace
        </button>

        {onToggleImpact && (
          <button
            onClick={onToggleImpact}
            style={{
              flex: 1,
              padding: '7px 8px',
              background: showImpact ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${showImpact ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '6px',
              color: showImpact ? '#fde047' : '#cbd5e1',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>💥</span> Impact {showImpact ? '(On)' : ''}
          </button>
        )}

        {onSwitchToChat && (
          <button
            onClick={() => onSwitchToChat(`Explain the role and architecture impact of ${node.label}`)}
            style={{
              flex: 1,
              padding: '7px 8px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: '6px',
              color: '#e0e7ff',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>✦</span> Ask AI
          </button>
        )}
      </div>

      {/* ── Sub-view Tab Selector (Dependencies vs Dependents vs Impact vs Trace) ── */}
      <div style={{
        display: 'flex',
        gap: '2px',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {[
          { id: 'trace', label: 'Trace' },
          { id: 'deps', label: `Imports (${importCount})` },
          { id: 'callers', label: `Dependents (${usedByCount})` },
          { id: 'impact', label: `Impact (${totalImpact})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubView(tab.id)}
            style={{
              flex: 1,
              padding: '4px 6px',
              background: activeSubView === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeSubView === tab.id ? '#ffffff' : '#64748b',
              fontSize: '10px',
              fontWeight: activeSubView === tab.id ? '700' : '500',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Sub-view Content Area ── */}
      {activeSubView === 'trace' && (
        /* Visual Dependency Flow Trace */
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
            🔗 Dependency Connection Flow
          </div>

          {/* Upstream Callers */}
          <div>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
              ↑ DEPENDENTS (Who imports {node.label})
            </div>
            {usedByCount === 0 ? (
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '2px 0' }}>
                No incoming callers (Root component or entry page)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {node.importedBy.slice(0, 4).map((caller, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectNodeByPath?.(caller)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#a7f3d0',
                      cursor: onSelectNodeByPath ? 'pointer' : 'default',
                    }}
                  >
                    <span>{caller}</span>
                    <span style={{ fontSize: '10px', color: '#10b981' }}>↓ calls</span>
                  </div>
                ))}
                {usedByCount > 4 && (
                  <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
                    +{usedByCount - 4} more dependents
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Node Anchor */}
          <div style={{
            padding: '6px 10px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#c7d2fe',
            fontFamily: 'monospace'
          }}>
            ❖ {node.label} (Current Focus)
          </div>

          {/* Downstream Dependencies */}
          <div>
            <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, marginBottom: '4px' }}>
              ↓ DEPENDENCIES (Who {node.label} imports)
            </div>
            {importCount === 0 ? (
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '2px 0' }}>
                No outgoing imports (Leaf utility or presentation node)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {node.imports.slice(0, 4).map((imp, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectNodeByPath?.(imp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#c7d2fe',
                      cursor: onSelectNodeByPath ? 'pointer' : 'default',
                    }}
                  >
                    <span>{imp}</span>
                    <span style={{ fontSize: '10px', color: '#818cf8' }}>→ uses</span>
                  </div>
                ))}
                {importCount > 4 && (
                  <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
                    +{importCount - 4} more dependencies
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubView === 'deps' && (
        /* Outgoing Imports List */
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            Imports ({importCount}) — Modules this file depends on
          </div>
          {importCount === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              No outgoing dependencies.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
              {node.imports.map((imp, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectNodeByPath?.(imp)}
                  style={{
                    padding: '5px 8px',
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
      )}

      {activeSubView === 'callers' && (
        /* Incoming Callers List */
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            Dependents ({usedByCount}) — Modules that depend on this file
          </div>
          {usedByCount === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              No incoming callers.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
              {node.importedBy.map((caller, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectNodeByPath?.(caller)}
                  style={{
                    padding: '5px 8px',
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
      )}

      {activeSubView === 'impact' && (
        /* Change Impact (Blast Radius Breakdown) */
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
              Transitive Blast Radius
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: totalImpact > 0 ? '#f59e0b' : '#10b981', fontFamily: 'monospace' }}>
              {totalImpact} affected modules
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
            {totalImpact === 0
              ? 'Isolated leaf module: no files depend on this module.'
              : `${impact?.directCount || usedByCount} direct · ${impact?.indirectCount || 0} indirect dependents (maximum traversal depth: ${impact?.maxDepth || 1}).`}
          </div>

          {impact?.ordered && impact.ordered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '140px', overflowY: 'auto' }}>
              {impact.ordered.slice(0, 8).map(entry => (
                <div
                  key={entry.id}
                  onClick={() => onSelectNodeByPath?.(entry.id)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    borderLeft: `2px solid ${entry.depth === 1 ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)'}`,
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontFamily: 'monospace',
                    color: '#fef3c7',
                    cursor: onSelectNodeByPath ? 'pointer' : 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.label || entry.id}</span>
                  <span style={{ fontSize: '9.5px', opacity: 0.7 }}>depth {entry.depth}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Relevant Issues for This Node ── */}
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

      {/* ── Contextual AI Actions ── */}
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
          <span>✦</span> Contextual AI Prompts
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
