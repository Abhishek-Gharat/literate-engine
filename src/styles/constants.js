/**
 * Style Constants Module
 * Centralized style tokens to ensure consistency across the application
 * and eliminate magic values scattered throughout components.
 */

// ============================================
// COLOR PALETTE
// ============================================

export const COLORS = {
  // Primary brand colors
  primary: {
    DEFAULT: '#7c3aed',
    light: '#a78bfa',
    dark: '#6d28d9',
    muted: '#7c3aed22',
    border: '#7c3aed44',
  },

  // Background colors
  bg: {
    main: '#0a0a12',
    panel: '#0d0d14',
    card: '#13131f',
    input: '#13131f',
    hover: '#13131f',
  },

  // Border colors
  border: {
    DEFAULT: '#1e1e2e',
    light: '#2a2a3d',
    muted: '#334155',
  },

  // Text colors
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    dark: '#475569',
  },

  // Node type colors
  node: {
    root: '#7c3aed',
    component: '#059669',
    hook: '#d97706',
    page: '#0891b2',
    external: '#475569',
    index: '#6366f1',
  },

  // Status colors
  status: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#6366f1',
  },

  // Edge colors
  edge: {
    DEFAULT: '#818cf8',
    cyclic: '#f87171',
    cyclicBg: '#f8717133',
  },
}

// ============================================
// SPACING SCALE
// ============================================

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
}

// ============================================
// LAYOUT DIMENSIONS
// ============================================

export const LAYOUT = {
  // Sidebar widths
  sidebar: {
    left: '260px',
    right: '320px',
    project: '480px',
    runs: '300px',
    detail: '380px',
  },

  // Heights
  height: {
    topBar: '48px',
    panel: '100vh',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 100,
  },
}

// ============================================
// TYPOGRAPHY
// ============================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: 'monospace',
  },

  size: {
    xs: '10px',
    sm: '11px',
    md: '12px',
    lg: '13px',
    xl: '14px',
    '2xl': '15px',
    '3xl': '16px',
  },

  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}

// ============================================
// BORDER RADIUS
// ============================================

export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '12px',
  full: '9999px',
}

// ============================================
// TRANSITIONS
// ============================================

export const TRANSITIONS = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
}

// ============================================
// NODE TYPE CONFIGURATION
// ============================================

export const NODE_TYPE_CONFIG = {
  root: { icon: '⚡', color: COLORS.node.root, label: 'Root' },
  page: { icon: '📄', color: COLORS.node.page, label: 'Page' },
  component: { icon: '🧩', color: COLORS.node.component, label: 'Component' },
  hook: { icon: '🪝', color: COLORS.node.hook, label: 'Hook' },
  index: { icon: '📦', color: COLORS.node.index, label: 'Index' },
  ghost: { icon: '👻', color: COLORS.node.external, label: 'External' },
}

// ============================================
// COMMON STYLE OBJECTS
// ============================================

export const commonStyles = {
  panel: {
    background: COLORS.bg.panel,
    borderColor: COLORS.border.DEFAULT,
  },

  card: {
    background: COLORS.bg.card,
    borderRadius: BORDER_RADIUS.lg,
    border: `1px solid ${COLORS.border.light}`,
  },

  button: {
    base: {
      borderRadius: BORDER_RADIUS.md,
      fontWeight: TYPOGRAPHY.weight.semibold,
      cursor: 'pointer',
      transition: `all ${TRANSITIONS.normal}`,
    },
    primary: {
      background: COLORS.primary.DEFAULT,
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      border: `1px solid ${COLORS.border.DEFAULT}`,
      color: COLORS.text.secondary,
    },
  },

  input: {
    background: COLORS.bg.input,
    border: `1px solid ${COLORS.border.DEFAULT}`,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text.primary,
    outline: 'none',
  },
}

// ============================================
// LEGEND ITEMS
// ============================================

export const NODE_LEGEND_ITEMS = [
  { label: 'Root', color: COLORS.node.root },
  { label: 'Component', color: COLORS.node.component },
  { label: 'Hook', color: COLORS.node.hook },
  { label: 'Page', color: COLORS.node.page },
  { label: 'External', color: COLORS.node.external },
]
