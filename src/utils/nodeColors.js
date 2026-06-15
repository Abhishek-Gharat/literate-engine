import { COLORS } from '../styles/constants.js'

/**
 * getNodeColor - Returns the color for a given node type
 * 
 * @param {string} nodeType - The node type (root, component, hook, page, ghost)
 * @returns {string} Hex color code
 */
export function getNodeColor(nodeType) {
  const colors = {
    root: COLORS.node.root,
    entry: '#f59e0b', // Amber/gold for entry points
    component: COLORS.node.component,
    hook: COLORS.node.hook,
    page: COLORS.node.page,
    ghost: COLORS.node.external,
    external: COLORS.node.external,
    index: COLORS.node.index,
  }
  return colors[nodeType] || COLORS.status.info
}

/**
 * Check if a node type is an entry point
 * @param {string} nodeType - The node type
 * @returns {boolean}
 */
export function isEntryPointType(nodeType) {
  return nodeType === 'entry' || nodeType === 'root'
}
