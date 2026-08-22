import React, { useMemo } from 'react'
import { computeHealthScore, getHealthColor } from '../../utils/healthScore.js'

const STATUS_COLORS = {
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444'
}

/**
 * RunDetailHealth - Architecture health score section with per-metric breakdown
 *
 * @param {Object} props
 * @param {Object|null} props.run - Run object (uses snapshot when available, cached stats otherwise)
 */
export default function RunDetailHealth({ run }) {
  const health = useMemo(() => {
    const snapshot = run?.snapshot || {}
    const stats = run?.stats || {}
    const nodes = snapshot.nodes || []

    if (nodes.length > 0) {
      const computed = computeHealthScore({
        nodes,
        cyclicEdges: snapshot.cyclicEdges || [],
        unresolvedImports: (run?.unresolvedImports || []).length
      })
      if (computed.score !== null) return computed
    }

    if (typeof stats.healthScore === 'number') {
      return {
        score: stats.healthScore,
        grade: stats.healthGrade || null,
        breakdown: [],
        metrics: {}
      }
    }

    return null
  }, [run])

  if (!health) return null

  const color = getHealthColor(health.score)

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}
      >
        Architecture Health
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px',
          background: `${color}12`,
          border: `1px solid ${color}35`,
          borderRadius: '8px',
          marginBottom: health.breakdown.length > 0 ? '12px' : 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '30px', fontWeight: '700', color, lineHeight: 1 }}>
            {health.score}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 100</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              height: '6px',
              borderRadius: '999px',
              background: '#33415580',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(2, Math.min(100, health.score))}%`,
                background: color,
                borderRadius: '999px',
                transition: 'width 400ms ease'
              }}
            />
          </div>
        </div>
        {health.grade && (
          <span
            style={{
              fontSize: '13px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              color,
              border: `1px solid ${color}55`,
              background: `${color}15`
            }}
          >
            {health.grade}
          </span>
        )}
      </div>

      {health.breakdown.map((item) => (
        <div
          key={item.id}
          title={item.detail}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 2px',
            borderBottom: '1px solid #1e293b80',
            fontSize: '12px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: STATUS_COLORS[item.status] || '#94a3b8',
                flexShrink: 0
              }}
            />
            {item.label}
          </span>
          <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
