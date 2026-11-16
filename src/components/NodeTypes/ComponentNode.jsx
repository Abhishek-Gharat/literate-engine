import { Handle, Position } from '@xyflow/react'

const TYPE_CONFIG = {
  root:      { icon: '⚡', color: '#818cf8', label: 'Root', bg: 'rgba(129, 140, 248, 0.12)' },
  entry:     { icon: '🚪', color: '#38bdf8', label: 'Entry Point', bg: 'rgba(56, 189, 248, 0.12)' },
  page:      { icon: '📄', color: '#38bdf8', label: 'Page', bg: 'rgba(56, 189, 248, 0.12)' },
  component: { icon: '🧩', color: '#10b981', label: 'Component', bg: 'rgba(16, 185, 129, 0.12)' },
  hook:      { icon: '🪝', color: '#f43f5e', label: 'Hook', bg: 'rgba(244, 63, 94, 0.12)' },
  index:     { icon: '📦', color: '#a855f7', label: 'Index', bg: 'rgba(168, 85, 247, 0.12)' },
  ghost:     { icon: '👻', color: '#94a3b8', label: 'External', bg: 'rgba(148, 163, 184, 0.12)' },
}

const HEAT_LEVELS = {
  1: { color: '#f59e0b', name: 'warm' },
  2: { color: '#fb923c', name: 'hot' },
  3: { color: '#ef4444', name: 'critical' },
}

const RISK_LEVELS = {
  1: { color: '#c084fc', name: 'elevated' },
  2: { color: '#a855f7', name: 'high' },
  3: { color: '#7c3aed', name: 'critical' },
}

export default function ComponentNode({ data, selected }) {
  const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.component
  const importCount = data.imports?.length || 0
  const usedByCount = data.importedBy?.length || 0
  const heat = data.heatEnabled && data.heatLevel > 0 ? HEAT_LEVELS[data.heatLevel] : null
  const risk = data.riskEnabled && data.riskLevel > 0 ? RISK_LEVELS[data.riskLevel] : null
  const accent = heat || risk
  const consumers = data.signals?.contextConsumers?.length || 0

  return (
    <div
      title={
        heat
          ? `${usedByCount} files depend on this (${heat.name})`
          : risk
            ? `${consumers} context${consumers === 1 ? '' : 's'} consumed (${risk.name} re-render risk)`
            : undefined
      }
      style={{
        background: accent
          ? `linear-gradient(135deg, ${accent.color}18 0%, rgba(15, 20, 32, 0.92) 55%)`
          : selected
            ? `linear-gradient(135deg, ${config.color}15 0%, rgba(16, 21, 35, 0.95) 100%)`
            : 'rgba(13, 17, 28, 0.88)',
        border: `1px solid ${selected ? config.color : 'rgba(255, 255, 255, 0.10)'}`,
        borderTop: `2.5px solid ${accent ? accent.color : config.color}`,
        borderLeft: accent ? `3px solid ${accent.color}` : undefined,
        borderRadius: '12px',
        minWidth: '185px',
        maxWidth: '220px',
        fontFamily: "'Inter', system-ui, sans-serif",
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: selected
          ? `0 0 0 2px ${config.color}55, 0 12px 36px -4px ${config.color}40, 0 0 20px ${config.color}20`
          : '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 10px 28px -4px rgba(0,0,0,0.6), 0 0 18px ${config.color}25`
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)'
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: config.color,
          width: 8,
          height: 8,
          border: '2px solid #07090e',
          boxShadow: `0 0 8px ${config.color}`,
          top: -4,
        }}
      />

      {/* Type header */}
      <div
        style={{
          padding: '8px 12px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <span
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            background: config.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
          }}
        >
          {config.icon}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: config.color,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          {config.label}
        </span>

        {heat && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '9px',
              fontWeight: '700',
              fontFamily: "'JetBrains Mono', monospace",
              color: heat.color,
              background: `${heat.color}1a`,
              border: `1px solid ${heat.color}44`,
              padding: '1px 6px',
              borderRadius: '999px',
            }}
          >
            {usedByCount}×
          </span>
        )}

        {risk && (
          <span
            style={{
              marginLeft: heat ? '4px' : 'auto',
              fontSize: '9px',
              fontWeight: '700',
              fontFamily: "'JetBrains Mono', monospace",
              color: risk.color,
              background: `${risk.color}1a`,
              border: `1px solid ${risk.color}44`,
              padding: '1px 6px',
              borderRadius: '999px',
            }}
          >
            ⚛{consumers}
          </span>
        )}

        {data.isGhost && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '9px',
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.06)',
              padding: '1px 6px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            ext
          </span>
        )}
      </div>

      {/* Filename */}
      <div
        style={{
          padding: '9px 12px 7px',
          color: '#f8fafc',
          fontWeight: '600',
          fontSize: '12.5px',
          fontFamily: "'JetBrains Mono', monospace",
          wordBreak: 'break-word',
          lineHeight: '1.45',
          letterSpacing: '0.1px',
        }}
      >
        {data.label}
      </div>

      {/* Stats pill footer */}
      <div
        style={{
          padding: '4px 12px 8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '10.5px',
            color: importCount > 0 ? '#c084fc' : '#64748b',
            background: importCount > 0 ? 'rgba(192, 132, 252, 0.10)' : 'rgba(255,255,255,0.03)',
            padding: '2px 7px',
            borderRadius: '5px',
            border: `1px solid ${importCount > 0 ? 'rgba(192, 132, 252, 0.25)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontWeight: '600',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>↓</span> {importCount}
        </span>

        <span
          style={{
            fontSize: '10.5px',
            color: usedByCount > 0 ? '#34d399' : '#64748b',
            background: usedByCount > 0 ? 'rgba(52, 211, 153, 0.10)' : 'rgba(255,255,255,0.03)',
            padding: '2px 7px',
            borderRadius: '5px',
            border: `1px solid ${usedByCount > 0 ? 'rgba(52, 211, 153, 0.25)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontWeight: '600',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>↑</span> {usedByCount}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: config.color,
          width: 8,
          height: 8,
          border: '2px solid #07090e',
          boxShadow: `0 0 8px ${config.color}`,
          bottom: -4,
        }}
      />
    </div>
  )
}