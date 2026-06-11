import React, { useState } from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../styles.js'

/**
 * BentoCard - Reusable card component for bento grid layout
 */
export function BentoCard({ 
  children, 
  title, 
  icon, 
  className = '',
  style = {},
  headerAction = null
}) {
  const containerStyle = {
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.xl,
    padding: DEMO_SPACING.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.lg,
    transition: `border-color ${DEMO_TRANSITIONS.fast}, transform ${DEMO_TRANSITIONS.fast}`,
    ...style
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DEMO_SPACING.md
  }

  const titleSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md
  }

  const iconStyle = {
    width: '32px',
    height: '32px',
    borderRadius: DEMO_RADIUS.md,
    background: DEMO_COLORS.bg.elevated,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary,
    margin: 0
  }

  const contentStyle = {
    flex: 1,
    minHeight: 0
  }

  return (
    <div 
      style={containerStyle}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = DEMO_COLORS.border.light
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
      }}
    >
      <div style={headerStyle}>
        <div style={titleSectionStyle}>
          {icon && <div style={iconStyle}>{icon}</div>}
          <h3 style={titleStyle}>{title}</h3>
        </div>
        {headerAction}
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  )
}

/**
 * AISummaryCard - AI-generated project summary card
 */
export function AISummaryCard({ summary, onExplain }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const containerStyle = {
    gridColumn: 'span 2',
    gridRow: 'span 2'
  }

  const descriptionStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.md,
    color: DEMO_COLORS.text.secondary,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.relaxed,
    margin: `0 0 ${DEMO_SPACING.lg} 0`
  }

  const keyPointsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md
  }

  const pointStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: DEMO_SPACING.md
  }

  const bulletStyle = {
    width: '6px',
    height: '6px',
    borderRadius: DEMO_RADIUS.full,
    background: DEMO_COLORS.accent.DEFAULT,
    marginTop: '8px',
    flexShrink: 0
  }

  const pointTextStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    color: DEMO_COLORS.text.secondary,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.relaxed
  }

  const buttonStyle = {
    marginTop: 'auto',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.accent.muted,
    border: `1px solid ${DEMO_COLORS.accent.DEFAULT}44`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.accent.light,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`,
    alignSelf: 'flex-start'
  }

  return (
    <BentoCard 
      title="AI Summary" 
      icon="🤖"
      style={containerStyle}
    >
      <p style={descriptionStyle}>
        {summary.description}
      </p>
      
      <div style={keyPointsStyle}>
        {summary.keyPoints.map((point, index) => (
          <div key={index} style={pointStyle}>
            <span style={bulletStyle} />
            <span style={pointTextStyle}>{point}</span>
          </div>
        ))}
      </div>

      <button 
        style={buttonStyle}
        onClick={onExplain}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${DEMO_COLORS.accent.DEFAULT}33`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = DEMO_COLORS.accent.muted
        }}
      >
        <span>💬</span>
        Explain this project
      </button>
    </BentoCard>
  )
}

/**
 * FindingsCard - Interesting findings from analysis
 */
