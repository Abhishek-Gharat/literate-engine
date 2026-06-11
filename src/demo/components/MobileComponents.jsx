import React, { useState, useEffect } from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from '../styles.js'

/**
 * useResponsive - Hook to handle responsive breakpoints
 */
export function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setWidth(w)
      setIsMobile(w < 640)
      setIsTablet(w >= 640 && w < 1024)
      setIsDesktop(w >= 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { width, isMobile, isTablet, isDesktop }
}

/**
 * MobileHeader - Compact header for mobile
 */
export function MobileHeader({ title, onBack, actions = [] }) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: `0 ${DEMO_SPACING.md}`,
    background: DEMO_COLORS.bg.secondary,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    position: 'sticky',
    top: 0,
    zIndex: 100
  }

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm,
    flex: 1
  }

  const backButtonStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: DEMO_COLORS.text.secondary,
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: DEMO_RADIUS.md
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    color: DEMO_COLORS.text.primary,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.sm
  }

  return (
    <header style={containerStyle}>
      <div style={leftStyle}>
        {onBack && (
          <button style={backButtonStyle} onClick={onBack}>
            ←
          </button>
        )}
        <h1 style={titleStyle}>{title}</h1>
      </div>
      <div style={rightStyle}>
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: DEMO_COLORS.text.secondary,
              fontSize: '18px',
              cursor: 'pointer',
              borderRadius: DEMO_RADIUS.md
            }}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  )
}

/**
 * StickyMobileCTA - Sticky call-to-action button for mobile
 */
export function StickyMobileCTA({ children, onClick, variant = 'primary' }) {
  const containerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    background: DEMO_COLORS.bg.primary,
    borderTop: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    zIndex: 100,
    display: 'flex',
    gap: DEMO_SPACING.md
  }

  const buttonStyles = {
    primary: {
      flex: 1,
      padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
      background: DEMO_COLORS.accent.DEFAULT,
      color: '#fff',
      border: 'none',
      borderRadius: DEMO_RADIUS.md,
      fontSize: DEMO_TYPOGRAPHY.sizes.base,
      fontWeight: DEMO_TYPOGRAPHY.weights.medium,
      cursor: 'pointer'
    },
    secondary: {
      flex: 1,
      padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
      background: 'transparent',
      border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
      borderRadius: DEMO_RADIUS.md,
      color: DEMO_COLORS.text.secondary,
      fontSize: DEMO_TYPOGRAPHY.sizes.base,
      fontWeight: DEMO_TYPOGRAPHY.weights.medium,
      cursor: 'pointer'
    }
  }

  return (
    <div style={containerStyle}>
      <button style={buttonStyles[variant]} onClick={onClick}>
        {children}
      </button>
    </div>
  )
}

/**
 * BottomSheet - Mobile bottom sheet for panels
 */
export function BottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200
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
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column'
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DEMO_SPACING.lg,
    borderBottom: `1px solid ${DEMO_COLORS.border.DEFAULT}`
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.lg,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    margin: 0
  }

  const closeButtonStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: DEMO_COLORS.text.muted,
    fontSize: '20px',
    cursor: 'pointer'
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: DEMO_SPACING.lg
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sheetStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * ResponsiveBentoGrid - Bento grid that adapts to screen size
 */
export function ResponsiveBentoGrid({ children, style = {} }) {
  const { isMobile, isTablet } = useResponsive()

  const baseStyle = {
    display: 'grid',
    gap: DEMO_SPACING.lg,
    ...style
  }

  const getGridTemplate = () => {
    if (isMobile) return { gridTemplateColumns: '1fr' }
    if (isTablet) return { gridTemplateColumns: 'repeat(2, 1fr)' }
    return { gridTemplateColumns: 'repeat(4, 1fr)' }
  }

  return (
    <div style={{ ...baseStyle, ...getGridTemplate() }}>
      {children}
    </div>
  )
}

/**
 * TouchFriendlyButton - Button with minimum 44px touch target
 */
export function TouchFriendlyButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon = null,
  fullWidth = false,
  disabled = false
}) {
  const baseStyle = {
    minHeight: '44px',
    minWidth: '44px',
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    borderRadius: DEMO_RADIUS.md,
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    fontWeight: DEMO_TYPOGRAPHY.weights.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DEMO_SPACING.sm,
    transition: `all ${DEMO_TRANSITIONS.fast}`,
    opacity: disabled ? 0.5 : 1
  }

  const variants = {
    primary: {
      ...baseStyle,
      background: DEMO_COLORS.accent.DEFAULT,
      color: '#fff',
      border: 'none'
    },
    secondary: {
      ...baseStyle,
      background: 'transparent',
      color: DEMO_COLORS.text.secondary,
      border: `1px solid ${DEMO_COLORS.border.DEFAULT}`
    },
    ghost: {
      ...baseStyle,
      background: 'transparent',
      color: DEMO_COLORS.text.secondary,
      border: 'none'
    }
  }

  const style = {
    ...variants[variant],
    ...(fullWidth && { width: '100%' })
  }

  return (
    <button style={style} onClick={onClick} disabled={disabled}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
