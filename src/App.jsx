import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import FileInput from './components/FileInput'
import GraphCanvas from './components/GraphCanvas'
import NodeInspector from './components/NodeInspector'
import NodesLegend from './components/NodesLegend'
import { IssuesPanel } from './components/IssuesPanel'
import { useGraphBuilder } from './hooks/useGraphBuilder'
import { useAIExplain } from './hooks/useAIExplain'
import { useNodeSelection } from './hooks/useNodeSelection'
import { useApiKey } from './hooks/useApiKey'
import { ImportList } from './components/NodeCard'
import { getNodeColor } from './utils/nodeColors.js'
import { computeBlastRadius } from './utils/impactAnalysis.js'
import { buildReviewDigest } from './utils/reviewBuilder.js'
import { useArchReview } from './hooks/useArchReview.js'
import ReviewModal from './components/review/ReviewModal.jsx'
import { useRefactorPlan } from './hooks/useRefactorPlan.js'
import RefactorModal from './components/refactor/RefactorModal.jsx'
import SettingsModal from './components/modals/SettingsModal.jsx'
import CreateProjectModal from './components/modals/CreateProjectModal.jsx'
import ProjectOverview from './components/projects/ProjectOverview.jsx'
import { listProjects, createProject } from './services/projectsApi.js'
import { listRuns, getRun } from './services/runsApi.js'
import { COLORS } from './styles/constants.js'
import { DEMO_ANALYSIS_RESULT, DEMO_STATS } from './demo/demoData.js'
import { ArchitectureToolbar } from './components/architecture/ArchitectureToolbar.jsx'
import { prioritizeIssues } from './utils/issuePrioritizer.js'
import { evaluateNodeFilter } from './utils/architectureFilters.js'
import { diffRuns } from './utils/runDiff.js'
import { AnimateTabs, AnimateTooltip } from './components/ui/animate'

