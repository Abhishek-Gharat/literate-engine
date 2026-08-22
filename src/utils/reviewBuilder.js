import { GOD_FAN_IN_THRESHOLD, GOD_FAN_OUT_THRESHOLD } from './healthScore.js'

const MAX_CYCLES = 10
const MAX_ORPHANS = 15
const MAX_COUPLED = 10

export const REVIEW_SYSTEM_PROMPT = `You are a senior React architect performing a code review.
You are given a structural digest of a project (files, dependency graph, cycles, orphans, coupling).
Write a concise architecture review in markdown with EXACTLY these sections:

## Overview
2-3 sentences on the overall shape and health of the codebase.

## Strengths
- bullet points

## Top Risks
Ranked bullet list. Reference concrete file names from the digest. Explain WHY each is a risk.

## Refactor Plan
Concrete, ordered steps. Name the files to touch and what to do.

## Verdict
One short paragraph. Mention the health score and whether it matches your read of the structure.

Rules:
- Be direct and specific — no generic advice like "write tests" unless the digest supports it
- Use **bold** for key terms and \`backticks\` for file names
- Keep the whole review under 400 words`

/**
 * Build a compact text digest of the analysis graph for an LLM review.
 * Deterministic and capped in size so prompts stay small.
 *
 * @param {Object} input
 * @param {Array} input.nodes - Analysis nodes ({ id, type, isGhost, imports, importedBy })
 * @param {Array} input.cyclicEdges - Cyclic edge pairs
 * @param {number} [input.unresolvedImports] - Count of unresolved imports
 * @param {Object|null} input.stats - Run stats (may include healthScore/healthGrade)
 * @returns {string}
 */
export function buildReviewDigest({ nodes = [], cyclicEdges = [], unresolvedImports = 0, stats = null } = {}) {
  const files = (Array.isArray(nodes) ? nodes : [])
    .map((node) => ({
      id: node?.id,
      isGhost: node?.isGhost ?? node?.data?.isGhost ?? false,
      imports: node?.imports ?? node?.data?.imports ?? [],
      importedBy: node?.importedBy ?? node?.data?.importedBy ?? [],
    }))
    .filter((node) => node.id && !node.isGhost)
  const cycles = cyclicEdges.length > 0 ? Math.round(cyclicEdges.length / 2) : 0
  const orphans = files.filter(
    (node) => (node.imports?.length || 0) === 0 && (node.importedBy?.length || 0) === 0
  )
  const coupled = files
    .map((node) => ({
      id: node.id,
      fanIn: node.importedBy?.length || 0,
      fanOut: node.imports?.length || 0,
    }))
    .sort((a, b) => b.fanIn + b.fanOut - (a.fanIn + a.fanOut))
    .slice(0, MAX_COUPLED)
  const godComponents = files.filter(
    (node) =>
      (node.importedBy?.length || 0) >= GOD_FAN_IN_THRESHOLD ||
      (node.imports?.length || 0) >= GOD_FAN_OUT_THRESHOLD
  )

  const lines = []
  lines.push('PROJECT DIGEST')
  if (stats) {
    lines.push(
      `Files: ${stats.totalFiles ?? files.length} | Components: ${stats.totalComponents ?? '?'} | ` +
      `Hooks: ${stats.totalHooks ?? '?'} | Contexts: ${stats.totalContexts ?? '?'} | Pages: ${stats.totalPages ?? '?'}`
    )
    if (typeof stats.healthScore === 'number') {
      lines.push(`Health Score: ${stats.healthScore}/100${stats.healthGrade ? ` (${stats.healthGrade})` : ''}`)
    }
  } else {
    lines.push(`Files: ${files.length}`)
  }

  lines.push('')
  lines.push(`CYCLES (${cycles}):`)
  if (cycles === 0) {
    lines.push('none')
  } else {
    const seen = new Set()
    const entries = []
    for (const edge of cyclicEdges) {
      const pairKey = [edge.source, edge.target].sort().join('::')
      if (seen.has(pairKey)) continue
      seen.add(pairKey)
      if (entries.length < MAX_CYCLES) entries.push(`${edge.source} <-> ${edge.target}`)
    }
    lines.push(...entries)
    if (cycles > MAX_CYCLES) lines.push(`...and ${cycles - MAX_CYCLES} more`)
  }

  lines.push('')
  lines.push(`ORPHANS (${orphans.length}):`)
  if (orphans.length === 0) {
    lines.push('none')
  } else {
    lines.push(orphans.slice(0, MAX_ORPHANS).map((node) => node.id).join(', '))
    if (orphans.length > MAX_ORPHANS) lines.push(`...and ${orphans.length - MAX_ORPHANS} more`)
  }

  lines.push('')
  lines.push('MOST CONNECTED FILES:')
  for (const entry of coupled) {
    lines.push(`${entry.id} (used by ${entry.fanIn}, imports ${entry.fanOut})`)
  }

  lines.push('')
  lines.push(`GOD COMPONENTS (fan-in >= ${GOD_FAN_IN_THRESHOLD} or fan-out >= ${GOD_FAN_OUT_THRESHOLD}): ${godComponents.length}`)

  const deadFiles = safeNodesForDead(nodes)
    .filter((node) => node.deadExports.length > 0)
    .sort((a, b) => b.deadExports.length - a.deadExports.length)
    .slice(0, MAX_COUPLED)
  lines.push(`DEAD EXPORTS (${deadFiles.reduce((sum, f) => sum + f.deadExports.length, 0)}):`)
  if (deadFiles.length === 0) {
    lines.push('none')
  } else {
    for (const file of deadFiles) {
      lines.push(`${file.id}: ${file.deadExports.join(', ')}`)
    }
  }

  lines.push(`UNRESOLVED IMPORTS: ${unresolvedImports}`)

  return lines.join('\n')
}

function normalizeNode(node) {
  return {
    id: node?.id,
    isGhost: node?.isGhost ?? node?.data?.isGhost ?? false,
    deadExports: node?.deadExports ?? node?.data?.deadExports ?? [],
  }
}

function safeNodesForDead(rawNodes) {
  return (Array.isArray(rawNodes) ? rawNodes : [])
    .map(normalizeNode)
    .filter((node) => node.id && !node.isGhost)
}
