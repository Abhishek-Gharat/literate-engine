import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../styles.js'
import { OverviewStatsRow } from './OverviewStatsRow.jsx'
import { 
  AISummaryCard, 
  FindingsCard, 
  ArchitectureSnapshotCard, 
  NextActionCard 
} from './BentoCards.jsx'

/**
 * DemoProjectOverview - Main overview screen with bento grid layout
 * Shows AI Summary, Findings, Architecture Snapshot, and Next Actions
 */
export function DemoProjectOverview({ 
  summary,
  findings,
  snapshot,
  stats,
  onOpenGraph,
  onExplainProject,
  onInspect,
  onViewEntryPoints,
  onBackToApp
}) {
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
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    background: DEMO_COLORS.bg.secondary
  }

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg
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

  const breadcrumbStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm
  }

  const separatorStyle = {
    color: DEMO_COLORS.text.muted
  }

  const mainStyle = {
    flex: 1,
    padding: DEMO_SPACING['3xl'],
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  }

  const titleSectionStyle = {
    marginBottom: DEMO_SPACING['2xl']
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes['3xl'],
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    margin: `0 0 ${DEMO_SPACING.md} 0`
  }

  const subtitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    color: DEMO_COLORS.text.secondary,
    margin: 0
  }

  const bentoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: 'minmax(120px, auto)',
    gap: DEMO_SPACING.lg
  }

  // Responsive: 2 columns on tablet, 1 on mobile
  const responsiveStyle = `
    @media (max-width: 1024px) {
      .bento-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      [data-grid-span="2"] {
        grid-column: span 2 !important;
      }
    }
    @media (max-width: 640px) {
      .bento-grid {
        grid-template-columns: 1fr !important;
      }
      [data-grid-span="2"] {
        grid-column: span 1 !important;
      }
      [data-grid-span="1"] {
        grid-column: span 1 !important;
      }
    }
  `

  return (
    <div style={containerStyle}>
      <style>{responsiveStyle}</style>
      
      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={logoStyle}>
            <div style={logoIconStyle}>⚡</div>
            <span style={logoTextStyle}>ReactViz</span>
          </div>
          <div style={breadcrumbStyle}>
            <span>Demo</span>
            <span style={separatorStyle}>/</span>
            <span style={{ color: DEMO_COLORS.text.primary }}>Overview</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: DEMO_SPACING.md }}>
          <button 
            onClick={onBackToApp}
            style={{
              padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
              background: 'transparent',
              border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
              borderRadius: DEMO_RADIUS.md,
              color: DEMO_COLORS.text.secondary,
              fontSize: DEMO_TYPOGRAPHY.sizes.sm,
              cursor: 'pointer',
              transition: `all ${DEMO_TRANSITIONS.fast}`,
              display: 'flex',
              alignItems: 'center',
              gap: DEMO_SPACING.sm
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
          <button 
            style={{
              padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
              background: 'transparent',
              border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
              borderRadius: DEMO_RADIUS.md,
              color: DEMO_COLORS.text.secondary,
              fontSize: DEMO_TYPOGRAPHY.sizes.sm,
              cursor: 'pointer',
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
            Help
          </button>
        </div>
      </header>

      <main style={mainStyle}>
        <div style={titleSectionStyle}>
          <h1 style={titleStyle}>Demo Project Loaded</h1>
          <p style={subtitleStyle}>
            E-commerce React demo with shared state and multi-page flow
          </p>
        </div>

        <OverviewStatsRow stats={stats} />

        <div className="bento-grid" style={bentoGridStyle}>
          <AISummaryCard 
            summary={summary} 
            onExplain={onExplainProject}
          />
          
          <FindingsCard findings={findings} />
          
          <ArchitectureSnapshotCard snapshot={snapshot} />
          
          <NextActionCard 
            onOpenGraph={onOpenGraph}
            onInspect={onInspect}
            onViewEntryPoints={onViewEntryPoints}
          />
        </div>
      </main>
    </div>
  )
}
