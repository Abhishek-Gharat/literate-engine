/**
 * Export utilities for ReactViz
 * Handles PNG, SVG, and JSON exports of the graph and analysis data
 *
 * The graph is exported as *native* SVG (real <rect>/<path>/<text> elements).
 * The previous implementation wrapped the React Flow DOM in a <foreignObject>,
 * which browsers refuse to rasterise when an SVG is loaded through an <img>,
 * so the PNG export always failed with "Failed to load image for PNG export".
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

const EXPORT_PADDING = 48
const MAX_EXPORT_DIMENSION = 4000

/**
 * Trigger a file download from blob/data URL
 */
function triggerDownload(data, filename, mimeType) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value))
  }
  return el
}

function parseTranslate(transform) {
  const match = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)/.exec(transform || '')
  if (!match) return { x: 0, y: 0 }
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
}

function safeColor(value, fallback) {
  if (!value || value === 'rgba(0, 0, 0, 0)' || value === 'transparent') return fallback
  return value
}

/**
 * Read the rendered graph straight from the DOM so the export matches exactly
 * what the user sees (positions, sizes, colors and labels).
 */
function readGraphFromDom(reactFlowWrapper) {
  const nodeElements = [...reactFlowWrapper.querySelectorAll('.react-flow__node')]

  const nodes = nodeElements.map((el) => {
    const position = parseTranslate(el.style.transform)
    const card = el.firstElementChild || el
    const cardStyle = getComputedStyle(card)
    const typeEl = el.querySelector('[data-node-type]')
    const labelEl = el.querySelector('[data-node-label]')
    const statsEl = el.querySelector('[data-node-stats]')

    return {
      id: el.getAttribute('data-id') || '',
      x: position.x,
      y: position.y,
      width: el.offsetWidth || 200,
      height: el.offsetHeight || 70,
      opacity: parseFloat(getComputedStyle(el).opacity) || 1,
      fill: safeColor(cardStyle.backgroundColor, 'rgba(13, 17, 28, 0.92)'),
      stroke: safeColor(cardStyle.borderRightColor, 'rgba(255, 255, 255, 0.1)'),
      strokeWidth: parseFloat(cardStyle.borderRightWidth) || 1,
      accentColor: safeColor(cardStyle.borderTopColor, '#818cf8'),
      accentWidth: parseFloat(cardStyle.borderTopWidth) || 2.5,
      leftAccentColor: safeColor(cardStyle.borderLeftColor, null),
      leftAccentWidth: parseFloat(cardStyle.borderLeftWidth) || 1,
      typeColor: typeEl ? getComputedStyle(typeEl).color : '#94a3b8',
      typeText: typeEl ? typeEl.textContent.trim() : '',
      label: labelEl ? labelEl.textContent.trim() : '',
      stats: statsEl ? statsEl.textContent.replace(/\s+/g, ' ').trim() : '',
    }
  })

  const edges = [...reactFlowWrapper.querySelectorAll('.react-flow__edge')]
    .map((el) => {
      const path = el.querySelector('path')
      if (!path) return null
      const d = path.getAttribute('d')
      if (!d) return null
      const pathStyle = getComputedStyle(path)
      return {
        d,
        stroke: safeColor(pathStyle.stroke, '#4f46e5'),
        strokeWidth: parseFloat(pathStyle.strokeWidth) || 2,
        opacity: parseFloat(pathStyle.strokeOpacity) || 1,
      }
    })
    .filter(Boolean)

  return { nodes, edges }
}

function computeGraphBounds(nodes) {
  if (!nodes.length) return { x: 0, y: 0, width: 800, height: 600 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.width)
    maxY = Math.max(maxY, node.y + node.height)
  }
  return {
    x: minX - EXPORT_PADDING,
    y: minY - EXPORT_PADDING,
    width: maxX - minX + EXPORT_PADDING * 2,
    height: maxY - minY + EXPORT_PADDING * 2,
  }
}

function appendText(svg, { x, y, text, fill, fontSize, fontFamily, fontWeight, letterSpacing }) {
  const node = createSvgElement('text', {
    x,
    y,
    fill: fill || '#e2e8f0',
    'font-size': fontSize || 12,
    'font-family': fontFamily || 'Inter, system-ui, sans-serif',
    'font-weight': fontWeight || 500,
    'letter-spacing': letterSpacing || 0,
    'dominant-baseline': 'middle',
  })
  node.textContent = text
  svg.appendChild(node)
  return node
}

/**
 * Build a standalone SVG document describing the graph with native elements.
 */
