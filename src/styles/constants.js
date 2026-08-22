/* ── JS Color Tokens (single source of truth) ── */
export const COLORS = {
  primary: {
    DEFAULT: '#ffffff',
    light: '#ffffff',
    dark: '#a1a1a1',
    muted: 'rgba(255,255,255,0.13)',
    border: 'rgba(255,255,255,0.27)',
  },
  bg: {
    main: '#000000',
    panel: '#0a0a0a',
    card: '#111111',
    input: '#0a0a0a',
    hover: '#1a1a1a',
    surface: '#0a0a0a',
    elevated: '#111111',
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.10)',
    light: 'rgba(255,255,255,0.20)',
    muted: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.20)',
    subtle: 'rgba(255,255,255,0.10)',
  },
  text: {
    primary: '#ededed',
    secondary: '#a1a1a1',
    muted: '#71717a',
  },
  accent: {
    DEFAULT: '#ffffff',
    dim: '#a1a1a1',
    bright: '#ffffff',
  },
  node: {
    root: '#ffffff',
    component: '#5a9e6f',
    hook: '#b07a8a',
    page: '#4a7c9b',
    external: '#8a8a8a',
    index: '#8b6fb0',
  },
  status: {
    success: '#0cce6b',
    error: '#ff5c5c',
    warning: '#f5a623',
    info: '#4a7c9b',
  },
  edge: {
    DEFAULT: 'rgba(255,255,255,0.25)',
    cyclic: '#ff5c5c',
    cyclicBg: 'rgba(255,92,92,0.20)',
  },
  glass: {
    bg: 'rgba(0,0,0,0.80)',
    bgHeavy: 'rgba(0,0,0,0.95)',
    border: 'rgba(255,255,255,0.08)',
    borderHeavy: 'rgba(255,255,255,0.12)',
  },
  glow: {
    accent: 'rgba(255,255,255,0.12)',
    accentStrong: 'rgba(255,255,255,0.35)',
    accentPulse: 'rgba(255,255,255,0.50)',
  },
}

/* ── CSS Variable names ── */
export const CSS_VARS = {
  primary:        'var(--color-primary)',
  primaryLight:   'var(--color-primary-light)',
  primaryDark:    'var(--color-primary-dark)',
  primaryMuted:   'var(--color-primary-muted)',
  primaryBorder:  'var(--color-primary-border)',
  bgMain:         'var(--bg-main)',
  bgPanel:        'var(--bg-panel)',
  bgCard:         'var(--bg-card)',
  bgInput:        'var(--bg-input)',
  bgHover:        'var(--bg-hover)',
  bgSurface:      'var(--bg-surface)',
  bgElevated:     'var(--bg-elevated)',
  borderDefault:  'var(--border-default)',
  borderLight:    'var(--border-light)',
  borderMuted:    'var(--border-muted)',
  borderMedium:   'var(--border-medium)',
  borderSubtle:   'var(--border-subtle)',
  textPrimary:    'var(--text-primary)',
  textSecondary:  'var(--text-secondary)',
  textMuted:      'var(--text-muted)',
  accentDefault:  'var(--accent-default)',
  accentDim:      'var(--accent-dim)',
  accentBright:   'var(--accent-bright)',
  nodeRoot:       'var(--node-root)',
  nodeComponent:  'var(--node-component)',
  nodeHook:       'var(--node-hook)',
  nodePage:       'var(--node-page)',
  nodeExternal:   'var(--node-external)',
  nodeIndex:      'var(--node-index)',
  statusSuccess:  'var(--status-success)',
  statusError:    'var(--status-error)',
  statusWarning:  'var(--status-warning)',
  statusInfo:     'var(--status-info)',
  edgeDefault:    'var(--edge-default)',
  edgeCyclic:     'var(--edge-cyclic)',
  glassBg:        'var(--glass-bg)',
  glassBgHeavy:   'var(--glass-bg-heavy)',
  glassBorder:    'var(--glass-border)',
  glassBorderHeavy: 'var(--glass-border-heavy)',
  glowAccent:     'var(--glow-accent)',
  glowAccentStrong: 'var(--glow-accent-strong)',
  glowAccentPulse: 'var(--glow-accent-pulse)',
}

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

export const LAYOUT = {
  sidebar: {
    left: '260px',
    right: '320px',
    project: '480px',
    runs: '300px',
    detail: '380px',
  },
  height: {
    topBar: '48px',
    panel: '100vh',
  },
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 50,
    overlay: 100,
  },
}

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    serif: "'DM Serif Display', Georgia, serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  size: {
    xs: '10px',
    sm: '11px',
    md: '12px',
    lg: '13px',
    xl: '14px',
    '2xl': '15px',
    '3xl': '16px',
    '4xl': '18px',
    '5xl': '22px',
  },
  weight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
  },
}

export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '12px',
  full: '9999px',
}

export const TRANSITIONS = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
}

export const NODE_TYPE_CONFIG = {
  root: { icon: '⚡', color: COLORS.node.root, label: 'Root' },
  entry: { icon: '🚪', color: COLORS.node.page, label: 'Entry Point' },
  page: { icon: '📄', color: COLORS.node.page, label: 'Page' },
  component: { icon: '🧩', color: COLORS.node.component, label: 'Component' },
  hook: { icon: '🪝', color: COLORS.node.hook, label: 'Hook' },
  index: { icon: '📦', color: COLORS.node.index, label: 'Index' },
  ghost: { icon: '👻', color: COLORS.node.external, label: 'External' },
}

export const commonStyles = {
  panel: {
    background: COLORS.bg.panel,
    borderColor: COLORS.border.subtle,
  },
  card: {
    background: COLORS.bg.card,
    borderRadius: BORDER_RADIUS.lg,
    border: `1px solid ${COLORS.border.subtle}`,
  },
  button: {
    base: {
      borderRadius: BORDER_RADIUS.md,
      fontWeight: TYPOGRAPHY.weight.medium,
      cursor: 'pointer',
      transition: `all ${TRANSITIONS.normal}`,
    },
    primary: {
      background: 'rgba(255,255,255,0.13)',
      color: COLORS.accent.bright,
      border: `1px solid ${COLORS.border.medium}`,
    },
    secondary: {
      background: COLORS.bg.elevated,
      border: `1px solid ${COLORS.border.subtle}`,
      color: COLORS.text.secondary,
    },
  },
  input: {
    background: COLORS.bg.input,
    border: `1px solid ${COLORS.border.subtle}`,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text.primary,
    outline: 'none',
  },
}

export const NODE_LEGEND_ITEMS = [
  { label: 'Root', color: COLORS.node.root },
  { label: 'Entry Point', color: COLORS.node.page },
  { label: 'Component', color: COLORS.node.component },
  { label: 'Hook', color: COLORS.node.hook },
  { label: 'Page', color: COLORS.node.page },
  { label: 'External', color: COLORS.node.external },
]
