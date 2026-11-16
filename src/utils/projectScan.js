import fs from 'node:fs'
import path from 'node:path'
import { analyzeProject } from '../analysis/engine.js'

const SOURCE_RE = /\.(jsx?|tsx?)$/
const DEFAULT_IGNORES = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  'out', 'playwright-report', 'test-results', '.next', '.vercel',
])

/**
 * Recursively collect source files under a directory.
 * @returns {Array<{ name: string, content: string }>} names are POSIX-style paths relative to root
 */
export function collectSourceFiles(root, ignores = DEFAULT_IGNORES) {
  const files = []

  const walk = (dir, prefix) => {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignores.has(entry.name)) {
          walk(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name)
        }
        continue
      }
      if (!entry.isFile() || !SOURCE_RE.test(entry.name)) continue
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
      try {
        files.push({ name: relPath, content: fs.readFileSync(path.join(dir, entry.name), 'utf8') })
      } catch {
        // unreadable file — skip rather than fail the whole scan
      }
    }
  }

  walk(root, '')
  return files
}

/**
 * Analyze a directory into a compact CI report.
 */
export function buildReport(root) {
  const files = collectSourceFiles(root)
  const result = analyzeProject(files)

  const deadFiles = result.nodes
    .filter((node) => !node.isGhost && (node.deadExports?.length || 0) > 0)
    .sort((a, b) => b.deadExports.length - a.deadExports.length || a.id.localeCompare(b.id))
    .slice(0, 8)
    .map((node) => ({ file: node.id, exports: node.deadExports }))

  return {
    generatedAt: new Date().toISOString(),
    score: result.stats.healthScore,
    grade: result.stats.healthGrade,
    stats: {
      totalFiles: result.stats.totalFiles,
      totalComponents: result.stats.totalComponents,
      totalHooks: result.stats.totalHooks,
      cyclesFound: result.stats.cyclesFound,
      unresolvedImports: result.stats.unresolvedImports,
      analysisErrors: result.stats.analysisErrors,
      totalStateHooks: result.stats.totalStateHooks,
      contextDefinitions: result.stats.contextDefinitions,
    },
    deadExports: deadFiles,
    analysisErrorsSample: result.analysisErrors.slice(0, 5),
  }
}

/**
 * Render a report as markdown (PR comments, step summaries).
 */
export function formatMarkdown(report) {
  const lines = []
  lines.push('## ⚡ ReactViz Architecture Report')
  lines.push('')
  lines.push(`**Health Score:** ${report.score}/100 (${report.grade}) · ${report.stats.totalFiles} files · ${report.stats.totalComponents} components`)
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('| --- | --- |')
  lines.push(`| Circular dependencies | ${report.stats.cyclesFound} |`)
  lines.push(`| Unresolved imports | ${report.stats.unresolvedImports} |`)
  lines.push(`| Dead exports | ${report.deadExports.reduce((sum, f) => sum + f.exports.length, 0)} |`)
  lines.push(`| Analysis errors | ${report.stats.analysisErrors} |`)

  if (report.deadExports.length > 0) {
    lines.push('')
    lines.push('<details>')
    lines.push('<summary>Dead exports by file</summary>')
    lines.push('')
    for (const entry of report.deadExports) {
      lines.push(`- \`${entry.file}\`: ${entry.exports.join(', ')}`)
    }
    lines.push('')
    lines.push('</details>')
  }

  return lines.join('\n')
}