export function FindingsCard({ findings }) {
  const getIconForType = (type) => {
    switch (type) {
      case 'positive': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✗'
      case 'suggestion': return '💡'
      default: return 'ℹ'
    }
  }

  const getColorForType = (type) => {
    switch (type) {
      case 'positive': return DEMO_COLORS.status.success
      case 'warning': return DEMO_COLORS.status.warning
      case 'error': return DEMO_COLORS.status.error
      case 'suggestion': return DEMO_COLORS.status.info
      default: return DEMO_COLORS.accent.DEFAULT
    }
  }

  const findingsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md
  }

  const findingStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: DEMO_SPACING.md,
    padding: DEMO_SPACING.md,
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    transition: `background ${DEMO_TRANSITIONS.fast}`
  }

  const iconContainerStyle = (type) => ({
    width: '24px',
    height: '24px',
    borderRadius: DEMO_RADIUS.sm,
    background: `${getColorForType(type)}22`,
    color: getColorForType(type),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    flexShrink: 0
  })

  const findingContentStyle = {
    flex: 1,
    minWidth: 0
  }

  const findingTitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    color: DEMO_COLORS.text.primary,
    margin: `0 0 ${DEMO_SPACING.xs} 0`
  }

  const findingDescStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.muted,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.normal,
    margin: 0
  }

  return (
    <BentoCard 
      title="Interesting Findings" 
      icon="🔍"
      style={{ gridColumn: 'span 2' }}
    >
      <div style={findingsStyle}>
        {findings.slice(0, 4).map((finding) => (
          <div 
            key={finding.id} 
            style={findingStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = DEMO_COLORS.bg.tertiary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = DEMO_COLORS.bg.elevated
            }}
          >
            <div style={iconContainerStyle(finding.type)}>
              {getIconForType(finding.type)}
            </div>
            <div style={findingContentStyle}>
              <h4 style={findingTitleStyle}>{finding.title}</h4>
              <p style={findingDescStyle}>{finding.description}</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

/**
 * ArchitectureSnapshotCard - Quick architecture metrics
 */
export function ArchitectureSnapshotCard({ snapshot }) {
  const containerStyle = {
    gridColumn: 'span 1'
  }

  const sectionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.xl
  }

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.sm
  }

  const sectionLabelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: DEMO_COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: DEMO_TYPOGRAPHY.weights.medium
  }

  const entryPointStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary
  }

  const connectedComponentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.xs
  }

  const componentNameStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.md,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary
  }

  const connectionCountStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.accent.light
  }

  const categoriesStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.sm
  }

  const categoryRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DEMO_SPACING.md
  }

  const categoryLabelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary
  }

  const categoryBarStyle = {
    flex: 1,
    height: '4px',
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.full,
    overflow: 'hidden'
  }

  const categoryFillStyle = (percentage) => ({
    height: '100%',
    width: `${percentage}%`,
    background: DEMO_COLORS.accent.DEFAULT,
    borderRadius: DEMO_RADIUS.full
  })

  const categoryValueStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary,
    minWidth: '24px',
    textAlign: 'right'
  }

  return (
    <BentoCard 
      title="Architecture Snapshot" 
      icon="🏗"
      style={containerStyle}
    >
      <div style={sectionsStyle}>
        <div style={sectionStyle}>
          <span style={sectionLabelStyle}>Entry Point</span>
          <div style={entryPointStyle}>
            <span>⚡</span>
            <span>{snapshot.entryPoints[0]?.path}</span>
          </div>
        </div>

        <div style={sectionStyle}>
          <span style={sectionLabelStyle}>Most Connected</span>
          <div style={connectedComponentStyle}>
            <span style={componentNameStyle}>
              {snapshot.mostConnectedComponent.name}
            </span>
            <span style={connectionCountStyle}>
              {snapshot.mostConnectedComponent.connectionCount} connections
            </span>
          </div>
        </div>

        <div style={sectionStyle}>
          <span style={sectionLabelStyle}>File Categories</span>
          <div style={categoriesStyle}>
            {snapshot.fileCategories.map((cat) => (
              <div key={cat.category} style={categoryRowStyle}>
                <span style={categoryLabelStyle}>{cat.category}</span>
                <div style={categoryBarStyle}>
                  <div style={categoryFillStyle(cat.percentage)} />
                </div>
                <span style={categoryValueStyle}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}

/**
 * NextActionCard - Primary CTA card for next step
 */
export function NextActionCard({ onOpenGraph, onInspect, onViewEntryPoints }) {
  const containerStyle = {
    gridColumn: 'span 1',
    background: `linear-gradient(145deg, ${DEMO_COLORS.bg.card}, ${DEMO_COLORS.accent.muted})`
  }

  const primaryButtonStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    background: DEMO_COLORS.accent.DEFAULT,
    color: '#fff',
    border: 'none',
    borderRadius: DEMO_RADIUS.md,
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`,
    marginBottom: DEMO_SPACING.lg
  }

  const secondaryActionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.sm
  }

  const secondaryButtonStyle = {
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: 'transparent',
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.secondary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  return (
    <BentoCard 
      title="Next Actions" 
      icon="▶"
      style={containerStyle}
    >
      <button 
        style={primaryButtonStyle}
        onClick={onOpenGraph}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = DEMO_COLORS.accent.dark
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = DEMO_COLORS.accent.DEFAULT
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <span>🌐</span>
        Open Graph
      </button>

      <div style={secondaryActionsStyle}>
        <button 
          style={secondaryButtonStyle}
          onClick={onInspect}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>🔍</span>
          Inspect Key Components
        </button>
        <button 
          style={secondaryButtonStyle}
          onClick={onViewEntryPoints}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>⚡</span>
          View Entry Points
        </button>
      </div>
    </BentoCard>
  )
}
