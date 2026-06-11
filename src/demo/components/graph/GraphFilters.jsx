import React, { useState, useCallback, useMemo } from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../../styles.js'

const NODE_TYPES = [
  { id: 'page', label: 'Pages', icon: '📄', color: '#0891b2' },
  { id: 'component', label: 'Components', icon: '🧩', color: '#059669' },
  { id: 'hook', label: 'Hooks', icon: '🪝', color: '#d97706' },
  { id: 'context', label: 'Contexts', icon: '📦', color: '#7c3aed' },
  { id: 'util', label: 'Utils', icon: '🔧', color: '#64748b' },
  { id: 'config', label: 'Config', icon: '⚙', color: '#475569' },
  { id: 'root', label: 'Entry', icon: '⚡', color: '#6366f1' }
]

const DEPTH_OPTIONS = [
  { value: 'all', label: 'All levels' },
  { value: '1', label: '1 level' },
  { value: '2', label: '2 levels' },
  { value: '3', label: '3 levels' }
]

export function GraphFilters({ 
  nodes = [],
  filteredTypes = [],
  onToggleType,
  depthFilter = 'all',
  onDepthChange,
  issues = [],
  showIssues = true,
  onToggleIssues,
  isMobile = false
}) {
  const containerStyle = {
    width: '100%',
    height: '100%',
    background: DEMO_COLORS.bg.secondary,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }

  const sectionStyle = {
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const sectionTitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: `0 0 ${DEMO_SPACING.lg} 0`
  }

  const typeListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.sm
  }

  const typeItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md,
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: isActive ? DEMO_COLORS.bg.elevated : 'transparent',
    border: `1px solid ${isActive ? DEMO_COLORS.border.light : DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    cursor: 'pointer',
    transition: `all ${DEMO_TRANSITIONS.fast}`
  })

  const typeDotStyle = (color) => ({
    width: '10px',
    height: '10px',
    borderRadius: DEMO_RADIUS.full,
    background: color
  })

  const typeLabelStyle = {
    flex: 1,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary
  }

  const typeCountStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: DEMO_COLORS.text.muted,
    background: DEMO_COLORS.bg.tertiary,
    padding: `${DEMO_SPACING.xs} ${DEMO_SPACING.sm}`,
    borderRadius: DEMO_RADIUS.sm
  }

  const selectStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.bg.input,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.primary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    outline: 'none',
    cursor: 'pointer'
  }

  const issueToggleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DEMO_SPACING.md,
    cursor: 'pointer'
  }

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    borderRadius: DEMO_RADIUS.sm,
    border: `2px solid ${showIssues ? DEMO_COLORS.accent.DEFAULT : DEMO_COLORS.border.DEFAULT}`,
    background: showIssues ? DEMO_COLORS.accent.DEFAULT : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#fff',
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const issueListStyle = {
    marginTop: DEMO_SPACING.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md
  }

  const issueItemStyle = (severity) => ({
    padding: DEMO_SPACING.md,
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    borderLeft: `3px solid ${
      severity === 'error' ? DEMO_COLORS.status.error :
      severity === 'warning' ? DEMO_COLORS.status.warning :
      DEMO_COLORS.status.info
    }`
  })

  const scrollAreaStyle = {
    flex: 1,
    overflow: 'auto',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`
  }

  const typeCounts = useMemo(() => {
    const counts = {}
    NODE_TYPES.forEach(type => {
      counts[type.id] = nodes.filter(n => n.nodeType === type.id).length
    })
    return counts
  }, [nodes])

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Node Types</h3>
        <div style={typeListStyle}>
          {NODE_TYPES.map(type => {
            const isActive = !filteredTypes.includes(type.id)
            return (
              <button
                key={type.id}
                style={typeItemStyle(isActive)}
                onClick={() => onToggleType(type.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = DEMO_COLORS.bg.elevated
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={typeDotStyle(type.color)} />
                <span style={typeLabelStyle}>{type.label}</span>
                <span style={typeCountStyle}>{typeCounts[type.id] || 0}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Depth Filter</h3>
        <select 
          style={selectStyle}
          value={depthFilter}
          onChange={(e) => onDepthChange(e.target.value)}
        >
          {DEPTH_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={scrollAreaStyle}>
        <div 
          style={issueToggleStyle}
          onClick={onToggleIssues}
        >
          <span style={sectionTitleStyle}>Show Issues</span>
          <span style={checkboxStyle}>{showIssues && '✓'}</span>
        </div>

        {showIssues && issues.length > 0 && (
          <div style={issueListStyle}>
            {issues.map(issue => (
              <div key={issue.id} style={issueItemStyle(issue.severity)}>
                <div style={{
                  fontSize: DEMO_TYPOGRAPHY.sizes.sm,
                  fontWeight: DEMO_TYPOGRAPHY.weights.medium,
                  color: DEMO_COLORS.text.primary,
                  marginBottom: DEMO_SPACING.xs
                }}>
                  {issue.title}
                </div>
                <div style={{
                  fontSize: DEMO_TYPOGRAPHY.sizes.xs,
                  color: DEMO_COLORS.text.muted
                }}>
                  {issue.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
