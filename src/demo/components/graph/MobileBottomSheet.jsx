/**
 * Mobile Bottom Sheet Component
 * For mobile filters and inspector panels
 */

import React from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../../styles.js'

export function MobileBottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    animation: isOpen ? 'fadeIn 200ms ease' : 'fadeOut 200ms ease'
  }

  const sheetStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80vh',
    background: DEMO_COLORS.bg.secondary,
    borderTop: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: `${DEMO_RADIUS.xl} ${DEMO_RADIUS.xl} 0 0`,
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    animation: isOpen ? 'slideUp 300ms ease' : 'slideDown 300ms ease'
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DEMO_SPACING.lg} ${DEMO_SPACING.xl}`,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary,
    margin: 0
  }

  const closeButtonStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.muted,
    fontSize: '24px',
    cursor: 'pointer',
    transition: `all ${DEMO_TRANSITIONS.fast}`
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: DEMO_SPACING.xl
  }

  const handleStyle = {
    width: '40px',
    height: '4px',
    background: DEMO_COLORS.border.DEFAULT,
    borderRadius: DEMO_RADIUS.full,
    margin: `${DEMO_SPACING.sm} auto`,
    flexShrink: 0
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sheetStyle}>
        <div style={handleStyle} />
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
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
          {children}
        </div>
      </div>
    </>
  )
}

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes slideDown {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
  `
  document.head.appendChild(style)
}
