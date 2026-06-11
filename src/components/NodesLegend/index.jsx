import { NODE_LEGEND_ITEMS, COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/constants.js'

/**
 * LegendItem - Single legend item with color indicator and label
 * 
 * @param {Object} props
 * @param {string} props.label - The label text
 * @param {string} props.color - The color hex code
 */
function LegendItem({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color
      }} />
      <span style={{
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.text.secondary
      }}>{label}</span>
    </div>
  )
}

/**
 * NodesLegend - Displays the legend for node types
 * 
 * @param {Object} props
 * @param {Array<{label: string, color: string}>} [props.items] - Custom legend items
 * @param {number} [props.columns=2] - Number of columns in the grid
 */
export default function NodesLegend({ items = NODE_LEGEND_ITEMS, columns = 2 }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
      flexShrink: 0
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text.dark,
        fontWeight: TYPOGRAPHY.weight.bold,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '10px'
      }}>
        Nodes Legend
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '8px'
      }}>
        {items.map((item, index) => (
          <LegendItem key={index} label={item.label} color={item.color} />
        ))}
      </div>
    </div>
  )
}

/**
 * LegendSection - Wrapper component for legend sections
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Content
 */
export function LegendSection({ title, children }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
      flexShrink: 0
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text.dark,
        fontWeight: TYPOGRAPHY.weight.bold,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '10px'
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}
