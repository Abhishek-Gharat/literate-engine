/* ── JS Color Tokens (single source of truth) ── */
export const COLORS = {
  primary: {
    DEFAULT: '#818cf8',
    light: '#a5b4fc',
    dark: '#6366f1',
    muted: 'rgba(99,102,241,0.16)',
    border: 'rgba(129,140,248,0.35)',
  },
  bg: {
    main: '#07090e',
    panel: 'rgba(13,16,25,0.85)',
    card: 'rgba(20,25,38,0.72)',
    input: 'rgba(15,19,30,0.85)',
    hover: 'rgba(30,38,58,0.65)',
    surface: '#0a0d15',
    elevated: '#131724',
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.09)',
    light: 'rgba(255,255,255,0.18)',
    muted: 'rgba(255,255,255,0.05)',
    medium: 'rgba(255,255,255,0.22)',
    subtle: 'rgba(255,255,255,0.10)',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    muted: '#64748b',
    dark: '#475569',
  },
  accent: {
    DEFAULT: '#818cf8',
    dim: '#6366f1',
    bright: '#a5b4fc',
  },
  node: {
    root: '#f8fafc',
    entry: '#22d3ee',
    component: '#10b981',
    hook: '#f43f5e',
    context: '#a855f7',
    page: '#38bdf8',
    external: '#94a3b8',
    index: '#a855f7',
  },
  status: {
    success: '#0cce6b',
    error: '#ff5c5c',
    warning: '#f5a623',
    info: '#38bdf8',
  },
  edge: {
    DEFAULT: 'rgba(148,163,184,0.32)',
    cyclic: '#ff5c5c',
    cyclicBg: 'rgba(255,92,92,0.20)',
  },
  glass: {
    bg: 'rgba(13,16,25,0.78)',
    bgHeavy: 'rgba(9,11,18,0.94)',
    border: 'rgba(255,255,255,0.09)',
    borderHeavy: 'rgba(255,255,255,0.16)',
  },
  glow: {
    accent: 'rgba(99,102,241,0.20)',
    accentStrong: 'rgba(99,102,241,0.45)',
    accentPulse: 'rgba(129,140,248,0.65)',
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
  { label: 'Entry Point', color: COLORS.node.entry },
  { label: 'Component', color: COLORS.node.component },
  { label: 'Hook', color: COLORS.node.hook },
  { label: 'Context', color: COLORS.node.context },
  { label: 'Page', color: COLORS.node.page },
  { label: 'External', color: COLORS.node.external },
]
