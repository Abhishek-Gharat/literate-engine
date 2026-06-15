/**
 * Common entry point file patterns
 * These files typically serve as application entry points
 */
const ENTRY_PATTERNS = [
  /^main\.(jsx?|tsx?)$/,
  /^index\.(jsx?|tsx?)$/,
  /^App\.(jsx?|tsx?)$/,
  /^entry\.(jsx?|tsx?)$/,
  /^bootstrap\.(jsx?|tsx?)$/,
  /^client\.(jsx?|tsx?)$/,
  /^server\.(jsx?|tsx?)$/,
]

/**
 * Check if a file is likely an entry point
 * @param {string} filename - The file path or name
 * @returns {boolean}
 */
export function isEntryPoint(filename) {
  const basename = filename.split('/').pop()
  return ENTRY_PATTERNS.some(pattern => pattern.test(basename))
}

/**
 * Get all entry points from a list of files
 * @param {string[]} files - Array of file paths
 * @returns {string[]} Array of entry point file paths
 */
export function findEntryPoints(files) {
  return files.filter(isEntryPoint)
}

export function getNodeType(filename) {
  const basename = filename.split('/').pop()

  if (/^use[A-Z]/.test(basename)) return 'hook'
  if (/\.config\./.test(filename)) return 'config'
  if (/(^|\/)(tsconfig|jsconfig|package|vite\.config|webpack\.config)\./.test(filename)) return 'config'
  if (/\.(css|scss)$/.test(filename)) return 'style'
  if (/(context|Context|Provider|provider|store|Store)\./.test(filename)) return 'context'
  if (/(route|Route|router|Router|Page|page)\./.test(filename)) return 'page'
  if (basename === 'App.jsx' || basename === 'App.tsx') return 'root'
  if (basename?.includes('index')) return 'index'
  return 'component'
}

/**
 * Get node type with entry point awareness
 * @param {string} filename - The file path
 * @param {boolean} markAsEntry - Whether to mark entry points specially
 * @returns {object} Object with nodeType and isEntryPoint
 */
export function getNodeTypeWithEntry(filename, markAsEntry = false) {
  const nodeType = getNodeType(filename)
  const entryPoint = isEntryPoint(filename)

  if (markAsEntry && entryPoint) {
    return { nodeType: 'entry', isEntryPoint: true }
  }

  return { nodeType, isEntryPoint: entryPoint }
}
