import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../../styles.js'

const NODE_TYPE_CONFIG = {
  page: { icon: '📄', label: 'Page', color: '#0891b2' },
  component: { icon: '🧩', label: 'Component', color: '#059669' },
  hook: { icon: '🪝', label: 'Hook', color: '#d97706' },
  context: { icon: '📦', label: 'Context', color: '#7c3aed' },
  util: { icon: '🔧', label: 'Util', color: '#64748b' },
  config: { icon: '⚙', label: 'Config', color: '#475569' },
  root: { icon: '⚡', label: 'Entry', color: '#6366f1' }
}

export function NodeInspector({ 
  node, 
  onClose,
  onViewCode,
  onTracePath,
  onAskAI,
  onShowDependencies
}) {
  if (!node) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DEMO_SPACING.xl,
        background: DEMO_COLORS.bg.secondary
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: DEMO_SPACING.lg,
          opacity: 0.3
        }}>📊</div>
        <div style={{
          fontSize: DEMO_TYPOGRAPHY.sizes.lg,
          color: DEMO_COLORS.text.secondary,
          marginBottom: DEMO_SPACING.sm
        }}>
          Select a node
        </div>
        <div style={{
          fontSize: DEMO_TYPOGRAPHY.sizes.sm,
          color: DEMO_COLORS.text.muted,
          textAlign: 'center'
        }}>
          Click on any node in the graph to view its details
        </div>
      </div>
    )
  }

  const config = NODE_TYPE_CONFIG[node.nodeType] || NODE_TYPE_CONFIG.component

  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: DEMO_COLORS.bg.secondary
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const typeBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.xs} ${DEMO_SPACING.sm}`,
    background: `${config.color}22`,
    border: `1px solid ${config.color}44`,
    borderRadius: DEMO_RADIUS.sm,
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: config.color,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const closeButtonStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.muted,
    fontSize: '20px',
    cursor: 'pointer',
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`
  }

  const nodeNameStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.xl,
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    color: DEMO_COLORS.text.primary,
    wordBreak: 'break-word',
    marginBottom: DEMO_SPACING.xl
  }

  const sectionStyle = {
    marginBottom: DEMO_SPACING.xl
  }

  const sectionTitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: `0 0 ${DEMO_SPACING.md} 0`
  }

  const metricRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DEMO_SPACING.md} 0`,
    borderBottom: `1px solid ${DEMO_COLORS.border.subtle}`
  }

  const metricLabelStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary
  }

  const metricValueStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary
  }

  const filePathStyle = {
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary,
    marginBottom: DEMO_SPACING.xl
  }

  const importsSectionStyle = {
    marginBottom: DEMO_SPACING.xl
  }

  const importItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    padding: `${DEMO_SPACING.sm} ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.md,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.mono,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    color: DEMO_COLORS.text.secondary,
    marginBottom: DEMO_SPACING.sm
  }

  const actionsStyle = {
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    borderTop: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.md
  }

  const primaryButtonStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.accent.DEFAULT,
    border: 'none',
    borderRadius: DEMO_RADIUS.md,
    color: '#fff',
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const secondaryButtonStyle = {
    width: '100%',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: 'transparent',
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.secondary,
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={typeBadgeStyle}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <button 
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = DEMO_COLORS.bg.elevated
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = DEMO_COLORS.text.muted
          }}
        >
          ×
        </button>
      </div>

      <div style={contentStyle}>
        <div style={filePathStyle}>
          {node.filePath}
        </div>

        <h2 style={nodeNameStyle}>{node.label}</h2>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Metrics</h3>
          
          <div style={metricRowStyle}>
            <span style={metricLabelStyle}>Imports</span>
            <span style={metricValueStyle}>{node.imports?.length || 0}</span>
          </div>
          
          <div style={metricRowStyle}>
            <span style={metricLabelStyle}>Used By</span>
            <span style={metricValueStyle}>{node.importedBy?.length || 0}</span>
          </div>
          
          <div style={metricRowStyle}>
            <span style={metricLabelStyle}>Entry Point</span>
            <span style={metricValueStyle}>
              {node.isEntryPoint ? (
                <span style={{ color: DEMO_COLORS.status.success }}>Yes</span>
              ) : (
                <span style={{ color: DEMO_COLORS.text.muted }}>No</span>
              )}
            </span>
          </div>
        </div>

        {node.imports && node.imports.length > 0 && (
          <div style={importsSectionStyle}>
            <h3 style={sectionTitleStyle}>Imports</h3>
            {node.imports.map((imp, i) => (
              <div key={i} style={importItemStyle}>
                <span style={{ color: DEMO_COLORS.accent.DEFAULT }}>→</span>
                {imp}
              </div>
            ))}
          </div>
        )}

        {node.importedBy && node.importedBy.length > 0 && (
          <div style={importsSectionStyle}>
            <h3 style={sectionTitleStyle}>Used By</h3>
            {node.importedBy.map((imp, i) => (
              <div key={i} style={importItemStyle}>
                <span style={{ color: DEMO_COLORS.status.success }}>←</span>
                {imp}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={actionsStyle}>
        <button 
          style={primaryButtonStyle}
          onClick={onAskAI}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = DEMO_COLORS.accent.dark
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = DEMO_COLORS.accent.DEFAULT
          }}
        >
          <span>💬</span>
          Ask AI about this file
        </button>

        <button 
          style={secondaryButtonStyle}
          onClick={onTracePath}
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
          Trace Path
        </button>

        <button 
          style={secondaryButtonStyle}
          onClick={onViewCode}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>📄</span>
          View Code
        </button>
      </div>
    </div>
  )
}
