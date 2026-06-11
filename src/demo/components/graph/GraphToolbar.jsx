import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../../styles.js'

export function GraphToolbar({ 
  onBack, 
  onSearch, 
  onFitView, 
  onReset, 
  onExport,
  searchQuery = ''
}) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: `0 ${DEMO_SPACING.xl}`,
    background: DEMO_COLORS.bg.secondary,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    flexShrink: 0
  }

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg
  }

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: 'transparent',
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.secondary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary
  }

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md
  }

  const searchContainerStyle = {
    position: 'relative'
  }

  const searchIconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: DEMO_COLORS.text.muted,
    fontSize: '14px'
  }

  const searchInputStyle = {
    width: '200px',
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md} ${DEMO_SPACING.sm} 36px`,
    background: DEMO_COLORS.bg.input,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.primary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    outline: 'none',
    transition: `border-color ${DEMO_TRANSITIONS.fast}`
  }

  const toolbarButtonStyle = {
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.tertiary,
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
    <div style={containerStyle}>
      <div style={leftSectionStyle}>
        <button 
          style={backButtonStyle}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <span style={{ color: DEMO_COLORS.border.light }}>|</span>
        <h1 style={titleStyle}>Dependency Graph</h1>
      </div>

      <div style={rightSectionStyle}>
        <div style={searchContainerStyle}>
          <span style={searchIconStyle}>🔍</span>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <button 
          style={toolbarButtonStyle}
          onClick={onFitView}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          ⊕ Fit
        </button>

        <button 
          style={toolbarButtonStyle}
          onClick={onReset}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          ⟲ Reset
        </button>

        <button 
          style={toolbarButtonStyle}
          onClick={onExport}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          ⤓ Export
        </button>
      </div>
    </div>
  )
}
