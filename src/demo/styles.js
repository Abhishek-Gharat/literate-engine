/**
 * Demo Experience Styles
 * Dark-first, modern SaaS UI design system
 */

// Color palette - Dark theme
export const DEMO_COLORS = {
  // Base
  bg: {
    primary: '#0a0a0f',
    secondary: '#111118',
    tertiary: '#1a1a24',
    card: '#13131c',
    elevated: '#1c1c28',
    input: '#0d0d12'
  },
  
  // Borders
  border: {
    DEFAULT: '#232330',
    light: '#2a2a3d',
    subtle: '#1a1a28'
  },
  
  // Text
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    dark: '#475569',
    accent: '#e2e8f0'
  },
  
  // Accent - Single color for consistency
  accent: {
    DEFAULT: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    muted: '#6366f122'
  },
  
  // Status
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  
  // Node types
  node: {
    page: '#0891b2',
    component: '#059669',
    hook: '#d97706',
    context: '#7c3aed',
    util: '#64748b',
    config: '#475569',
    root: '#6366f1'
  }
}

// Spacing scale (4px base)
export const DEMO_SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px'
}

// Typography
export const DEMO_TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace'
  },
  
  sizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px'
  },
  
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
}

// Border radius
export const DEMO_RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px'
}

// Shadows (subtle, not neon)
export const DEMO_SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
}

// Transitions
export const DEMO_TRANSITIONS = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease'
}

// Layout
export const DEMO_LAYOUT = {
  maxWidth: '1440px',
  sidebarWidth: '240px',
  headerHeight: '64px',
  contentMaxWidth: '1200px'
}

// Common style objects
export const demoStyles = {
  page: {
    minHeight: '100vh',
    background: DEMO_COLORS.bg.primary,
    color: DEMO_COLORS.text.primary,
    fontFamily: DEMO_TYPOGRAPHY.fontFamily.sans,
    lineHeight: DEMO_TYPOGRAPHY.lineHeights.normal
  },
  
  card: {
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.lg,
    padding: DEMO_SPACING.xl
  },
  
  cardHover: {
    transition: `border-color ${DEMO_TRANSITIONS.fast}`,
    ':hover': {
      borderColor: DEMO_COLORS.border.light
    }
  },
  
  button: {
    primary: {
      background: DEMO_COLORS.accent.DEFAULT,
      color: '#fff',
      border: 'none',
      borderRadius: DEMO_RADIUS.md,
      padding: `${DEMO_SPACING.md} ${DEMO_SPACING.xl}`,
      fontWeight: DEMO_TYPOGRAPHY.weights.medium,
      fontSize: DEMO_TYPOGRAPHY.sizes.base,
      cursor: 'pointer',
      transition: `all ${DEMO_TRANSITIONS.fast}`
    },
    secondary: {
      background: 'transparent',
      color: DEMO_COLORS.text.secondary,
      border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
      borderRadius: DEMO_RADIUS.md,
      padding: `${DEMO_SPACING.md} ${DEMO_SPACING.xl}`,
      fontWeight: DEMO_TYPOGRAPHY.weights.medium,
      cursor: 'pointer',
      transition: `all ${DEMO_TRANSITIONS.fast}`
    }
  },
  
  input: {
    background: DEMO_COLORS.bg.input,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.md,
    color: DEMO_COLORS.text.primary,
    padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    outline: 'none',
    transition: `border-color ${DEMO_TRANSITIONS.fast}`,
    ':focus': {
      borderColor: DEMO_COLORS.accent.DEFAULT
    }
  }
}
