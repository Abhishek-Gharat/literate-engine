/**
 * Re-render Risk Utilities
 * Aggregates React signals extracted by the analysis engine into ranked
 * re-render risk lists.
 */

const WIDE_USE_THRESHOLD = 6

function normalize(nodes) {
  return (Array.isArray(nodes) ? nodes : [])
    .map((node) => ({
      id: node?.id,
      importedBy: node?.importedBy ?? node?.data?.importedBy ?? [],
      signals: node?.signals ?? node?.data?.signals ?? null,
    }))
    .filter((node) => node.id && node.signals)
}

/**
 * @returns {{ contexts: Array, wideUnmemoized: Array }}
 *   contexts: [{ name, consumers, files }] sorted most-consumed first (top 8)
 *   wideUnmemoized: [{ id, fanIn }] widely-used components without memoization
 */
export function getRerenderRisks(nodes) {
  const consumerMap = new Map()
  const wideUnmemoized = []

  for (const node of normalize(nodes)) {
    const fanIn = node.importedBy.length
    for (const contextName of node.signals.contextConsumers || []) {
      if (!consumerMap.has(contextName)) consumerMap.set(contextName, new Set())
      consumerMap.get(contextName).add(node.id)
    }
    if (!node.signals.memoized && fanIn >= WIDE_USE_THRESHOLD) {
      wideUnmemoized.push({ id: node.id, fanIn })
    }
  }

  const contexts = [...consumerMap.entries()]
    .map(([name, files]) => ({ name, consumers: files.size, files: [...files].sort() }))
    .sort((a, b) => b.consumers - a.consumers || a.name.localeCompare(b.name))
    .slice(0, 8)

  wideUnmemoized.sort((a, b) => b.fanIn - a.fanIn || a.id.localeCompare(b.id))

  return { contexts, wideUnmemoized: wideUnmemoized.slice(0, 8) }
}

/** Risk level used by the canvas ⚛ mode: 0 none … 3 critical */
export function riskLevelFor(signals) {
  if (!signals) return 0
  const consumers = signals.contextConsumers?.length || 0
  if (consumers >= 5) return 3
  if (consumers >= 3) return 2
  if (consumers >= 2) return 1
  return 0
}
