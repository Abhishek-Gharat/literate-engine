import { create } from 'zustand'

const STORAGE_KEY = 'reactviz_api_key'

const useStore = create((set) => ({
  // ── Graph data (owned by useGraphBuilder) ──
  nodes: [],
  edges: [],
  depMap: {},
  cyclicEdges: [],
  stats: null,
  analysisErrors: [],
  unresolvedImports: [],
  graphLoading: false,
  graphError: '',
  runId: null,

  // ── App UI state ──
  graphReady: false,
  search: '',
  searchResults: [],  // [{ nodeId: string, score: number }] — populated by Fuse.js
  selectedProject: null,
  runs: [],
  selectedRun: null,
  demoMode: false,
  activeTab: 'Dashboard',
  issuesPanelOpen: false,
  hasAutoOpenedIssues: false,

  // ── Node selection (owned by useNodeSelection) ──
  selectedNode: null,
  selectedNodeId: null,   // React Flow node id — mirrors selectedNode's id
  showInspector: false,

  // ── Node history (Phase 5) ──
  nodeHistory: [],         // [nodeId, ...] — last 50 visited node IDs
  historyIndex: -1,        // pointer into nodeHistory; -1 = empty

  // ── Focus mode (Phase 5) ──
  focusNodeId: null,       // when set, dim all nodes that are not this node or its 1-hop neighbors

  // ── API key (owned by useApiKey) ──
  apiKey: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || '' : '',
  showKeyInput: false,

  // ── AI chat (owned by useAIExplain) ──
  messages: [],
  aiLoading: false,
  aiError: '',

  // ── Graph actions ──
  // Partial update: only keys present in `data` are written; omitted keys keep current value.
  setGraph: (data) =>
    set((state) => ({
      nodes: data.nodes !== undefined ? data.nodes : state.nodes,
      edges: data.edges !== undefined ? data.edges : state.edges,
      depMap: data.depMap !== undefined ? data.depMap : state.depMap,
      cyclicEdges: data.cyclicEdges !== undefined ? data.cyclicEdges : state.cyclicEdges,
      stats: data.stats !== undefined ? data.stats : state.stats,
      analysisErrors: data.analysisErrors !== undefined ? data.analysisErrors : state.analysisErrors,
      unresolvedImports:
        data.unresolvedImports !== undefined ? data.unresolvedImports : state.unresolvedImports,
    })),
  setRunId: (runId) => set({ runId }),
  setGraphLoading: (graphLoading) => set({ graphLoading }),
  setGraphError: (graphError) => set({ graphError }),
  resetGraph: () =>
    set({
      nodes: [],
      edges: [],
      depMap: {},
      cyclicEdges: [],
      stats: null,
      analysisErrors: [],
      unresolvedImports: [],
      runId: null,
      graphError: '',
      search: '',
      searchResults: [],
      // Selection + history + focus must all be cleared when the graph is gone.
      // closeInspector() is called before resetGraph() in current callers, but
      // resetGraph must be self-contained so any future caller gets consistent state.
      selectedNode: null,
      selectedNodeId: null,
      showInspector: false,
      nodeHistory: [],
      historyIndex: -1,
      focusNodeId: null,
    }),

  // ── App UI actions ──
  setGraphReady: (graphReady) => set({ graphReady }),
  setSearch: (search) => set({ search }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setRuns: (runs) => set({ runs }),
  setSelectedRun: (selectedRun) => set({ selectedRun }),
  setDemoMode: (demoMode) => set({ demoMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIssuesPanelOpen: (issuesPanelOpen) => set({ issuesPanelOpen }),
  setHasAutoOpenedIssues: (hasAutoOpenedIssues) => set({ hasAutoOpenedIssues }),

  // ── Node selection actions ──
  // Accepts either a full React Flow node { id, data, ... } or just node.data.
  // When a full RF node is passed, the id is extracted and pushed onto nodeHistory.
  selectNode: (nodeOrData) => {
    const nodeId = nodeOrData?.id ?? null
    const nodeData = nodeOrData?.data || nodeOrData
    set((s) => {
      if (!nodeId) {
        // Called with just data (no id available) — select without history
        return { selectedNode: nodeData, showInspector: true }
      }
      // Skip duplicate: don't push the same node twice in a row.
      // This prevents clicking the same node multiple times from inflating
      // history with useless entries that make "back" a no-op.
      const currentId = s.nodeHistory[s.historyIndex]
      if (currentId === nodeId) {
        // Still update selectedNode (data may have refreshed) but leave history alone.
        return { selectedNode: nodeData, showInspector: true }
      }
      const trimmed = s.nodeHistory.slice(0, s.historyIndex + 1)
      const history = [...trimmed, nodeId].slice(-50)
      return {
        selectedNode: nodeData,
        selectedNodeId: nodeId,
        showInspector: true,
        nodeHistory: history,
        historyIndex: history.length - 1,
        focusNodeId: null,  // new node selection always clears focus
      }
    })
  },
  goBack: () => set((s) => {
    if (s.historyIndex <= 0) return {}
    const i = s.historyIndex - 1
    const nodeId = s.nodeHistory[i]
    const rfNode = s.nodes.find((n) => n.id === nodeId)
    return {
      historyIndex: i,
      selectedNodeId: nodeId,
      selectedNode: rfNode?.data ?? null,
      showInspector: true,
      focusNodeId: null,
    }
  }),
  goForward: () => set((s) => {
    if (s.historyIndex >= s.nodeHistory.length - 1) return {}
    const i = s.historyIndex + 1
    const nodeId = s.nodeHistory[i]
    const rfNode = s.nodes.find((n) => n.id === nodeId)
    return {
      historyIndex: i,
      selectedNodeId: nodeId,
      selectedNode: rfNode?.data ?? null,
      showInspector: true,
      focusNodeId: null,
    }
  }),
  toggleFocus: () => set((s) => ({
    focusNodeId: s.focusNodeId === s.selectedNodeId ? null : s.selectedNodeId,
  })),
  deselectNode: () => set({ selectedNode: null, selectedNodeId: null, showInspector: false }),
  closeInspector: () => set({ showInspector: false, selectedNode: null, selectedNodeId: null, focusNodeId: null }),
  toggleInspector: () => set((s) => ({ showInspector: !s.showInspector })),

  // ── API key actions ──
  handleApiKeyChange: (value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value)
    }
    set({ apiKey: value })
  },
  setApiKey: (apiKey) => set({ apiKey }),
  toggleKeyInput: () => set((s) => ({ showKeyInput: !s.showKeyInput })),
  showKeyInputPanel: () => set({ showKeyInput: true }),
  hideKeyInputPanel: () => set({ showKeyInput: false }),

  // ── AI chat actions ──
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  setAiLoading: (aiLoading) => set({ aiLoading }),
  setAiError: (aiError) => set({ aiError }),
  clearChat: () => set({ messages: [], aiError: '' }),
}))

export default useStore
