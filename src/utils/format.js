/**
 * Format Utilities
 * Centralized formatting functions for dates, statistics, and display values
 */

/**
 * Format a date string for display
 * @param {string} dateStr - ISO date string
 * @param {Object} options - Optional fallback value
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr, options = {}) {
  const { fallback = 'Unknown' } = options

  if (!dateStr) return fallback

  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Invalid date'
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a statistic value with proper pluralization
 * @param {number|undefined} value - The value to format
 * @param {string} unit - The unit suffix (singular form)
 * @param {Object} options - Optional configuration
 * @returns {string} Formatted value with unit
 */
export function formatStat(value, unit, options = {}) {
  const { fallback = '—' } = options

  if (typeof value !== 'number' || isNaN(value)) {
    return `${fallback} ${unit}`
  }

  const pluralizedUnit = value === 1 ? unit : `${unit}s`
  return `${value} ${pluralizedUnit}`
}

/**
 * Format a file count with icon
 * @param {number} count - Number of files
 * @returns {string} Formatted file count
 */
export function formatFileCount(count) {
  return formatStat(count, 'file')
}

/**
 * Format a component count with icon
 * @param {number} count - Number of components
 * @returns {string} Formatted component count
 */
export function formatComponentCount(count) {
  return formatStat(count, 'component')
}

/**
 * Truncate a string with ellipsis if it exceeds max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

/**
 * Format a run ID for display (shortened version)
 * @param {string} runId - Full run ID
 * @returns {string} Formatted short ID
 */
export function formatRunId(runId) {
  if (!runId || runId.length < 12) return runId || 'Unknown'
  return `${runId.substring(0, 8)}...${runId.substring(runId.length - 4)}`
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
