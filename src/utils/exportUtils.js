/**
 * Export utilities for ReactViz
 * Handles PNG, SVG, and JSON exports of the graph and analysis data
 */

/**
 * Trigger a file download from blob/data URL
 */
function triggerDownload(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export graph as PNG by capturing the ReactFlow canvas
 */
export async function exportGraphAsPNG(reactFlowWrapper, filename = 'reactviz-graph') {
  if (!reactFlowWrapper) {
    console.error('GraphCanvas wrapper ref is null')
    return
  }

  // Find the ReactFlow pane element which contains the rendered graph
  const pane = reactFlowWrapper.querySelector('.react-flow__pane')
  const viewport = reactFlowWrapper.querySelector('.react-flow__viewport')

  if (!pane || !viewport) {
    console.error('Could not find ReactFlow elements', { pane: !!pane, viewport: !!viewport })
    return
  }

  // Get the actual dimensions of the graph content
  const bounds = viewport.getBoundingClientRect()
  const wrapperBounds = reactFlowWrapper.getBoundingClientRect()

  // Create canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Add padding around the graph
  const padding = 40
  canvas.width = wrapperBounds.width + padding * 2
  canvas.height = wrapperBounds.height + padding * 2

  // Fill with dark background
  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create SVG representation of the graph
  const svgData = await exportGraphAsSVGData(reactFlowWrapper)
  if (!svgData) {
    console.error('Failed to generate SVG data for PNG export')
    return
  }

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Center the image with padding
      ctx.drawImage(img, padding, padding)

      // Convert to PNG and download
      const pngData = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`
      link.href = pngData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      resolve()
    }

    img.onerror = (err) => {
      console.error('Failed to load image for PNG export:', err)
      reject(err)
    }

    img.src = svgData
  })
}

/**
 * Export graph as SVG file
 */
export async function exportGraphAsSVG(reactFlowWrapper, filename = 'reactviz-graph') {
  if (!reactFlowWrapper) {
    console.error('GraphCanvas wrapper ref is null')
    return
  }

  const svgData = await exportGraphAsSVGData(reactFlowWrapper)
  if (!svgData) {
    console.error('Failed to generate SVG data')
    return
  }

  const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.svg`
  triggerDownload(svgData, finalFilename, 'image/svg+xml;charset=utf-8')
}

/**
 * Get SVG data from ReactFlow
 */
async function exportGraphAsSVGData(reactFlowWrapper) {
  if (!reactFlowWrapper) return null

  const viewport = reactFlowWrapper.querySelector('.react-flow__viewport')
  const pane = reactFlowWrapper.querySelector('.react-flow__pane')

  if (!viewport) {
    console.error('Could not find ReactFlow viewport')
    return null
  }

  // Get dimensions from the wrapper
  const wrapperRect = reactFlowWrapper.getBoundingClientRect()
  const width = wrapperRect.width
  const height = wrapperRect.height

  // Clone the viewport for SVG serialization
  const clone = viewport.cloneNode(true)

  // Create SVG wrapper
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('xmlns', svgNS)

  // Add dark background
  const rect = document.createElementNS(svgNS, 'rect')
  rect.setAttribute('width', '100%')
  rect.setAttribute('height', '100%')
  rect.setAttribute('fill', '#0a0a12')
  svg.appendChild(rect)

  // Convert HTML to foreignObject
  const foreignObject = document.createElementNS(svgNS, 'foreignObject')
  foreignObject.setAttribute('width', width)
  foreignObject.setAttribute('height', height)
  foreignObject.setAttribute('x', 0)
  foreignObject.setAttribute('y', 0)

  // Clone content into a div
  const div = document.createElement('div')
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  div.style.position = 'relative'
  div.innerHTML = clone.innerHTML

  // Add essential styles inline for SVG export
  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; }
    .react-flow__node {
      position: absolute;
      transform-origin: center;
    }
    .react-flow__edge {
      position: absolute;
      pointer-events: none;
    }
    .react-flow__edge-path {
      fill: none;
      stroke-width: 2;
    }
  `
  div.appendChild(style)

  foreignObject.appendChild(div)
  svg.appendChild(foreignObject)

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)

  // Add XML declaration
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString
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
