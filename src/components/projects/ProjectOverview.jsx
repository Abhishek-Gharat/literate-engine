import React from 'react'
import { COLORS } from '../../styles/constants'
import { computeHealthScore, scoreToGrade, getHealthColor } from '../../utils/healthScore'
import { prioritizeIssues } from '../../utils/issuePrioritizer'
import { diffRuns } from '../../utils/runDiff'
import './overview.css'

const SEVERITY_STYLE = {
  critical: { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.35)' },
  high: { label: 'HIGH', color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.35)' },
  medium: { label: 'MEDIUM', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.32)' },
  low: { label: 'LOW', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
}

/**
 * ProjectOverview - Stable Level-2 Project Home
 * 
 * Provides clear context for the currently selected project:
 * - Project metadata & run count
 * - Latest Analysis snapshot summary (files, components, health, clean/cyclic)
 * - Clear actions: Open Latest Architecture, Start New Analysis, View Runs
 * - Clean empty state when 0 runs exist
 */
function ProjectOverviewContent({
  project,
  runs = [],
  onOpenLatestArchitecture,
  onStartNewAnalysis,
  onViewRuns,
  onViewIssues,
  onOpenRun,
  onTryDemo
}) {
  const latestRun = runs.length > 0 ? runs[0] : null
  const runCount = runs.length

  // Calculate health score. The runs list endpoint does not ship the full
  // snapshot, so fall back to the score the engine already stored in `stats`
  // instead of showing a placeholder.
  const healthInfo = React.useMemo(() => {
    if (!latestRun) return null

    const stats = latestRun.stats || {}
      let score = typeof stats.healthScore === 'number' ? stats.healthScore : null
      let grade = stats.healthGrade || null
      let cyclesCount = typeof stats.cyclesFound === 'number' ? Math.round(stats.cyclesFound) : 0
      let breakdown = []

    const snapshot = latestRun.snapshot
    if (snapshot?.nodes) {
      try {
        const nodes = snapshot.nodes || []
        const cyclicEdges = snapshot.cyclicEdges || []
        const unresolvedImports = latestRun.unresolvedImports?.length || 0
        const res = computeHealthScore({ nodes, cyclicEdges, unresolvedImports })
        if (res && typeof res.score === 'number') {
          score = res.score
          grade = res.grade || scoreToGrade(res.score)
          const cyclesSignal = (res.breakdown || []).find((b) => b.id === 'cycles')
          cyclesCount = Number(cyclesSignal?.value) || 0
          breakdown = res.breakdown || []
        }
      } catch {
        // Keep the stats-derived values
      }
    }

    if (score === null) return null

    return {
      score,
      grade: grade || scoreToGrade(score),
      color: getHealthColor(score),
      cyclesCount,
      breakdown,
    }
  }, [latestRun])

  // Calculate top prioritized issues
  const topIssues = React.useMemo(() => {
    const empty = { critical: 0, high: 0, medium: 0, low: 0, total: 0, list: [] }
    if (!latestRun) return empty
    try {
      const nodes = latestRun.snapshot?.nodes || []
      const edges = latestRun.snapshot?.edges || []
      const cyclicEdges = latestRun.snapshot?.cyclicEdges || []
      const { counts, issues } = prioritizeIssues({
        nodes,
        edges,
        cyclicEdges,
        stats: latestRun.stats || {},
      })
      const list = [...(issues || [])].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      return { ...counts, list }
    } catch {
      return empty
    }
  }, [latestRun])

  const formatDate = (isoString) => {
    if (!isoString) return ''
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

  return (
    <div className="rv-overview">
      {/* ── Project Header Card ── */}
      <div className="rv-card rv-rise" style={{ gap: '18px' }}>
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="rv-btn rv-btn--primary" onClick={onStartNewAnalysis}>
              <span>⇪</span> Start New Analysis
            </button>
            {runCount > 0 && (
              <button className="rv-btn rv-btn--ghost" onClick={onViewRuns}>
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
          {formatDate(project.created_at) && (
            <div>
              <strong style={{ color: COLORS.text.secondary, fontWeight: 500 }}>Created:</strong> {formatDate(project.created_at)}
            </div>
          )}
          {formatDate(project.updated_at) && (
            <div>
              <strong style={{ color: COLORS.text.secondary, fontWeight: 500 }}>Updated:</strong> {formatDate(project.updated_at)}
            </div>
          )}
          {project.id && !project._demo && (
            <div style={{ fontFamily: 'monospace', color: COLORS.text.dark }}>
              ID: {project.id.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* ── State with Runs: Latest Analysis Snapshot Card ── */}
      {latestRun ? (
        <div className="rv-card rv-rise" style={{ background: 'rgba(15,20,32,0.85)', gap: '22px' }}>
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
                {formatDate(latestRun.createdAt) && (
                  <span style={{ fontSize: '13px', color: COLORS.text.muted }}>
                    {formatDate(latestRun.createdAt)}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: COLORS.text.primary, margin: 0 }}>
                Analysis Run #{latestRun.id.slice(0, 8)}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {onViewIssues && (
                <button
                  onClick={onViewIssues}
                  className={`rv-btn ${
                    topIssues.critical > 0
                      ? 'rv-btn--danger'
                      : topIssues.high > 0
                        ? 'rv-btn--warn'
                        : topIssues.total > 0
                          ? 'rv-btn--warn'
                          : 'rv-btn--ok'
                  }`}
                >
                  <span>{topIssues.total > 0 ? '⚠️' : '✓'}</span> View Issues ({topIssues.total})
                </button>
              )}

              <button
                className="rv-btn rv-btn--primary"
                style={{ padding: '12px 24px', fontSize: '14px' }}
                onClick={() => onOpenLatestArchitecture(latestRun)}
              >
                <span>❖</span> Open Architecture Workspace
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="rv-stat-grid">
            <div className="rv-stat">
              <span className="rv-stat__label">Files Analyzed</span>
              <span className="rv-stat__value">
                {latestRun.stats?.totalFiles ?? latestRun.snapshot?.nodes?.length ?? 0}
              </span>
              <span className="rv-stat__hint">source files parsed</span>
            </div>

            <div className="rv-stat">
              <span className="rv-stat__label">Components</span>
              <span className="rv-stat__value" style={{ color: '#10b981' }}>
                {latestRun.stats?.totalComponents ?? 0}
              </span>
              <span className="rv-stat__hint">
                {latestRun.stats?.totalHooks ?? 0} hooks · {latestRun.stats?.totalPages ?? 0} pages
              </span>
            </div>

            <div className="rv-stat">
              <span className="rv-stat__label">Dependencies</span>
              <span className="rv-stat__value" style={{ color: '#38bdf8' }}>
                {latestRun.stats?.totalEdges ?? latestRun.snapshot?.edges?.length ?? 0}
              </span>
              <span className="rv-stat__hint">
                {latestRun.stats?.cyclesFound ?? 0} circular · {latestRun.stats?.unresolvedImports ?? 0} unresolved
              </span>
            </div>

            <div className="rv-stat" style={{ borderColor: healthInfo ? `${healthInfo.color}33` : undefined }}>
              <span className="rv-stat__label">Architecture Health</span>
              {healthInfo ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
                    <span className="rv-stat__value" style={{ color: healthInfo.color }}>
                      {healthInfo.grade}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.text.secondary }}>
                      {healthInfo.score}/100
                    </span>
                  </div>
                  <div className="rv-meter">
                    <div
                      className="rv-meter__fill"
                      style={{ width: `${healthInfo.score}%`, background: healthInfo.color }}
                    />
                  </div>
                  <span className="rv-stat__hint">
                    {healthInfo.cyclesCount === 0
                      ? 'Clean DAG — no import cycles'
                      : `${healthInfo.cyclesCount} import cycle${healthInfo.cyclesCount === 1 ? '' : 's'} detected`}
                  </span>
                </>
              ) : (
                <>
                  <span className="rv-stat__value" style={{ fontSize: '18px', color: COLORS.text.secondary }}>
                    Ready
                  </span>
                  <span className="rv-stat__hint">no snapshot loaded yet</span>
                </>
              )}
            </div>
          </div>

          {/* ── Top Issues (actionable) ── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${COLORS.border.muted}`,
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Top Issues
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {topIssues.critical > 0 && (
                  <span className="rv-chip" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.14)', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                    {topIssues.critical} Critical
                  </span>
                )}
                {topIssues.high > 0 && (
                  <span className="rv-chip" style={{ color: '#f97316', background: 'rgba(249, 115, 22, 0.14)', borderColor: 'rgba(249, 115, 22, 0.35)' }}>
                    {topIssues.high} High
                  </span>
                )}
                {topIssues.medium > 0 && (
                  <span className="rv-chip" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.14)', borderColor: 'rgba(245, 158, 11, 0.32)' }}>
                    {topIssues.medium} Medium
                  </span>
                )}
                {topIssues.low > 0 && (
                  <span className="rv-chip" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {topIssues.low} Low
                  </span>
                )}
                <span style={{ fontSize: '12px', color: COLORS.text.muted }}>{topIssues.total} total</span>
              </div>
            </div>

            {topIssues.list.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '13px',
                color: '#6ee7b7'
              }}>
                <span style={{ fontSize: '15px' }}>✓</span>
                No issues found — the architecture is clean.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topIssues.list.slice(0, 4).map((issue) => {
                  const sev = SEVERITY_STYLE[issue.severity] || SEVERITY_STYLE.low
                  return (
                    <button
                      key={issue.id}
                      className="rv-issue"
                      onClick={onViewIssues}
                      title={issue.reason || issue.title}
                    >
                      <span className="rv-chip" style={{ color: sev.color, background: sev.bg, borderColor: sev.border }}>
                        {sev.label}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="rv-issue__title" style={{ display: 'block' }}>{issue.title}</span>
                        <span className="rv-issue__meta">
                          {issue.category}
                          {issue.affectedCount ? ` · ${issue.affectedCount} module${issue.affectedCount === 1 ? '' : 's'} affected` : ''}
                        </span>
                      </span>
                      <span style={{ color: COLORS.text.dark, fontSize: '14px', flexShrink: 0 }}>→</span>
                    </button>
                  )
                })}
                {topIssues.list.length > 4 && (
                  <button className="rv-link" style={{ alignSelf: 'flex-start' }} onClick={onViewIssues}>
                    View all {topIssues.total} issues →
                  </button>
                )}
              </div>
            )}
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
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Health Breakdown
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: COLORS.text.muted }}>
                    Base 100 · penalties deducted deterministically
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: healthInfo.color, fontVariantNumeric: 'tabular-nums' }}>
                    {healthInfo.score}/100
                  </span>
                </div>
              </div>

              <div className="rv-breakdown">
                {healthInfo.breakdown.map((item) => {
                  const penalty = Math.max(0, Number(item.penalty) || 0)
                  const maxPenalty = Math.max(
                    1,
                    ...healthInfo.breakdown.map((b) => Math.max(0, Number(b.penalty) || 0))
                  )
                  const statusColor = item.status === 'good' ? '#10b981' : item.status === 'warn' ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={item.id} className="rv-signal">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: COLORS.text.primary }}>
                          {item.label}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {penalty > 0 && (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: statusColor }}>
                              −{penalty} pts
                            </span>
                          )}
                          <span className="rv-chip" style={{ color: statusColor, background: `${statusColor}1f`, borderColor: `${statusColor}44` }}>
                            {item.status.toUpperCase()}
                          </span>
                        </span>
                      </div>

                      <div className="rv-meter">
                        <div
                          className="rv-meter__fill"
                          style={{
                            width: penalty > 0 ? `${Math.round((penalty / maxPenalty) * 100)}%` : '0%',
                            background: penalty > 0 ? statusColor : 'rgba(16,185,129,0.35)'
                          }}
                        />
                      </div>

                      <div style={{ fontSize: '11.5px', color: COLORS.text.muted, lineHeight: 1.45 }}>
                        <strong style={{ color: COLORS.text.secondary, fontWeight: 600 }}>{item.value}</strong>
                        {' · '}{item.detail}
                      </div>
                    </div>
                  )
                })}
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
                    <button className="rv-link" onClick={onViewRuns}>
                      All runs →
                    </button>
                  </div>
                )}
                {healthSparkline.length <= 1 && (
                  <button className="rv-link" onClick={onViewRuns}>
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
                    <div key={r.id || idx} className="rv-run">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ color: COLORS.text.muted, fontFamily: 'monospace', fontSize: '11px', flexShrink: 0 }}>
                          #{r.id.slice(0, 8)}
                        </span>
                        <span style={{ color: COLORS.text.secondary, flexShrink: 0, fontSize: '12px' }}>
                          {formatDate(r.createdAt)}
                        </span>
                        {runHealth !== null && (
                          <span className="rv-chip" style={{
                            color: getHealthColor(runHealth),
                            background: `${getHealthColor(runHealth)}18`,
                            borderColor: `${getHealthColor(runHealth)}44`
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
                        className="rv-btn rv-btn--ghost"
                        style={{ padding: '5px 12px', fontSize: '12px', flexShrink: 0 }}
                        onClick={() => onOpenRun(r)}
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="rv-btn rv-btn--primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
              onClick={onStartNewAnalysis}
            >
              <span>⇪</span> Start New Analysis
            </button>
            {onTryDemo && (
              <button
                className="rv-btn rv-btn--ghost"
                style={{ padding: '12px 20px', fontSize: '14px' }}
                onClick={onTryDemo}
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

/**
 * Wrapper — keeps the "no project" early return out of the component that
 * calls hooks. Returning early before `useMemo` would change the hook order
 * between renders and crash React when a project is selected or cleared.
 */
export default function ProjectOverview(props) {
  const { project, onTryDemo } = props

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
            className="rv-btn rv-btn--primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            onClick={onTryDemo}
          >
            ✦ Explore ShopApp Demo
          </button>
        )}
      </div>
    )
  }

  return <ProjectOverviewContent {...props} />
}
