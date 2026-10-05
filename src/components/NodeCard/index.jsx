import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/constants.js'
import { getNodeColor } from '../../utils/nodeColors.js'

/**
 * NodeCard - Displays node information in a card format
 * Used in NodeInspector and sidebar node info sections
 * 
 * @param {Object} props
 * @param {Object} props.node - Node data with label, nodeType, imports, importedBy
 * @param {string} [props.className] - Optional CSS class
 * @param {Object} [props.style] - Optional inline styles
 */
export default function NodeCard({ node, className, style = {} }) {
  if (!node) return null

  const color = getNodeColor(node.nodeType)
  const importCount = node.imports?.length || 0
  const usedByCount = node.importedBy?.length || 0

  return (
    <div
      className={className}
      style={{
        background: COLORS.bg.card,
        border: `1px solid ${COLORS.border.light}`,
        borderRadius: BORDER_RADIUS.xl,
        padding: '14px',
        ...style
      }}
    >
      {/* Node Type Badge */}
      <div style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: `${color}22`,
        border: `1px solid ${color}44`,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: '8px'
      }}>
        <span style={{
          fontSize: TYPOGRAPHY.size.xs,
          color: color,
          fontWeight: TYPOGRAPHY.weight.bold,
          textTransform: 'uppercase'
        }}>
          {node.nodeType}
        </span>
      </div>

      {/* Node Label */}
      <div style={{
        fontFamily: TYPOGRAPHY.fontFamily.mono,
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.text.primary,
        wordBreak: 'break-word'
      }}>
        {node.label}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: `1px solid ${COLORS.border.DEFAULT}`
      }}>
        <StatItem label="Imports" value={importCount} color={COLORS.status.info} />
        <StatItem label="Used by" value={usedByCount} color={COLORS.status.success} />
      </div>
    </div>
  )
}

/**
 * StatItem - Displays a label-value stat pair
 * 
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number} props.value - Stat value
 * @param {string} props.color - Accent color
 */
function StatItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text.muted
      }}>
        {label}:
      </span>
      <span style={{
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: value > 0 ? color : COLORS.text.muted,
        fontFamily: TYPOGRAPHY.fontFamily.mono
      }}>
        {value}
      </span>
    </div>
  )
}

/**
 * ImportList - Displays a list of imports with styling
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string[]} props.items - Array of import paths
 * @param {string} props.borderColor - Left border color
 * @param {string} props.textColor - Text color
 */
export function ImportList({ title, items, borderColor, textColor, onItemClick }) {
  if (!items?.length) return null

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text.dark,
        fontWeight: TYPOGRAPHY.weight.bold,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{title}</span>
        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', color: COLORS.text.muted }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => onItemClick?.(item)}
            style={{
              padding: '6px 10px',
              background: COLORS.bg.card,
              borderRadius: BORDER_RADIUS.md,
              borderLeft: `2px solid ${borderColor}`,
              color: textColor,
              fontSize: TYPOGRAPHY.size.md,
              fontFamily: TYPOGRAPHY.fontFamily.mono,
              cursor: onItemClick ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => {
              if (onItemClick) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              if (onItemClick) e.currentTarget.style.background = COLORS.bg.card
            }}
            title={onItemClick ? `Focus ${item}` : undefined}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item}
            </span>
            {onItemClick && <span style={{ opacity: 0.5, fontSize: '10px' }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * EmptyState - Displays an empty state message
 * 
 * @param {Object} props
 * @param {string} props.icon - Emoji icon
 * @param {string} props.message - Main message
 * @param {string} [props.subMessage] - Optional sub-message
 */
export function EmptyState({ icon, message, subMessage }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '40px',
      gap: '10px',
      opacity: 0.3
    }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div style={{
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.size.md,
        textAlign: 'center'
      }}>
        {message}
      </div>
      {subMessage && (
        <div style={{
          color: COLORS.text.muted,
          fontSize: TYPOGRAPHY.size.sm,
          textAlign: 'center'
        }}>
          {subMessage}
        </div>
      )}
    </div>
  )
}
