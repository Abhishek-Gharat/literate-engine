import React, { useState, useMemo } from 'react'
import { prioritizeIssues, SEVERITY } from '../utils/issuePrioritizer.js'

export function IssuesPanel({
  nodes = [],
  cyclicEdges = [],
  edges = [],
  stats = {},
  unresolvedImports = [],
  onNodeClick,
  onViewImpact,
  isOpen,
  onToggle,
  onRefactorIssue,
  hideTrigger = false,
}) {
  const [filterSeverity, setFilterSeverity] = useState('all')

  const { issues, counts, recommendations } = useMemo(() => {
    return prioritizeIssues({ nodes, edges, cyclicEdges, stats, unresolvedImports })
  }, [nodes, edges, cyclicEdges, stats, unresolvedImports])

  const filteredIssues = useMemo(() => {
    if (filterSeverity === 'all') return issues
    return issues.filter(i => i.severity === filterSeverity)
  }, [issues, filterSeverity])

  if (!isOpen) {
    if (hideTrigger) return null
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
          padding: '8px 14px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          color: '#f8fafc',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.18s ease',
        }}
      >
        <span style={{ fontSize: '13px' }}>⚠️</span>
        <span>Issues</span>
        {counts.total > 0 && (
          <span style={{
            padding: '2px 8px',
            background: counts.critical > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            border: `1px solid ${counts.critical > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '700',
            color: counts.critical > 0 ? '#fca5a5' : '#fde68a',
          }}>
            {counts.total}
          </span>
        )}
      </button>
    )
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case SEVERITY.CRITICAL:
        return { label: '🔴 Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' }
      case SEVERITY.HIGH:
        return { label: '🔴 High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' }
      case SEVERITY.MEDIUM:
        return { label: '🟠 Medium', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' }
      default:
        return { label: '🟡 Low', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)' }
    }
  }

  return (
    <div
      data-testid="smart-issues-panel"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '360px',
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(11, 15, 25, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '16px',
        zIndex: 20,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '12px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#f8fafc' }}>
              Architecture Issues
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {counts.total} issue{counts.total === 1 ? '' : 's'} prioritized by graph risk
            </div>
          </div>
        </div>
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
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
          }}
          title="Close panel"
        >
          ×
        </button>
      </div>

      {/* "What should I fix first?" — Top Recommendations */}
      {recommendations.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '14px',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '10.5px',
            fontWeight: '700',
            color: '#f87171',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🎯</span> Recommended Next Steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  const node = nodes.find(n => n.id === rec.nodeId)
                  if (node) onNodeClick?.(node)
                  if (rec.actionType === 'impact' && onViewImpact) onViewImpact(rec.nodeId)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.5)'
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'
                }}
                title={rec.reason}
              >
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.2)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>{rec.rank}</span>
                <span style={{
                  fontSize: '11px',
                  color: '#f1f5f9',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>{rec.title}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '10px',
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {[
          { id: 'all', label: 'All', count: counts.total },
          { id: SEVERITY.CRITICAL, label: 'Critical', count: counts.critical, color: '#ef4444' },
          { id: SEVERITY.HIGH, label: 'High', count: counts.high, color: '#f97316' },
          { id: SEVERITY.MEDIUM, label: 'Med', count: counts.medium, color: '#eab308' },
          { id: SEVERITY.LOW, label: 'Low', count: counts.low, color: '#94a3b8' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterSeverity(tab.id)}
            style={{
              flex: 1,
              padding: '4px 6px',
              background: filterSeverity === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: filterSeverity === tab.id ? (tab.color || '#ffffff') : '#64748b',
              fontSize: '10.5px',
              fontWeight: filterSeverity === tab.id ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>{tab.label}</span>
            <span style={{ opacity: 0.7, fontSize: '9.5px' }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '2px',
      }}>
        {filteredIssues.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '12px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
            <div>No {filterSeverity !== 'all' ? `${filterSeverity} ` : ''}issues found.</div>
            <div style={{ fontSize: '11px', marginTop: '4px', color: '#475569' }}>
              Architecture is clean in this category.
            </div>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const badge = getSeverityBadge(issue.severity)
            return (
              <div
                key={issue.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${badge.border}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    letterSpacing: '0.4px'
                  }}>
                    {badge.label}
                  </span>
                  {issue.affectedCount > 0 && (
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {issue.affectedCount} affected module{issue.affectedCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#f8fafc',
                  lineHeight: '1.4'
                }}>
                  {issue.title}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  lineHeight: '1.4',
                }}>
                  {issue.reason}
                </div>

                {/* Why it matters */}
                {issue.whyItMatters && (
                  <div style={{
                    fontSize: '10.5px',
                    color: '#cbd5e1',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    lineHeight: '1.4'
                  }}>
                    <strong style={{ color: '#e2e8f0' }}>Why it matters:</strong> {issue.whyItMatters}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const node = nodes.find(n => n.id === issue.nodeId)
                      if (node) onNodeClick?.(node)
                    }}
                    style={{
                      padding: '3px 8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '5px',
                      color: '#e2e8f0',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Inspect Node
                  </button>

                  {(issue.type === 'coupling' || (issue.affectedCount && issue.affectedCount > 1)) && onViewImpact && (
                    <button
                      onClick={() => onViewImpact(issue.nodeId)}
                      style={{
                        padding: '3px 8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        borderRadius: '5px',
                        color: '#fde047',
                        fontSize: '10.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      💥 View Impact
                    </button>
                  )}

                  {issue.type === 'cycle' && onRefactorIssue && (
                    <button
                      onClick={() => onRefactorIssue({
                        type: 'cycle',
                        source: issue.nodeId,
                        target: issue.secondaryNodeId,
                      })}
                      style={{
                        padding: '3px 8px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(168, 85, 247, 0.25))',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '5px',
                        color: '#fce7f3',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      ✨ Auto-Fix
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