export default function App() {
  const {
    buildGraph,
    loadSnapshot,
    resetGraph,
    nodes,
    edges,
    cyclicEdges,
    depMap,
    stats,
    unresolvedImports,
    loading: analysisLoading,
    error: analysisError
  } = useGraphBuilder()

  const { messages, loading: aiLoading, error: aiError, sendMessage, clearChat } = useAIExplain()
  const { selectedNode, selectNode, closeInspector } = useNodeSelection()
  const { apiKey, handleApiKeyChange } = useApiKey()
  const review = useArchReview()
  const refactorPlan = useRefactorPlan()

  // Navigation and Workspace state
  // Levels: Level 1 (Global Shell), Level 2 (Project), Level 3 (Run / Mode), Level 4 (Canvas Workspace)
  const [navTab, setNavTab] = useState('overview') // 'overview' | 'architecture' | 'runs' | 'import'
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  // Modals & Panels
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)

  // Workspace sub-state
  const [activeFiles, setActiveFiles] = useState([])
  const [refactorIssue, setRefactorIssue] = useState(null)
  const [showRefactor, setShowRefactor] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [search, setSearch] = useState('')
  const [sidebarTab, setSidebarTab] = useState('info')
  const [showImpact, setShowImpact] = useState(false)
  const [issuesPanelOpen, setIssuesPanelOpen] = useState(false)
  const [hasAutoOpenedIssues, setHasAutoOpenedIssues] = useState(false)
  const [isAiInspectorOpen, setIsAiInspectorOpen] = useState(false)

  // Architecture Filters state
  const [typeFilter, setTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [issueFilter, setIssueFilter] = useState('all')

  const graphCanvasRef = useRef(null)
  const projectMenuRef = useRef(null)

  // Prioritized architecture issues from real graph signals
  const prioritizedIssues = useMemo(() => {
    return prioritizeIssues({ nodes, edges, cyclicEdges, stats, unresolvedImports })
  }, [nodes, edges, cyclicEdges, stats, unresolvedImports])

  // Run diff: compare selectedRun vs latest run in the project (only meaningful if not the latest)
  const runDiffResult = useMemo(() => {
    if (!selectedRun || !runs || runs.length < 2) return null
    const latestRun = runs[0]
    if (!latestRun || latestRun.id === selectedRun.id) return null
    return diffRuns(selectedRun, latestRun)
  }, [selectedRun, runs])

  // Filtered node IDs based on active type, risk, and issue filters
  const filteredNodeIds = useMemo(() => {
    const isFiltered = typeFilter !== 'all' || riskFilter !== 'all' || issueFilter !== 'all'
    if (!isFiltered) return null

    const cyclicNodeIds = new Set()
    for (const ce of cyclicEdges || []) {
      if (ce.source) cyclicNodeIds.add(ce.source)
      if (ce.target) cyclicNodeIds.add(ce.target)
    }

    const unresolvedNodeIds = new Set()
    for (const item of unresolvedImports || []) {
      const src = item.source || item.file
      if (src) unresolvedNodeIds.add(src)
    }
    for (const n of nodes) {
      if (n.unresolvedImports?.length || n.data?.unresolvedImports?.length) {
        unresolvedNodeIds.add(n.id)
      }
    }

    const highImpactNodeIds = new Set()
    for (const n of nodes) {
      const fanIn = n.importedBy?.length || n.data?.importedBy?.length || 0
      if (fanIn >= 8) highImpactNodeIds.add(n.id)
    }

    const matching = []
    for (const n of nodes) {
      if (evaluateNodeFilter(n, {
        typeFilter,
        riskFilter,
        issueFilter,
        cyclicNodeIds,
        unresolvedNodeIds,
        highImpactNodeIds,
      })) {
        matching.push(n.id)
      }
    }
    return matching
  }, [nodes, cyclicEdges, typeFilter, riskFilter, issueFilter, unresolvedImports])

  // Demo run representation for runs history
  const demoRunItem = useMemo(() => ({
    id: 'demo-run',
    projectId: 'demo-project',
    createdAt: '2026-10-05T12:00:00.000Z',
    stats: DEMO_STATS,
    snapshot: DEMO_ANALYSIS_RESULT,
    unresolvedImports: [],
    analysisErrors: []
  }), [])

  // Sync state to URL search parameters for back/forward navigation and refresh persistence
  const syncStateToUrl = useCallback((project, tab, run) => {
    try {
      const url = new URL(window.location.href)
      if (project) {
        url.searchParams.set('project', project.id === 'demo-project' ? 'demo' : project.id)
      } else {
        url.searchParams.delete('project')
      }
      if (tab) {
        url.searchParams.set('tab', tab)
      } else {
        url.searchParams.delete('tab')
      }
      if (run) {
        url.searchParams.set('run', run.id)
      } else {
        url.searchParams.delete('run')
      }
      window.history.pushState(null, '', url.pathname + url.search)
    } catch {
      // Browser environment fallback
    }
  }, [])

  // Load a specific run snapshot into the graph state
  const handleLoadRun = useCallback((snapshot, run) => {
    setTypeFilter('all')
    setRiskFilter('all')
    setIssueFilter('all')
    setSearch('')
    setShowImpact(false)
    closeInspector()
    setIsAiInspectorOpen(false)
    loadSnapshot({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      depMap: snapshot.depMap,
      cyclicEdges: snapshot.cyclicEdges,
      stats: run.stats,
      unresolvedImports: run.unresolvedImports || snapshot.unresolvedImports || [],
      analysisErrors: run.analysisErrors || snapshot.analysisErrors || [],
      runId: run.id
    })
    setSelectedRun(run)
    setNavTab('architecture')
  }, [loadSnapshot, closeInspector])

  // Demo Project Launcher
  const handleTryDemo = useCallback((targetTab = 'overview') => {
    setIsProjectMenuOpen(false)
    setTypeFilter('all')
    setRiskFilter('all')
    setIssueFilter('all')
    setSearch('')
    const demoProj = {
      id: 'demo-project',
      name: 'ShopApp Demo',
      description: 'Interactive demo project showcasing React architecture features',
      runCount: 1,
      _demo: true
    }
    setSelectedProject(demoProj)
    setRuns([demoRunItem])
    setSelectedRun(demoRunItem)
    handleLoadRun(DEMO_ANALYSIS_RESULT, demoRunItem)
    setDemoMode(true)
    setNavTab(targetTab)
    syncStateToUrl(demoProj, targetTab, demoRunItem)
  }, [handleLoadRun, demoRunItem, syncStateToUrl])

  // The runs list endpoint returns metadata only (no snapshot). Fetch the full
  // run detail for the runs the UI needs up front, otherwise the architecture
  // view opens empty when a run is linked via the URL.
  const loadRunDetail = useCallback(async (run) => {
    if (!run) return null
    if (run.snapshot) return run
    try {
      const full = await getRun(run.id)
      if (full?.snapshot) return { ...run, ...full }
    } catch (e) {
      console.warn('Failed to load run details:', e)
    }
    return run
  }, [])

  const hydrateRuns = useCallback(async (runList, extraIds = []) => {
    if (!Array.isArray(runList) || runList.length === 0) return runList || []
    const targets = new Set([runList[0]?.id, ...extraIds].filter(Boolean))
    const hydrated = []
    for (const run of runList) {
      hydrated.push(targets.has(run.id) ? await loadRunDetail(run) : run)
    }
    return hydrated
  }, [loadRunDetail])

  // Exit demo cleanly without leaving stale demo data
  const handleExitDemo = useCallback(() => {
    setDemoMode(false)
    setTypeFilter('all')
    setRiskFilter('all')
    setIssueFilter('all')
    setSearch('')
    resetGraph()
    closeInspector()
    setIsAiInspectorOpen(false)
    setShowImpact(false)
    setShowRefactor(false)
    setRefactorIssue(null)
    if (projects.length > 0) {
      const first = projects[0]
      setSelectedProject(first)
      listRuns(first.id).then(async r => {
        setRuns(await hydrateRuns(r))
        setSelectedRun(null)
        setNavTab('overview')
        syncStateToUrl(first, 'overview', null)
      })
    } else {
      setSelectedProject(null)
      setSelectedRun(null)
      setRuns([])
      setNavTab('overview')
      syncStateToUrl(null, 'overview', null)
    }
  }, [resetGraph, closeInspector, projects, syncStateToUrl, hydrateRuns])

  // Select project handler (Project Home / Overview by default)
  const handleSelectProject = useCallback(async (project) => {
    if (!project) return
    setIsProjectMenuOpen(false)
    setDemoMode(false)
    setTypeFilter('all')
    setRiskFilter('all')
    setIssueFilter('all')
    setSearch('')
    setSelectedProject(project)
    setSelectedRun(null)
    resetGraph()
    closeInspector()
    setIsAiInspectorOpen(false)
    setShowImpact(false)
    setShowRefactor(false)
    setRefactorIssue(null)
    setNavTab('overview')

    try {
      const projectRuns = await listRuns(project.id)
      setRuns(await hydrateRuns(projectRuns))
      syncStateToUrl(project, 'overview', null)
    } catch (err) {
      console.error('Failed to fetch runs for project:', err)
    }
  }, [resetGraph, closeInspector, syncStateToUrl, hydrateRuns])

  // Load project list on mount and handle initial URL state / refresh restoration
  useEffect(() => {
    async function init() {
      try {
        const allProjects = await listProjects()
        setProjects(allProjects || [])

        const params = new URLSearchParams(window.location.search)
        const urlProject = params.get('project')
        const urlTab = params.get('tab')
        const urlRun = params.get('run')

        if (urlProject === 'demo') {
          handleTryDemo(urlTab || 'overview')
          return
        }

        if (urlProject && allProjects) {
          const matchedProj = allProjects.find(p => p.id === urlProject)
          if (matchedProj) {
            setSelectedProject(matchedProj)
            const projectRuns = await listRuns(matchedProj.id)
            const hydratedRuns = await hydrateRuns(projectRuns, urlRun ? [urlRun] : [])
            setRuns(hydratedRuns || [])
            if (urlTab === 'architecture') {
              if (urlRun && hydratedRuns) {
                const matchedRun = hydratedRuns.find(r => r.id === urlRun)
                if (matchedRun?.snapshot) handleLoadRun(matchedRun.snapshot, matchedRun)
              } else if (hydratedRuns && hydratedRuns.length > 0) {
                handleLoadRun(hydratedRuns[0].snapshot, hydratedRuns[0])
              }
            }
            setNavTab(urlTab || 'overview')
            return
          }
        }

        // Default initial state: open Overview of first project
        if (allProjects && allProjects.length > 0) {
          const first = allProjects[0]
          setSelectedProject(first)
          const firstRuns = await listRuns(first.id)
          const hydratedFirstRuns = await hydrateRuns(firstRuns, urlRun ? [urlRun] : [])
          setRuns(hydratedFirstRuns || [])
          if (urlTab === 'architecture' && hydratedFirstRuns && hydratedFirstRuns.length > 0) {
            const targetRun = (urlRun && hydratedFirstRuns.find(r => r.id === urlRun)) || hydratedFirstRuns[0]
            setSelectedRun(targetRun)
            if (targetRun.snapshot) handleLoadRun(targetRun.snapshot, targetRun)
            setNavTab('architecture')
          } else {
            setNavTab(urlTab || 'overview')
          }
        } else {
          setNavTab('overview')
        }
      } catch (err) {
        console.error('Initial state load failed:', err)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser back and forward events (popstate)
  useEffect(() => {
    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search)
      const urlProject = params.get('project')
      const urlTab = params.get('tab')
      const urlRun = params.get('run')

      if (urlProject === 'demo') {
        handleTryDemo(urlTab || 'overview')
        return
      }

      if (urlProject) {
        const allProjects = await listProjects()
        const matched = allProjects.find(p => p.id === urlProject)
        if (matched) {
          setSelectedProject(matched)
          const projectRuns = await listRuns(matched.id)
          const hydratedRuns = await hydrateRuns(projectRuns, urlRun ? [urlRun] : [])
          setRuns(hydratedRuns || [])
          if (urlTab === 'architecture') {
            if (urlRun && hydratedRuns) {
              const matchedRun = hydratedRuns.find(r => r.id === urlRun)
              if (matchedRun?.snapshot) handleLoadRun(matchedRun.snapshot, matchedRun)
            } else if (hydratedRuns && hydratedRuns.length > 0) {
              handleLoadRun(hydratedRuns[0].snapshot, hydratedRuns[0])
            }
          } else {
            setSelectedRun(null)
          }
        }
      }
      setNavTab(urlTab || 'overview')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handleTryDemo, handleLoadRun, hydrateRuns])

  // Click outside to close project selector dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target)) {
        setIsProjectMenuOpen(false)
      }
    }
    if (isProjectMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProjectMenuOpen])

  // Create project handler -> opens clean Project Home (Overview)
  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setCreateError('Project name is required')
      return
    }
    setCreatingProject(true)
    setCreateError('')
    try {
      const project = await createProject(newProjectName.trim(), newProjectDesc.trim())
      setProjects(prev => [project, ...prev.filter(p => p.id !== project.id)])
      setSelectedProject(project)
      setRuns([])
      setSelectedRun(null)
      resetGraph()
      closeInspector()
      setIsAiInspectorOpen(false)
      setShowImpact(false)
      setShowRefactor(false)
      setRefactorIssue(null)
      setCreateSuccess(`Project "${project.name}" created!`)
      setShowCreateModal(false)
      setNewProjectName('')
      setNewProjectDesc('')
      setIsProjectMenuOpen(false)
      setNavTab('overview')
      syncStateToUrl(project, 'overview', null)
    } catch (err) {
      setCreateError(err.message || 'Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }, [newProjectName, newProjectDesc, resetGraph, closeInspector, syncStateToUrl])

  // Run selection callback
  const handleSelectRun = useCallback(async (runOrId) => {
    let run = typeof runOrId === 'string' ? runs.find(r => r.id === runOrId) : runOrId
    if (!run && typeof runOrId === 'string') {
      try {
        run = await getRun(runOrId)
      } catch (e) {
        console.warn('Failed to load run:', e)
      }
    }
    if (run) {
      if (run.snapshot) {
        handleLoadRun(run.snapshot, run)
        syncStateToUrl(selectedProject, 'architecture', run)
      } else {
        try {
          const fullRun = await getRun(run.id)
          if (fullRun?.snapshot) {
            handleLoadRun(fullRun.snapshot, fullRun)
            syncStateToUrl(selectedProject, 'architecture', fullRun)
          }
        } catch (e) {
          console.warn('Failed to load full run details:', e)
        }
      }
    }
  }, [runs, handleLoadRun, selectedProject, syncStateToUrl])

  // Files ready from FileInput upload / GitHub fetch
  const handleFilesReady = useCallback(async (files, projectId) => {
    try {
      setActiveFiles(files || [])
      await buildGraph(files, projectId)
      if (projectId) {
        const updatedRuns = await listRuns(projectId)
        const hydrated = await hydrateRuns(updatedRuns)
        setRuns(hydrated || [])
        if (hydrated && hydrated.length > 0) {
          setSelectedRun(hydrated[0])
          syncStateToUrl(selectedProject, 'architecture', hydrated[0])
        }
      }
      setNavTab('architecture')
    } catch (err) {
      console.error('Build graph failed:', err)
      throw err
    }
  }, [buildGraph, selectedProject, syncStateToUrl, hydrateRuns])

  // Navigation tab change handler with URL sync
  const handleNavTabChange = useCallback((newTab) => {
    setNavTab(newTab)
    syncStateToUrl(selectedProject, newTab, selectedRun)
  }, [selectedProject, selectedRun, syncStateToUrl])

  // Node selection & blast radius calculation
  const handleNodeClick = (node) => {
    selectNode(node?.data || node)
  }

  const blastRadius = useMemo(() => {
    if (!selectedNode) return null
    return computeBlastRadius(selectedNode.id || selectedNode.label, nodes)
  }, [selectedNode, nodes])

  const highlightIds = useMemo(() => {
    if (!showImpact || !blastRadius) return null
    return [blastRadius.sourceId, ...blastRadius.ordered.map(entry => entry.id)]
  }, [showImpact, blastRadius])

  const handleSendMessage = (text) => {
    sendMessage(text, apiKey, selectedNode, depMap, stats)
  }

  const generateCurrentReview = () => {
    review.generateReview(apiKey, buildReviewDigest({
      nodes,
      cyclicEdges,
      unresolvedImports: stats?.unresolvedImports ?? 0,
      stats
    }))
  }

  const handleOpenReview = () => {
    setShowReview(true)
    if (apiKey && !review.report && !review.loading && !review.error) {
      generateCurrentReview()
    }
  }

  // AI Refactor handler
  const handleOpenRefactor = useCallback((issue) => {
    setRefactorIssue(issue)
    setShowRefactor(true)
    refactorPlan.generatePlan(issue, apiKey, { nodes, depMap, files: activeFiles })
  }, [apiKey, nodes, depMap, activeFiles, refactorPlan])

  // Auto-open issues panel once on first load if issues exist
  const hasCircularIssues = cyclicEdges?.length > 0
  const hasOrphanIssues = nodes.some(n =>
    n.data &&
    (!n.data.imports || n.data.imports.length === 0) &&
    (!n.data.importedBy || n.data.importedBy.length === 0)
  )
  if (
    navTab === 'architecture' &&
    !hasAutoOpenedIssues &&
    nodes.length > 0 &&
    (hasCircularIssues || hasOrphanIssues)
  ) {
    setIssuesPanelOpen(true)
    setHasAutoOpenedIssues(true)
  }

  // Primary navigation tabs
  const navTabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: '✦'
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: '❖',
      badge: nodes.length > 0 ? `${nodes.length}` : null
    },
    {
      id: 'runs',
      label: 'Runs',
      icon: '🕘',
      badge: runs?.length || 0
    },
    {
      id: 'import',
      label: 'New Analysis',
      icon: '⇪'
    }
  ], [nodes.length, runs?.length])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#07090e',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: 'hidden',
      color: '#f8fafc'
    }}>
      {/* ── PERSISTENT LEVEL 1 / LEVEL 2 TOP BAR (50px, flex layout without absolute collision) ── */}
      <header style={{
        height: '50px',
        flexShrink: 0,
        background: 'rgba(10, 14, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        gap: '10px',
        zIndex: 30,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        // Narrow viewports: let the bar scroll instead of letting the
        // clusters overlap each other.
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none'
      }}>
        {/* Left: Identity, Project Selector & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 auto', minWidth: '150px', overflow: 'hidden', zIndex: 1, flexShrink: 1 }}>
          <div style={{
            width: '26px',
            height: '26px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            boxShadow: '0 0 14px rgba(99, 102, 241, 0.45)',
            flexShrink: 0
          }}>⚡</div>
          <span style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', flexShrink: 0 }}>
            React<span style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Viz</span>
          </span>

          <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '13px', flexShrink: 0 }}>/</span>

          {/* Project Switcher Dropdown */}
          <div style={{ position: 'relative', flexShrink: 1, minWidth: 0 }} ref={projectMenuRef}>
            <button
              type="button"
              onClick={() => setIsProjectMenuOpen(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                maxWidth: '140px',
                overflow: 'hidden',
                background: demoMode
                  ? 'rgba(99, 102, 241, 0.16)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${demoMode ? 'rgba(129, 140, 248, 0.45)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '7px',
                fontSize: '12px',
                color: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = demoMode ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = demoMode ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.05)'}
            >
              <span style={{ flexShrink: 0 }}>{demoMode ? '✦' : '📂'}</span>
              <span style={{ fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedProject?.name || 'Select Project'}
              </span>
              {demoMode && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  background: 'rgba(168, 85, 247, 0.25)',
                  color: '#d8b4fe',
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}>DEMO</span>
              )}
              <span style={{ fontSize: '9px', color: '#94a3b8', flexShrink: 0 }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {isProjectMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '260px',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15)',
                padding: '8px',
                zIndex: 100
              }}>
                <div style={{
                  padding: '6px 10px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  Projects
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
                  {projects.map(proj => {
                    const isSelected = selectedProject?.id === proj.id && !demoMode
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleSelectProject(proj)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📂 {proj.name}
                        </span>
                        {proj.runCount !== undefined && (
                          <span style={{ fontSize: '10px', color: '#64748b', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.04)' }}>
                            {proj.runCount} runs
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {projects.length === 0 && (
                    <div style={{ padding: '12px 10px', fontSize: '11.5px', color: '#64748b', textAlign: 'center' }}>
                      No projects found
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectMenuOpen(false)
                      setShowCreateModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#93c5fd',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>+</span> Create New Project
                  </button>

                  <button
                    type="button"
                    onClick={handleTryDemo}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      color: '#e0e7ff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>✦</span> Launch Demo Project
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Breadcrumb */}
          <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '13px', flexShrink: 0 }}>/</span>
          <span style={{
            fontSize: '11px',
            color: '#94a3b8',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {navTab === 'overview'
              ? 'Overview'
              : navTab === 'architecture'
                ? (selectedRun ? `Run #${selectedRun.id.slice(0, 8)}` : 'Architecture')
                : navTab === 'runs'
                  ? 'Runs'
                  : 'New Analysis'}
          </span>
        </div>

        {/* Center: Navigation Mode Segmented Tabs (fluid flex-centered) */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}>
          <AnimateTabs
            tabs={navTabs}
            activeTab={navTab}
            onChange={handleNavTabChange}
            layoutId="app-primary-nav-tab"
            tabStyle={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 10px',
              height: '30px'
            }}
          />
        </div>

        {/* Right: Demo Toggle + Global Settings + Engine Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flex: '0 0 auto', marginLeft: 'auto', zIndex: 1 }}>
          {demoMode ? (
            <button
              type="button"
              onClick={handleExitDemo}
              data-testid="exit-demo-button"
              style={{
                padding: '5px 12px',
                borderRadius: '7px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>✕</span> Exit Demo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTryDemo}
              data-testid="launch-demo-header-button"
              style={{
                padding: '5px 11px',
                borderRadius: '7px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#c7d2fe',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>✦</span> Demo
            </button>
          )}

          {/* Global Settings */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            title="Configure AI API Key & engine settings"
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: apiKey ? '#34d399' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>⚙</span>
            {apiKey && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />}
          </button>

          {/* Engine Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '11px',
            color: '#34d399',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: analysisLoading ? '#fbbf24' : '#10b981',
              boxShadow: analysisLoading ? '0 0 6px #fbbf24' : '0 0 6px #10b981'
            }} />
            <span>{analysisLoading ? 'Analyzing' : 'Ready'}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN VIEWPORT BODY ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {navTab === 'overview' ? (
          /* ── LEVEL 2: PROJECT OVERVIEW (Project Home) ── */
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <ProjectOverview
              project={selectedProject}
              runs={runs}
              onOpenLatestArchitecture={async (run) => {
                const target = run || (runs && runs.length > 0 ? runs[0] : null)
                if (!target) return
                if (target.snapshot) {
                  handleLoadRun(target.snapshot, target)
                  syncStateToUrl(selectedProject, 'architecture', target)
                } else {
                  try {
                    const fullRun = await getRun(target.id)
                    if (fullRun?.snapshot) {
                      handleLoadRun(fullRun.snapshot, fullRun)
                      syncStateToUrl(selectedProject, 'architecture', fullRun)
                    }
                  } catch (e) {
                    console.warn('Failed to fetch full run snapshot:', e)
                  }
                }
              }}
              onStartNewAnalysis={() => handleNavTabChange('import')}
              onViewRuns={() => handleNavTabChange('runs')}
              onViewIssues={async () => {
                const target = runs && runs.length > 0 ? runs[0] : null
                if (target?.snapshot) {
                  handleLoadRun(target.snapshot, target)
                  syncStateToUrl(selectedProject, 'architecture', target)
                }
                setNavTab('architecture')
                setIssuesPanelOpen(true)
              }}
              onOpenRun={(run) => handleSelectRun(run)}
              onTryDemo={handleTryDemo}
            />
          </div>
        ) : navTab === 'architecture' ? (
          nodes.length > 0 ? (
            /* ── LEVEL 4: ARCHITECTURE WORKSPACE ── */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Architecture Intelligence Toolbar (Search, Filters, Health Pill, Issues, AI Review, Export) */}
              <ArchitectureToolbar
                nodes={nodes}
                edges={edges}
                cyclicEdges={cyclicEdges}
                stats={stats}
                searchTerm={search}
                onSearchChange={setSearch}
                onSelectNode={(node) => {
                  handleNodeClick(node)
                  graphCanvasRef.current?.focusNode(node.id)
                }}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                riskFilter={riskFilter}
                onRiskFilterChange={setRiskFilter}
                issueFilter={issueFilter}
                onIssueFilterChange={setIssueFilter}
                onClearFilters={() => {
                  setTypeFilter('all')
                  setRiskFilter('all')
                  setIssueFilter('all')
                  setSearch('')
                }}
                totalFilteredCount={filteredNodeIds ? filteredNodeIds.length : nodes.length}
                issuesPanelOpen={issuesPanelOpen}
                onToggleIssuesPanel={() => setIssuesPanelOpen(v => !v)}
                onOpenReview={handleOpenReview}
                onExport={(format) => {
                  if (format === 'PNG') graphCanvasRef.current?.exportPNG()
                  if (format === 'SVG') graphCanvasRef.current?.exportSVG()
                  if (format === 'JSON') graphCanvasRef.current?.exportJSON()
                }}
                issuesCount={prioritizedIssues.counts}
              />

              {/* ── Older-Run Diff Banner ── */}
              {runDiffResult && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  background: runDiffResult.hasRegressions
                    ? 'rgba(239,68,68,0.08)'
                    : runDiffResult.hasImprovements
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(255,255,255,0.03)',
                  borderBottom: `1px solid ${
                    runDiffResult.hasRegressions
                      ? 'rgba(239,68,68,0.25)'
                      : runDiffResult.hasImprovements
                        ? 'rgba(16,185,129,0.25)'
                        : 'rgba(255,255,255,0.08)'
                  }`,
                  fontSize: '11.5px',
                  color: '#94a3b8',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>⏱ Viewing older snapshot</span>
                  <span>vs latest run:</span>
                  <span style={{
                    fontWeight: 600,
                    color: runDiffResult.hasRegressions ? '#ef4444' : runDiffResult.hasImprovements ? '#10b981' : '#94a3b8',
                  }}>
                    {runDiffResult.summary}
                  </span>
                  {runDiffResult.healthDelta !== null && (
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      background: runDiffResult.healthDelta > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: runDiffResult.healthDelta > 0 ? '#10b981' : '#ef4444',
                      border: `1px solid ${runDiffResult.healthDelta > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
                    }}>
                      Health {runDiffResult.healthDelta > 0 ? '+' : ''}{runDiffResult.healthDelta}pts since this run
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (runs?.[0]) {
                        handleSelectRun(runs[0])
                      }
                    }}
                    style={{
                      marginLeft: 'auto',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'rgba(99,102,241,0.18)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: '#c7d2fe',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Jump to Latest →
                  </button>
                </div>
              )}

              {/* Canvas Viewport + Sidebar */}
              <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* Canvas Area */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <GraphCanvas
                    ref={graphCanvasRef}
                    highlightIds={highlightIds}
                    filteredNodeIds={filteredNodeIds}
                    initialNodes={nodes}
                    initialEdges={edges}
                    onNodeClick={handleNodeClick}
                    searchTerm={search}
                    stats={stats}
                    cyclicEdges={cyclicEdges}
                    onClearImpact={() => setShowImpact(false)}
                  />
                  <IssuesPanel
                    nodes={nodes}
                    edges={edges}
                    cyclicEdges={cyclicEdges}
                    stats={stats}
                    unresolvedImports={unresolvedImports}
                    onNodeClick={(node) => {
                      handleNodeClick(node)
                      graphCanvasRef.current?.focusNode(node.id)
                    }}
                    onViewImpact={(nodeId) => {
                      const target = nodes.find(n => n.id === nodeId)
                      if (target) {
                        handleNodeClick(target)
                        setShowImpact(true)
                        graphCanvasRef.current?.focusNode(nodeId)
                      }
                    }}
                    isOpen={issuesPanelOpen}
                    onToggle={() => setIssuesPanelOpen(!issuesPanelOpen)}
                    onRefactorIssue={handleOpenRefactor}
                    hideTrigger={true}
                  />
                </div>

                {/* Right Sidebar */}
                <div style={{
                  width: '280px',
                  flexShrink: 0,
                  background: 'rgba(11, 15, 25, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 5
                }}>
                  <div style={{
                    padding: '12px 14px 10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    flexShrink: 0
                  }}>
                    <AnimateTabs
                      tabs={[
                        { id: 'info', label: 'Info', icon: '📋' },
                        { id: 'files', label: 'Files', icon: '📁', badge: nodes.length }
                      ]}
                      activeTab={sidebarTab}
                      onChange={setSidebarTab}
                      layoutId="sidebar-tab-active-indicator"
                      containerStyle={{ width: '100%', display: 'flex' }}
                      tabStyle={{ flex: 1, justifyContent: 'center' }}
                    />
                  </div>

                  {sidebarTab === 'info' ? (
                    <>
                      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute',
                            left: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            fontSize: '13px',
                            pointerEvents: 'none'
                          }}>🔍</span>
                          <input
                            type="text"
                            placeholder="Search components, hooks..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px 8px 34px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              color: '#f8fafc',
                              fontSize: '12px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <NodesLegend />

                      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                        {selectedNode ? (
                          <>
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px',
                              padding: '14px',
                              marginBottom: '16px',
                              position: 'relative',
                              overflow: 'hidden',
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                            }}>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: getNodeColor(selectedNode.nodeType)
                              }} />
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                background: `${getNodeColor(selectedNode.nodeType)}20`,
                                border: `1px solid ${getNodeColor(selectedNode.nodeType)}55`,
                                borderRadius: '999px',
                                marginBottom: '8px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: getNodeColor(selectedNode.nodeType),
                                  boxShadow: `0 0 6px ${getNodeColor(selectedNode.nodeType)}`
                                }} />
                                <span style={{
                                  fontSize: '10px',
                                  color: getNodeColor(selectedNode.nodeType),
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.6px'
                                }}>{selectedNode.nodeType}</span>
                              </div>
                              <div style={{
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#f8fafc',
                                wordBreak: 'break-word',
                                lineHeight: '1.4'
                              }}>{selectedNode.label}</div>
                            </div>

                            <ImportList
                              title="Imports (Outgoing)"
                              items={selectedNode.imports}
                              borderColor={COLORS.primary.DEFAULT}
                              textColor={COLORS.primary.light}
                              onItemClick={(item) => {
                                const matched = nodes.find(n => n.id === item || n.data?.label === item)
                                if (matched) {
                                  handleNodeClick(matched)
                                  graphCanvasRef.current?.focusNode(matched.id)
                                }
                              }}
                            />

                            <ImportList
                              title="Used By (Incoming)"
                              items={selectedNode.importedBy}
                              borderColor={COLORS.status.success}
                              textColor="#86efac"
                              onItemClick={(item) => {
                                const matched = nodes.find(n => n.id === item || n.data?.label === item)
                                if (matched) {
                                  handleNodeClick(matched)
                                  graphCanvasRef.current?.focusNode(matched.id)
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                selectNode(selectedNode)
                                setIsAiInspectorOpen(true)
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.18))',
                                border: '1px solid rgba(129, 140, 248, 0.35)',
                                borderRadius: '8px',
                                color: '#e0e7ff',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
                                transition: 'all 0.18s ease'
                              }}
                            >
                              <span>💬</span> Ask AI about this file
                            </button>
                          </>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: '60px',
                            gap: '12px',
                            opacity: 0.5
                          }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}>✦</div>
                            <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', lineHeight: '1.5' }}>
                              Click any node on canvas<br />to inspect dependencies
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        padding: '14px 16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        flexShrink: 0
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedNode && nodes.length > 0) {
                              selectNode(nodes[0].data || nodes[0])
                            }
                            setIsAiInspectorOpen(true)
                          }}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '7px',
                            color: '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>💬</span> Open AI Inspector & Chat
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '10px',
                        padding: '0 4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>Project Files</span>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          color: '#94a3b8'
                        }}>{nodes.length}</span>
                      </div>
                      {nodes.map(n => {
                        const isSelected = selectedNode?.id === n.id
                        const nodeColor = getNodeColor(n.data?.nodeType || 'file')
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNodeClick(n)}
                            style={{
                              padding: '8px 10px',
                              marginBottom: '4px',
                              background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              borderRadius: '6px',
                              borderLeft: `3px solid ${isSelected ? '#818cf8' : nodeColor}`,
                              borderTop: isSelected ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                              borderRight: isSelected ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                              borderBottom: isSelected ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                              color: isSelected ? '#ffffff' : '#94a3b8',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.data?.label || n.id}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: `${nodeColor}22`,
                              color: nodeColor,
                              textTransform: 'uppercase',
                              flexShrink: 0,
                              marginLeft: '6px'
                            }}>
                              {n.data?.nodeType || 'file'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── ARCHITECTURE EMPTY STATE ── */
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              background: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.08), transparent 70%)'
            }}>
              <div style={{
                maxWidth: '560px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '40px 32px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)'
                }}>
                  ❖
                </div>

                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#f8fafc',
                  marginBottom: '10px',
                  letterSpacing: '-0.3px'
                }}>
                  {selectedProject
                    ? `No Architecture Runs for ${selectedProject.name}`
                    : 'No Architecture Graph Loaded'}
                </h2>

                <p style={{
                  fontSize: '13.5px',
                  color: '#94a3b8',
                  lineHeight: '1.6',
                  marginBottom: '28px'
                }}>
                  {selectedProject
                    ? 'This project has no completed analysis runs yet. Import source code to generate its visual AST dependency graph.'
                    : 'Select an existing project, import your React / TypeScript codebase for automated AST analysis, or explore the pre-built demo.'}
                </p>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {runs.length > 0 && runs[0]?.snapshot && (
                    <button
                      type="button"
                      onClick={() => handleLoadRun(runs[0].snapshot, runs[0])}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <span>❖</span> Open Latest Run (#{runs[0].id.slice(0, 8)})
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNavTabChange('import')}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    <span>⇪</span> Start New Analysis
                  </button>

                  <button
                    type="button"
                    onClick={handleTryDemo}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#cbd5e1',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>✦</span> Explore Demo Sandbox
                  </button>
                </div>
              </div>
            </div>
          )
        ) : navTab === 'runs' ? (
          /* ── LEVEL 3: RUNS HISTORY VIEW (Full width, no duplicate sidebar) ── */
          <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
            <FileInput
              hideHeader={true}
              hideProjectsSidebar={true}
              activeTab="Runs"
              demoMode={demoMode}
              demoRuns={demoMode ? [demoRunItem] : []}
              onTabChange={(tab) => {
                if (tab === 'Dashboard') handleNavTabChange('import')
                else if (tab === 'Runs') handleNavTabChange('runs')
              }}
              onFilesReady={handleFilesReady}
              analyzing={analysisLoading}
              analysisError={analysisError}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              onLoadRun={handleLoadRun}
              selectedRunId={selectedRun?.id}
              onSelectRun={handleSelectRun}
              onRunsChange={setRuns}
              onTryDemo={handleTryDemo}
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
            />
          </div>
        ) : (
          /* ── LEVEL 3: NEW ANALYSIS INGESTION (Full width, no duplicate sidebar) ── */
          <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
            <FileInput
              hideHeader={true}
              hideProjectsSidebar={true}
              activeTab="Dashboard"
              demoMode={demoMode}
              demoRuns={demoMode ? [demoRunItem] : []}
              onTabChange={(tab) => {
                if (tab === 'Dashboard') handleNavTabChange('import')
                else if (tab === 'Runs') handleNavTabChange('runs')
              }}
              onFilesReady={handleFilesReady}
              analyzing={analysisLoading}
              analysisError={analysisError}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              onLoadRun={handleLoadRun}
              selectedRunId={selectedRun?.id}
              onSelectRun={handleSelectRun}
              onRunsChange={setRuns}
              onTryDemo={handleTryDemo}
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
            />
          </div>
        )}
      </div>

      {/* ── AI ARCHITECTURE REVIEW MODAL ── */}
      {showReview && (
        <ReviewModal
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          report={review.report}
          loading={review.loading}
          error={review.error}
          onGenerate={generateCurrentReview}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* ── AI ARCHITECTURE REFACTOR MODAL ── */}
      {showRefactor && refactorIssue && (
        <RefactorModal
          issue={refactorIssue}
          plan={refactorPlan.plan}
          loading={refactorPlan.loading}
          error={refactorPlan.error}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onRegenerate={() => refactorPlan.generatePlan(refactorIssue, apiKey, { nodes, depMap, files: activeFiles })}
          onClose={() => {
            setShowRefactor(false)
            setRefactorIssue(null)
          }}
        />
      )}

      {/* ── FLOATING NODE INSPECTOR & AI CHAT (Controlled drawer) ── */}
      {isAiInspectorOpen && (
        <NodeInspector
          node={selectedNode}
          depMap={depMap}
          stats={stats}
          impact={blastRadius}
          showImpact={showImpact}
          onToggleImpact={() => setShowImpact(v => !v)}
          issues={prioritizedIssues.issues}
          onSelectNodeByPath={(path) => {
            const matched = nodes.find(n => n.id === path || n.data?.label === path)
            if (matched) {
              handleNodeClick(matched)
              graphCanvasRef.current?.focusNode(matched.id)
            }
          }}
          messages={messages}
          loading={aiLoading}
          error={aiError}
          onSendMessage={handleSendMessage}
          onClearChat={clearChat}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onClose={() => {
            setIsAiInspectorOpen(false)
            closeInspector()
          }}
        />
      )}

      {/* ── GLOBAL SETTINGS MODAL ── */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      {/* ── GLOBAL CREATE PROJECT MODAL ── */}
      <CreateProjectModal
        isOpen={showCreateModal}
        name={newProjectName}
        description={newProjectDesc}
        error={createError}
        success={createSuccess}
        isCreating={creatingProject}
        onNameChange={setNewProjectName}
        onDescriptionChange={setNewProjectDesc}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}
