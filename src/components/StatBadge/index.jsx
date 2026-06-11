import { COLORS, TYPOGRAPHY } from '../../styles/constants.js'

/**
 * StatBadge - Displays a statistics badge with icon and label
 * Used in the top bar to show file/component/hook counts
 * 
 * @param {Object} props
 * @param {string} props.label - The text label (e.g., "5 files")
 * @param {string} props.color - The accent color (e.g., '#6366f1')
 * @param {string} [props.icon] - Optional icon character
 */
export default function StatBadge({ label, color, icon }) {
  return (
    <span style={{
      padding: '3px 10px',
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: '20px',
      fontSize: TYPOGRAPHY.size.lg,
      color: color,
      fontWeight: TYPOGRAPHY.weight.semibold,
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        display: 'inline-block'
      }} />
      {icon && <span>{icon}</span>}
      {label}
    </span>
  )
}

/**
 * StatBadgeList - Displays multiple stat badges in a row
 * 
 * @param {Object} props
 * @param {Array<{label: string, color: string, icon?: string}>} props.items - Array of badge items
 * @param {string} [props.gap='8px'] - Gap between badges
 */
export function StatBadgeList({ items, gap = '8px' }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {items.map((item, index) => (
        <StatBadge
          key={index}
          label={item.label}
          color={item.color}
          icon={item.icon}
        />
      ))}
    </div>
  )
}

/**
 * StatsDisplay - Renders analysis stats as badges
 * 
 * @param {Object} props
 * @param {Object} props.stats - Stats object with totalFiles, totalComponents, totalHooks, cyclesFound
 */
function StatsDisplay({ stats }) {
  if (!stats) return null

  const items = [
    { label: `${stats.totalFiles} files`, color: COLORS.status.info },
    { label: `${stats.totalComponents} components`, color: COLORS.node.component },
    { label: `${stats.totalHooks} hooks`, color: COLORS.node.hook },
    stats.cyclesFound > 0
      ? { label: `⚠ ${stats.cyclesFound} cycles`, color: COLORS.status.error }
      : { label: '✓ No cycles', color: COLORS.status.success }
  ]

  return <StatBadgeList items={items} />
}

export { StatsDisplay }
