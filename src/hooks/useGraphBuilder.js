import { useState, useCallback } from 'react'
import { analyzeFilesWithApi } from '../services/analysisApi'
import { analyzeFilesLocally, localFallbackEnabled } from '../services/localAnalysisFallback'
import { adaptAnalysisToGraph } from '../utils/graphAdapter'

export function useGraphBuilder() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [depMap, setDepMap] = useState({})
  const [cyclicEdges, setCyclicEdges] = useState([])
  const [stats, setStats] = useState(null)
  const [analysisErrors, setAnalysisErrors] = useState([])
  const [unresolvedImports, setUnresolvedImports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [runId, setRunId] = useState(null)

  const applyAnalysis = useCallback((analysis) => {
    const { nodes: graphNodes, edges: graphEdges } = adaptAnalysisToGraph(analysis, 'TB')

    setDepMap(analysis.depMap)
    setCyclicEdges(analysis.cyclicEdges)
    setStats(analysis.stats)
    setAnalysisErrors(analysis.analysisErrors)
    setUnresolvedImports(analysis.unresolvedImports)
    setNodes(graphNodes)
    setEdges(graphEdges)
    // runId is set when building graph with a project
    if (analysis.runId) {
      setRunId(analysis.runId)
    }
  }, [])

  const buildGraph = useCallback(async (files, projectId = null) => {
    setLoading(true)
    setError('')
    setRunId(null)

    try {
      let analysis
      
      // Check if we should skip API and go straight to local analysis
      const apiUrl = import.meta.env.VITE_REACTVIZ_API_URL
      const shouldTryApi = apiUrl && apiUrl.trim() !== ''
      
      if (shouldTryApi) {
        try {
          analysis = await analyzeFilesWithApi(files, projectId)
        } catch (apiError) {
          console.log('API failed, falling back to local analysis:', apiError.message)
          if (!localFallbackEnabled()) {
            throw apiError
          }
          analysis = await analyzeFilesLocally(files)
        }
      } else {
        // No API configured, use local analysis directly
        console.log('No API URL configured, using local analysis')
        analysis = await analyzeFilesLocally(files)
      }

      applyAnalysis(analysis)
      return analysis
    } catch (buildError) {
      setNodes([])
      setEdges([])
      setError(buildError.message)
      throw buildError
    } finally {
      setLoading(false)
    }
  }, [applyAnalysis])

  const loadSnapshot = useCallback((snapshot) => {
    const adapted = adaptAnalysisToGraph(snapshot, 'TB')
    setDepMap(snapshot.depMap || {})
    setCyclicEdges(snapshot.cyclicEdges || [])
    setStats(snapshot.stats || null)
    setAnalysisErrors(snapshot.analysisErrors || [])
    setUnresolvedImports(snapshot.unresolvedImports || [])
    setNodes(adapted.nodes)
    setEdges(adapted.edges)
    setRunId(snapshot.runId || null)
  }, [])

  const resetGraph = useCallback(() => {
    setNodes([])
    setEdges([])
    setDepMap({})
    setCyclicEdges([])
    setStats(null)
    setAnalysisErrors([])
    setUnresolvedImports([])
    setRunId(null)
    setError('')
  }, [])

  return {
    nodes,
    edges,
    depMap,
    cyclicEdges,
    stats,
    analysisErrors,
    unresolvedImports,
    loading,
    error,
    runId,
    buildGraph,
    loadSnapshot,
    resetGraph,
  }
}
