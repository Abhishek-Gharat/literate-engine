import React from 'react'
import { COLORS, TYPOGRAPHY } from '../../styles/constants.js'

/**
 * StatBadge - Displays an elevated statistics chip with icon, color indicator, and label
 */
export default function StatBadge({ label, color, icon, isWarning }) {
  return (
    <span
      style={{
        padding: '4px 11px',
        background: `${color}14`,
        border: `1px solid ${color}35`,
        borderRadius: '999px',
        fontSize: '11.5px',
        color: color,
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: isWarning
          ? `0 0 12px ${color}35`
          : `0 2px 8px rgba(0, 0, 0, 0.25)`,
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          display: 'inline-block',
          animation: isWarning ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
        }}
      />
      {icon && <span style={{ fontSize: '12px' }}>{icon}</span>}
      <span style={{ letterSpacing: '0.2px' }}>{label}</span>
    </span>
  )
}

/**
 * StatBadgeList - Displays multiple stat badges in a row
 */
export function StatBadgeList({ items, gap = '8px' }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center', flexWrap: 'wrap' }}>
      {items.map((item, index) => (
        <StatBadge
          key={index}
          label={item.label}
          color={item.color}
          icon={item.icon}
          isWarning={item.isWarning}
        />
      ))}
    </div>
  )
}

/**
 * StatsDisplay - Renders analysis stats as badges
 */
function StatsDisplay({ stats }) {
  if (!stats) return null

  const items = [
    { label: `${stats.totalFiles} files`, color: '#38bdf8' },
    { label: `${stats.totalComponents} components`, color: '#10b981' },
    { label: `${stats.totalHooks} hooks`, color: '#f43f5e' },
    stats.cyclesFound > 0
      ? {
          label: `${stats.cyclesFound} cycle${stats.cyclesFound === 1 ? '' : 's'}`,
          color: '#f43f5e',
          icon: '⚠',
          isWarning: true,
        }
      : {
          label: 'Clean DAG',
          color: '#10b981',
          icon: '✓',
        },
  ]

  return <StatBadgeList items={items} />
}

export { StatsDisplay }
