import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../styles.js'

/**
 * StatCard - Simple stat display for the overview row
 */
export function StatCard({ label, value, icon, color = DEMO_COLORS.accent.DEFAULT }) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg,
    padding: DEMO_SPACING.lg,
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.lg,
    transition: `border-color ${DEMO_TRANSITIONS.fast}`
  }

  const iconStyle = {
    width: '44px',
    height: '44px',
    borderRadius: DEMO_RADIUS.md,
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color
  }

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.xs
  }

  const valueStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes['2xl'],
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    color: DEMO_COLORS.text.primary,
    lineHeight: 1
  }

  const labelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  return (
    <div 
      style={containerStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = DEMO_COLORS.border.light
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
      }}
    >
      <div style={iconStyle}>{icon}</div>
      <div style={contentStyle}>
        <span style={valueStyle}>{value}</span>
        <span style={labelStyle}>{label}</span>
      </div>
    </div>
  )
}

/**
 * OverviewStatsRow - Top stats row for the demo overview
 */
export function OverviewStatsRow({ stats }) {
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: DEMO_SPACING.lg,
    marginBottom: DEMO_SPACING['2xl']
  }

  const statItems = [
    { label: 'Components', value: stats.totalComponents, icon: '🧩', color: DEMO_COLORS.node.component },
    { label: 'Pages', value: stats.totalPages, icon: '📄', color: DEMO_COLORS.node.page },
    { label: 'Hooks', value: stats.totalHooks, icon: '🪝', color: DEMO_COLORS.node.hook },
    { label: 'Contexts', value: stats.totalContexts, icon: '📦', color: DEMO_COLORS.node.context },
    { label: 'Entry Point', value: stats.entryPoint, icon: '⚡', color: DEMO_COLORS.node.root, isText: true }
  ]

  return (
    <div style={containerStyle}>
      {statItems.map((item) => (
        item.isText ? (
          <StatCardWithText key={item.label} {...item} />
        ) : (
          <StatCard key={item.label} {...item} />
        )
      ))}
    </div>
  )
}

function StatCardWithText({ label, value, icon, color }) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg,
    padding: DEMO_SPACING.lg,
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.lg
  }

  const iconStyle = {
    width: '44px',
    height: '44px',
    borderRadius: DEMO_RADIUS.md,
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color,
    flexShrink: 0
  }

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.xs,
    minWidth: 0
  }

  const valueStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    color: DEMO_COLORS.text.primary,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }

  const labelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
      <div style={contentStyle}>
        <span style={valueStyle} title={value}>{value}</span>
        <span style={labelStyle}>{label}</span>
      </div>
    </div>
  )
}
