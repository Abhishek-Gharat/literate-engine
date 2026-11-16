import React from 'react'
import { COLORS } from '../../styles/constants'
import { computeHealthScore, scoreToGrade, getHealthColor } from '../../utils/healthScore'
import { prioritizeIssues } from '../../utils/issuePrioritizer'
import { diffRuns } from '../../utils/runDiff'

/**
 * ProjectOverview - Stable Level-2 Project Home
 * 
 * Provides clear context for the currently selected project:
 * - Project metadata & run count
 * - Latest Analysis snapshot summary (files, components, health, clean/cyclic)
 * - Clear actions: Open Latest Architecture, Start New Analysis, View Runs
 * - Clean empty state when 0 runs exist
 */
export default function ProjectOverview({
  project,
  runs = [],
  onOpenLatestArchitecture,
  onStartNewAnalysis,
  onViewRuns,
  onOpenRun,
  onTryDemo
}) {
  const latestRun = runs.length > 0 ? runs[0] : null
  const runCount = runs.length

  // Calculate health score if snapshot is present
  const healthInfo = React.useMemo(() => {
    if (!latestRun) return null
    try {
      const nodes = latestRun.snapshot?.nodes || []
      const cyclicEdges = latestRun.snapshot?.cyclicEdges || []
      const unresolvedImports = latestRun.unresolvedImports?.length || 0
      const res = computeHealthScore({ nodes, cyclicEdges, unresolvedImports })
      if (!res || res.score === null) return null
      return {
        score: typeof res.score === 'number' ? res.score : 100,
        grade: res.grade || scoreToGrade(res.score),
        color: getHealthColor(res.score),
        cyclesCount: cyclicEdges.length,
        breakdown: res.breakdown || [],
      }
    } catch {
      return null
    }
  }, [latestRun])

  // Calculate top prioritized issues
  const topIssues = React.useMemo(() => {
    if (!latestRun) return { critical: 0, high: 0, medium: 0, total: 0 }
    try {
      const nodes = latestRun.snapshot?.nodes || []
      const edges = latestRun.snapshot?.edges || []
      const cyclicEdges = latestRun.snapshot?.cyclicEdges || []
      const { counts } = prioritizeIssues({
        nodes,
        edges,
        cyclicEdges,
        stats: latestRun.stats || {},
      })
      return counts
    } catch {
      return { critical: 0, high: 0, medium: 0, total: 0 }
    }
  }, [latestRun])

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  // Health sparkline for last 8 runs (newest = rightmost)
  const healthSparkline = React.useMemo(() => {
    const scores = runs
      .slice(0, 8)
      .reverse()
      .map(r => {
        const nodes = r.snapshot?.nodes || []
        const cyclicEdges = r.snapshot?.cyclicEdges || []
        const unresolvedImports = (r.unresolvedImports || []).length
        const res = computeHealthScore({ nodes, cyclicEdges, unresolvedImports })
        return typeof res?.score === 'number' ? res.score : null
      })
      .filter(s => s !== null)
    return scores
  }, [runs])

  // Compute per-run diffs (each run vs its predecessor in the list)
  const runDiffs = React.useMemo(() => {
    const diffs = {}
    for (let i = 1; i < runs.length; i++) {
      // runs[0] is newest; runs[i] is older; diff: runs[i] (base) -> runs[i-1] (next)
      const d = diffRuns(runs[i], runs[i - 1])
      if (d) diffs[runs[i - 1].id] = d
    }
    return diffs
  }, [runs])

  if (!project) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        color: COLORS.text.secondary,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: COLORS.text.primary, marginBottom: '8px' }}>
          No Project Selected
        </h2>
        <p style={{ maxWidth: '400px', fontSize: '14px', lineHeight: 1.6, color: COLORS.text.muted, marginBottom: '24px' }}>
          Select an existing project from the dropdown in the header, or create a new project to get started.
        </p>
        {onTryDemo && (
          <button
            onClick={onTryDemo}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: COLORS.primary.DEFAULT,
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ✦ Explore ShopApp Demo
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* ── Project Header Card ── */}
      <div style={{
        background: COLORS.bg.card,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: '16px',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>📂</span>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: COLORS.text.primary, margin: 0 }}>
                {project.name}
              </h1>
              {project._demo && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(99,102,241,0.2)',
                  color: COLORS.primary.light,
                  border: `1px solid ${COLORS.primary.border}`
                }}>
                  DEMO PROJECT
                </span>
              )}
            </div>
            <p style={{ fontSize: '14px', color: COLORS.text.secondary, margin: 0, lineHeight: 1.5 }}>
              {project.description || 'React application architecture repository.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={onStartNewAnalysis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: COLORS.primary.DEFAULT,
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>⇪</span> Start New Analysis
            </button>
            {runCount > 0 && (
              <button
                onClick={onViewRuns}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  color: COLORS.text.primary,
                  border: `1px solid ${COLORS.border.light}`,
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span>🕘</span> Runs History ({runCount})
              </button>
            )}
          </div>
        </div>

        {/* Project Metadata Chips */}
        <div style={{
          display: 'flex',
          gap: '20px',
          paddingTop: '16px',
          borderTop: `1px solid ${COLORS.border.muted}`,
          fontSize: '12px',
          color: COLORS.text.muted,
          flexWrap: 'wrap'
        }}>
          <div>
            <strong style={{ color: COLORS.text.secondary, fontWeight: 500 }}>Total Analyses:</strong> {runCount} {runCount === 1 ? 'run' : 'runs'}
          </div>
          <div>
            <strong style={{ color: COLORS.text.secondary, fontWeight: 500 }}>Created:</strong> {formatDate(project.created_at)}
          </div>
          <div>
            <strong style={{ color: COLORS.text.secondary, fontWeight: 500 }}>Updated:</strong> {formatDate(project.updated_at)}
          </div>
          {project.id && !project._demo && (
            <div style={{ fontFamily: 'monospace', color: COLORS.text.dark }}>
              ID: {project.id.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* ── State with Runs: Latest Analysis Snapshot Card ── */}
      {latestRun ? (
        <div style={{
          background: 'rgba(15,20,32,0.85)',
          border: `1px solid ${COLORS.border.DEFAULT}`,
          borderRadius: '16px',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16,185,129,0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)'
                }}>
                  Latest Snapshot
                </span>
                <span style={{ fontSize: '13px', color: COLORS.text.muted }}>
                  {formatDate(latestRun.createdAt)}
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: COLORS.text.primary, margin: 0 }}>
                Analysis Run #{latestRun.id.slice(0, 8)}
              </h2>
            </div>

            <button
              onClick={() => onOpenLatestArchitecture(latestRun)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>❖</span> Open Architecture Workspace
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px', color: COLORS.text.muted, fontWeight: 500 }}>Files Analyzed</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: COLORS.text.primary }}>
                {latestRun.stats?.totalFiles ?? latestRun.snapshot?.nodes?.length ?? 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px', color: COLORS.text.muted, fontWeight: 500 }}>Components</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                {latestRun.stats?.totalComponents ?? 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px', color: COLORS.text.muted, fontWeight: 500 }}>Dependencies</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>
                {latestRun.stats?.totalEdges ?? latestRun.snapshot?.edges?.length ?? 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px', color: COLORS.text.muted, fontWeight: 500 }}>Architecture Health</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {healthInfo ? (
                  <>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: healthInfo.color
                    }}>
                      {healthInfo.grade}
                    </span>
                    <span style={{ fontSize: '13px', color: COLORS.text.secondary }}>
                      ({healthInfo.score}/100)
                    </span>
                    {healthInfo.cyclesCount === 0 ? (
                      <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Clean DAG
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {healthInfo.cyclesCount} cycles
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: '14px', color: COLORS.text.secondary }}>Ready</span>
                )}
              </div>
            </div>

            {/* Top Issues Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px', color: COLORS.text.muted, fontWeight: 500 }}>Top Issues</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {topIssues.total === 0 ? (
                  <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                    ✓ 0 Issues Found
                  </span>
                ) : (
                  <>
                    {topIssues.critical > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {topIssues.critical} Critical
                      </span>
                    )}
                    {topIssues.high > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#f97316',
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.35)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {topIssues.high} High
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: COLORS.text.muted }}>
                      ({topIssues.total} total)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Explainable Health Score Signals Breakdown */}
          {healthInfo && healthInfo.breakdown?.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${COLORS.border.muted}`,
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Architecture Health Breakdown (Explainable Signals)
                </span>
                <span style={{ fontSize: '11px', color: COLORS.text.muted }}>
                  Base: 100 · Penalties deducted deterministically
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {healthInfo.breakdown.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.text.primary }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: item.status === 'good' ? '#10b981' : item.status === 'warn' ? '#f59e0b' : '#ef4444'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: COLORS.text.muted }}>
                      Value: <strong style={{ color: COLORS.text.secondary }}>{item.value}</strong> · {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run History Timeline with Health Sparkline + Diffs */}
          {runs.length > 1 && (
            <div style={{
              paddingTop: '20px',
              borderTop: `1px solid ${COLORS.border.muted}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.text.secondary }}>
                  Run History ({runs.length} total)
                </span>
                {/* Health Sparkline */}
                {healthSparkline.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: COLORS.text.muted }}>Health trend</span>
                    <svg width={healthSparkline.length * 14} height={28} style={{ overflow: 'visible' }}>
                      {healthSparkline.map((score, i) => {
                        const x = i * 14 + 4
                        const y = 24 - Math.round((score / 100) * 20)
                        const color = getHealthColor(score)
                        return (
                          <g key={i}>
                            {i > 0 && (
                              <line
                                x1={(i - 1) * 14 + 4} y1={24 - Math.round((healthSparkline[i - 1] / 100) * 20)}
                                x2={x} y2={y}
                                stroke={color} strokeWidth={1.5} strokeOpacity={0.6}
                              />
                            )}
                            <circle cx={x} cy={y} r={3} fill={color} fillOpacity={0.9} />
                          </g>
                        )
                      })}
                    </svg>
                    <button
                      onClick={onViewRuns}
                      style={{ background: 'none', border: 'none', color: COLORS.primary.DEFAULT, fontSize: '12px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                    >
                      All runs →
                    </button>
                  </div>
                )}
                {healthSparkline.length <= 1 && (
                  <button
                    onClick={onViewRuns}
                    style={{ background: 'none', border: 'none', color: COLORS.primary.DEFAULT, fontSize: '12px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                  >
                    View full history →
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {runs.slice(1, 5).map((r, idx) => {
                  const runHealth = (() => {
                    const nodes = r.snapshot?.nodes || []
                    const cyclicEdges = r.snapshot?.cyclicEdges || []
                    const res = computeHealthScore({ nodes, cyclicEdges, unresolvedImports: (r.unresolvedImports || []).length })
                    return res?.score ?? null
                  })()
                  const diff = runDiffs[r.id]
                  return (
                    <div
                      key={r.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${COLORS.border.muted}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ color: COLORS.text.muted, fontFamily: 'monospace', fontSize: '11px', flexShrink: 0 }}>
                          #{r.id.slice(0, 8)}
                        </span>
                        <span style={{ color: COLORS.text.secondary, flexShrink: 0, fontSize: '12px' }}>
                          {formatDate(r.createdAt)}
                        </span>
                        {runHealth !== null && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: getHealthColor(runHealth),
                            background: `${getHealthColor(runHealth)}18`,
                            border: `1px solid ${getHealthColor(runHealth)}44`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}>
                            {runHealth}/100
                          </span>
                        )}
                        {/* Diff badge vs previous run */}
                        {diff && diff.summary !== 'No structural changes' && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: diff.hasRegressions ? '#ef4444' : diff.hasImprovements ? '#10b981' : '#94a3b8',
                            background: diff.hasRegressions ? 'rgba(239,68,68,0.1)' : diff.hasImprovements ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${diff.hasRegressions ? 'rgba(239,68,68,0.3)' : diff.hasImprovements ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={diff.summary}>
                            {diff.summary}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenRun(r)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.06)',
                          border: `1px solid ${COLORS.border.DEFAULT}`,
                          color: COLORS.text.primary,
                          fontSize: '12px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Open →
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── State with 0 Runs: Clean Empty Project State ── */
        <div style={{
          background: 'rgba(15,20,32,0.6)',
          border: `1px dashed ${COLORS.border.light}`,
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '40px' }}>⚡</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: COLORS.text.primary, margin: 0 }}>
            No analyses yet for {project.name}
          </h2>
          <p style={{
            maxWidth: '460px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: COLORS.text.secondary,
            margin: 0
          }}>
            Analyze your project's React code to generate its first interactive dependency DAG, component tree, and architectural health metrics.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={onStartNewAnalysis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                background: COLORS.primary.DEFAULT,
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
              }}
            >
              <span>⇪</span> Start New Analysis
            </button>
            {onTryDemo && (
              <button
                onClick={onTryDemo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  color: COLORS.text.secondary,
                  border: `1px solid ${COLORS.border.DEFAULT}`,
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <span>✦</span> Explore Demo Sandbox
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
