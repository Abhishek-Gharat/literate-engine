// Vite ?worker syntax — bundled at build time, zero runtime overhead.
// The worker is a module so it can use ESM imports.
import LayoutWorker from './elkLayout.worker.js?worker'

const NODE_WIDTH = 200
const NODE_HEIGHT = 70

// Module-level singleton — one worker shared across all layout requests.
// Created lazily on first use, kept alive across graph loads for warm starts.
let _worker = null
let _requestCounter = 0
const _pending = new Map()   // requestId → { resolve, reject }

function getWorker() {
  if (_worker) return _worker
  try {
    _worker = new LayoutWorker()

    _worker.onmessage = ({ data }) => {
      const handler = _pending.get(data.requestId)
      if (!handler) return   // stale response (cancelled caller already gave up)
      _pending.delete(data.requestId)

      if (data.type === 'layout_complete') {
        handler.resolve(data)
      } else {
        handler.reject(new Error(data.error || 'ELK layout failed'))
      }
    }

    _worker.onerror = (e) => {
      // Worker crashed — reject all in-flight requests then reset
      for (const [, { reject }] of _pending) {
        reject(new Error(`Worker error: ${e.message}`))
      }
      _pending.clear()
      _worker = null
    }
  } catch {
    // Worker instantiation failed (e.g. CSP, old browser) — caller falls back to dagre
    return null
  }
  return _worker
}

/**
 * Run ELK layout in the background worker.
 *
 * @param {object[]} nodes   – React Flow node objects (full shape)
 * @param {object[]} edges   – React Flow edge objects (full shape)
 * @param {'DOWN'|'RIGHT'} direction – ELK direction; 'DOWN' = TB, 'RIGHT' = LR
 * @returns {Promise<object[]>} – nodes with updated position, sourcePosition, targetPosition
 */
export async function applyElkLayout(nodes, edges, direction = 'DOWN') {
  const worker = getWorker()
  if (!worker) throw new Error('ELK worker unavailable')

  const requestId = ++_requestCounter

  // Send only what ELK needs — serialisation is expensive, keep it minimal
  const nodeIds = new Set(nodes.map((n) => n.id))
  const elkNodes = nodes.map((n) => ({ id: n.id, width: NODE_WIDTH, height: NODE_HEIGHT }))
  const elkEdges = edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }))

  const result = await new Promise((resolve, reject) => {
    _pending.set(requestId, { resolve, reject })
    worker.postMessage({ type: 'layout', requestId, direction, nodes: elkNodes, edges: elkEdges })
  })

  const rfDirection = direction === 'RIGHT' ? 'LR' : 'TB'

  // Spread the full node (preserving data, type, id, etc.) then overwrite position/handles.
  // ELK returns top-left coordinates — no centering adjustment needed (unlike dagre).
  return nodes.map((n) => ({
    ...n,
    position: result.positions[n.id] ?? n.position,
    sourcePosition: rfDirection === 'LR' ? 'right' : 'bottom',
    targetPosition: rfDirection === 'LR' ? 'left' : 'top',
  }))
}

/**
 * Terminate the shared worker and reject all in-flight layout requests.
 * Call this from a cleanup useEffect when the consuming component unmounts.
 */
export function terminateLayoutWorker() {
  if (!_worker) return
  _worker.terminate()
  for (const [, { reject }] of _pending) {
    reject(new Error('ELK worker terminated'))
  }
  _pending.clear()
  _worker = null
}