function buildGraphSvg({ nodes, edges }) {
  const bounds = computeGraphBounds(nodes)

  const svg = createSvgElement('svg', {
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`,
  })

  svg.appendChild(createSvgElement('rect', {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    fill: '#0a0a12',
  }))

  for (const edge of edges) {
    svg.appendChild(createSvgElement('path', {
      d: edge.d,
      fill: 'none',
      stroke: edge.stroke,
      'stroke-width': edge.strokeWidth,
      'stroke-linecap': 'round',
      opacity: edge.opacity,
    }))
  }

  for (const node of nodes) {
    const group = createSvgElement('g', { opacity: node.opacity })

    group.appendChild(createSvgElement('rect', {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      rx: 12,
      ry: 12,
      fill: node.fill,
      stroke: node.stroke,
      'stroke-width': node.strokeWidth,
    }))

    // Accent edges (type colour on top, heat/risk colour on the left)
    group.appendChild(createSvgElement('line', {
      x1: node.x + 6,
      y1: node.y + node.accentWidth / 2,
      x2: node.x + node.width - 6,
      y2: node.y + node.accentWidth / 2,
      stroke: node.accentColor,
      'stroke-width': node.accentWidth,
      'stroke-linecap': 'round',
    }))

    if (node.leftAccentColor && node.leftAccentWidth > 1) {
      group.appendChild(createSvgElement('line', {
        x1: node.x + node.leftAccentWidth / 2,
        y1: node.y + 8,
        x2: node.x + node.leftAccentWidth / 2,
        y2: node.y + node.height - 8,
        stroke: node.leftAccentColor,
        'stroke-width': node.leftAccentWidth,
        'stroke-linecap': 'round',
      }))
    }

    appendText(group, {
      x: node.x + 12,
      y: node.y + 17,
      text: node.typeText.toUpperCase(),
      fill: node.typeColor,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 0.8,
    })

    appendText(group, {
      x: node.x + 12,
      y: node.y + 40,
      text: node.label,
      fill: '#f8fafc',
      fontSize: 12.5,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontWeight: 600,
    })

    if (node.stats) {
      appendText(group, {
        x: node.x + 12,
        y: node.y + node.height - 14,
        text: node.stats,
        fill: '#94a3b8',
        fontSize: 10.5,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontWeight: 600,
      })
    }

    svg.appendChild(group)
  }

  return svg
}

/**
 * Export graph as PNG by rasterising the native SVG drawing
 */
export async function exportGraphAsPNG(reactFlowWrapper, filename = 'reactviz-graph') {
  if (!reactFlowWrapper) {
    console.error('[Export] GraphCanvas wrapper ref is null')
    return false
  }

  const graph = readGraphFromDom(reactFlowWrapper)
  if (!graph.nodes.length) {
    console.error('[Export] No nodes to export')
    return false
  }

  const svg = buildGraphSvg(graph)
  const bounds = computeGraphBounds(graph.nodes)
  const svgString = new XMLSerializer().serializeToString(svg)

  const scale = Math.min(2, MAX_EXPORT_DIMENSION / Math.max(bounds.width, bounds.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bounds.width * scale)
  canvas.height = Math.round(bounds.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve()
      }
      img.onerror = () => reject(new Error('The graph could not be rasterised for PNG export.'))
      img.src = url
    })
  } catch (error) {
    console.error('[Export] PNG export failed:', error.message)
    return false
  } finally {
    URL.revokeObjectURL(url)
  }

  const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.png`
  const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!pngBlob) {
    console.error('[Export] PNG encoding failed')
    return false
  }
  triggerDownload(pngBlob, finalFilename, 'image/png')
  return true
}

/**
 * Export graph as SVG file
 */
export async function exportGraphAsSVG(reactFlowWrapper, filename = 'reactviz-graph') {
  if (!reactFlowWrapper) {
    console.error('[Export] GraphCanvas wrapper ref is null')
    return false
  }

  const graph = readGraphFromDom(reactFlowWrapper)
  if (!graph.nodes.length) {
    console.error('[Export] No nodes to export')
    return false
  }

  const svg = buildGraphSvg(graph)
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg)
  const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.svg`
  triggerDownload(svgString, finalFilename, 'image/svg+xml;charset=utf-8')
  return true
}

/**
 * Export analysis data as JSON
 */
export function exportAnalysisAsJSON(data, filename = 'reactviz-analysis') {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    ...data
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.json`
  triggerDownload(jsonString, finalFilename, 'application/json')
}

/**
 * Get a snapshot of current graph state
 */
export function getGraphSnapshot(nodes, edges, stats, cyclicEdges) {
  return {
    timestamp: new Date().toISOString(),
    stats,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    cyclicDependencyCount: cyclicEdges?.length || 0,
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.data?.nodeType,
      label: n.data?.label,
      position: n.position,
      imports: n.data?.imports,
      importedBy: n.data?.importedBy,
      isGhost: n.data?.isGhost,
      isEntryPoint: n.data?.isEntryPoint,
    })),
    edges: edges.map(e => ({
      source: e.source,
      target: e.target,
      cyclic: e.data?.cyclic,
    })),
    cyclicEdges: cyclicEdges || [],
  }
}
