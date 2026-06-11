import { useState, useCallback } from 'react'

/**
 * useNodeSelection - Hook for managing node selection state in the graph
 * 
 * @returns {Object} Node selection state and handlers
 * @property {Object|null} selectedNode - Currently selected node data
 * @property {boolean} showInspector - Whether inspector panel is visible
 * @property {function} selectNode - Handler to select a node
 * @property {function} deselectNode - Handler to deselect current node
 * @property {function} toggleInspector - Handler to toggle inspector visibility
 * @property {function} closeInspector - Handler to close inspector panel
 */
export function useNodeSelection() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [showInspector, setShowInspector] = useState(false)

  const selectNode = useCallback((node) => {
    setSelectedNode(node?.data || node)
    setShowInspector(true)
  }, [])

  const deselectNode = useCallback(() => {
    setSelectedNode(null)
    setShowInspector(false)
  }, [])

  const toggleInspector = useCallback(() => {
    setShowInspector(prev => !prev)
  }, [])

  const closeInspector = useCallback(() => {
    setShowInspector(false)
    setSelectedNode(null)
  }, [])

  return {
    selectedNode,
    showInspector,
    selectNode,
    deselectNode,
    toggleInspector,
    closeInspector,
  }
}
