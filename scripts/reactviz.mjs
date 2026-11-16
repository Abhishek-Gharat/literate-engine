#!/usr/bin/env node
/**
 * ReactViz CLI — architecture health report for any JS/TS project.
 *
 * Usage:
 *   node scripts/reactviz.mjs [projectDir] [options]
 *
 * Options:
 *   --json          Output machine-readable JSON
 *   --markdown      Output PR-ready markdown
 *   --fail-under N  Exit 1 when the health score is below N (default: no gate)
 *
 * Examples:
 *   node scripts/reactviz.mjs .
 *   node scripts/reactviz.mjs ./packages/web --json
 *   node scripts/reactviz.mjs . --markdown --fail-under 70 > reactviz.md
 */
import { buildReport, formatMarkdown } from '../src/utils/projectScan.js'

function parseArgs(argv) {
  const options = { dir: '.', format: 'terminal', failUnder: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--json') options.format = 'json'
    else if (arg === '--markdown' || arg === '--md') options.format = 'markdown'
    else if (arg === '--fail-under') {
      const value = Number(argv[++i])
      if (!Number.isFinite(value)) {
        console.error('reactviz: --fail-under requires a number')
        process.exit(2)
      }
      options.failUnder = value
    } else if (arg === '--help' || arg === '-h') {
      options.format = 'help'
    } else if (!arg.startsWith('--')) {
      options.dir = arg
    } else {
      console.error(`reactviz: unknown option ${arg}`)
      process.exit(2)
    }
  }
  return options
}

const USAGE = `
ReactViz CLI — architecture health at a glance.

Usage:
  node scripts/reactviz.mjs [projectDir] [--json | --markdown] [--fail-under N]

Examples:
  node scripts/reactviz.mjs .
  node scripts/reactviz.mjs ../my-app --json
  CI: node scripts/reactviz.mjs . --fail-under 70
`.trim()

const options = parseArgs(process.argv.slice(2))

if (options.format === 'help') {
  console.log(USAGE)
  process.exit(0)
}

let report
try {
  report = buildReport(options.dir)
} catch (error) {
  console.error(`reactviz: failed to analyze "${options.dir}": ${error.message}`)
  process.exit(2)
}

if (options.format === 'json') {
  console.log(JSON.stringify(report, null, 2))
} else if (options.format === 'markdown') {
  console.log(formatMarkdown(report))
} else {
  const { score, grade, stats, deadExports } = report
  const totalDead = deadExports.reduce((sum, entry) => sum + entry.exports.length, 0)
  console.log('')
  console.log('  ⚡ ReactViz Architecture Report')
  console.log('  ──────────────────────────────')
  console.log(`  Health Score : ${score}/100 (${grade})`)
  console.log(`  Files        : ${stats.totalFiles}`)
  console.log(`  Components   : ${stats.totalComponents}   Hooks: ${stats.totalHooks}`)
  console.log(`  Cycles       : ${stats.cyclesFound}`)
  console.log(`  Unresolved   : ${stats.unresolvedImports}`)
  console.log(`  Dead exports : ${totalDead}`)
  console.log(`  Errors       : ${stats.analysisErrors}`)
  if (deadExports.length > 0) {
    console.log('')
    console.log('  Top dead exports:')
    for (const entry of deadExports.slice(0, 5)) {
      console.log(`    ${entry.file}: ${entry.exports.join(', ')}`)
    }
  }
  console.log('')
}

if (options.failUnder !== null && typeof report.score === 'number' && report.score < options.failUnder) {
  console.error(`reactviz: score ${report.score} is below the gate of ${options.failUnder}`)
  process.exit(1)
}
