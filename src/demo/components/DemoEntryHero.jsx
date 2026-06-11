import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_SHADOWS,
  DEMO_TRANSITIONS 
} from '../styles.js'

/**
 * DemoEntryHero - Landing screen for the demo experience
 * Clean, focused entry point that explains value before showing graph
 */
export function DemoEntryHero({ onTryDemo, onUpload, onBack }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: DEMO_COLORS.bg.primary,
    color: DEMO_COLORS.text.primary,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.sans
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    padding: `0 ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md
  }

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    background: `linear-gradient(135deg, ${DEMO_COLORS.accent.DEFAULT}, ${DEMO_COLORS.accent.dark})`,
    borderRadius: DEMO_RADIUS.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  }

  const logoTextStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    fontWeight: DEMO_TYPOGRAPHY.weights.bold
  }

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DEMO_SPACING['3xl'],
    maxWidth: '720px',
    margin: '0 auto',
    textAlign: 'center'
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.accent.muted,
    border: `1px solid ${DEMO_COLORS.accent.DEFAULT}33`,
    borderRadius: DEMO_RADIUS.full,
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: DEMO_COLORS.accent.light,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    marginBottom: DEMO_SPACING.xl
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes['5xl'],
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.tight,
    margin: `0 0 ${DEMO_SPACING.xl} 0`,
    background: `linear-gradient(135deg, ${DEMO_COLORS.text.primary}, ${DEMO_COLORS.text.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }

  const descriptionStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    color: DEMO_COLORS.text.secondary,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.relaxed,
    margin: `0 0 ${DEMO_SPACING['2xl']} 0`,
    maxWidth: '560px'
  }

  const actionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md,
    alignItems: 'center',
    width: '100%',
    maxWidth: '360px'
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
    transition: `all ${DEMO_TRANSITIONS.fast}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    ':hover': {
      background: DEMO_COLORS.accent.dark,
      transform: 'translateY(-1px)'
    }
  }

  const secondaryButtonStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    background: 'transparent',
    color: DEMO_COLORS.text.secondary,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    transition: `all ${DEMO_TRANSITIONS.fast}`,
    ':hover': {
      borderColor: DEMO_COLORS.border.light,
      color: DEMO_COLORS.text.primary
    }
  }

  const noteStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.muted,
    marginTop: DEMO_SPACING.lg
  }

  // Preview strip showing simplified UI
  const previewStyle = {
    marginTop: DEMO_SPACING['3xl'],
    padding: DEMO_SPACING.xl,
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.xl,
    width: '100%',
    maxWidth: '600px'
  }

  const previewHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.md,
    marginBottom: DEMO_SPACING.lg,
    paddingBottom: DEMO_SPACING.lg,
    borderBottom: `1px solid ${DEMO_COLORS.border.subtle}`
  }

  const previewDotStyle = {
    width: '12px',
    height: '12px',
    borderRadius: DEMO_RADIUS.full,
    background: DEMO_COLORS.text.muted
  }

  const previewContentStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: DEMO_SPACING.md
  }

  const previewCardStyle = {
    height: '60px',
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: DEMO_COLORS.text.muted
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>⚡</div>
          <span style={logoTextStyle}>ReactViz</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: DEMO_SPACING.md }}>
          <button
            onClick={onBack}
            style={{
              padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
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
            }}
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
            Back
          </button>
          <a 
            href="#" 
            style={{
              fontSize: DEMO_TYPOGRAPHY.sizes.sm,
              color: DEMO_COLORS.text.secondary,
              textDecoration: 'none',
              ':hover': { color: DEMO_COLORS.text.primary }
            }}
          >
            Documentation
          </a>
        </div>
      </header>

      <main style={mainStyle}>
        <div style={badgeStyle}>
          <span>🚀</span>
          <span>Try the demo — no setup required</span>
        </div>

        <h1 style={titleStyle}>
          Understand your React architecture visually
        </h1>

        <p style={descriptionStyle}>
          ReactViz analyzes your React codebase to reveal component relationships, 
          detect circular dependencies, and explain your architecture with AI-powered insights.
        </p>

        <div style={actionsStyle}>
          <button 
            style={primaryButtonStyle}
            onClick={onTryDemo}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = DEMO_COLORS.accent.dark
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = DEMO_COLORS.accent.DEFAULT
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>▶</span>
            Try Demo Project
          </button>

          <button 
            style={secondaryButtonStyle}
            onClick={onUpload}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DEMO_COLORS.border.light
              e.currentTarget.style.color = DEMO_COLORS.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
              e.currentTarget.style.color = DEMO_COLORS.text.secondary
            }}
          >
            Upload Your Project
          </button>
        </div>

        <p style={noteStyle}>
          No setup needed for demo • Works with React/Next.js projects
        </p>

        {/* Preview strip */}
        <div style={previewStyle}>
          <div style={previewHeaderStyle}>
            <span style={previewDotStyle} />
            <span style={previewDotStyle} />
            <span style={previewDotStyle} />
          </div>
          <div style={previewContentStyle}>
            <div style={previewCardStyle}>AI Summary</div>
            <div style={previewCardStyle}>Dependency Graph</div>
            <div style={previewCardStyle}>Architecture View</div>
          </div>
        </div>
      </main>
    </div>
  )
}
