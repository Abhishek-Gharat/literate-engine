import { useState, useCallback, useMemo, useRef } from 'react'
import FileInput from './components/FileInput'
import GraphCanvas from './components/GraphCanvas'
import NodeInspector from './components/NodeInspector'
import NodesLegend from './components/NodesLegend'
import { IssuesPanel } from './components/IssuesPanel'
import { useGraphBuilder } from './hooks/useGraphBuilder'
import { useAIExplain } from './hooks/useAIExplain'
import { useNodeSelection } from './hooks/useNodeSelection'
import { useApiKey } from './hooks/useApiKey'
import { StatsDisplay } from './components/StatBadge'
import { ImportList, EmptyState } from './components/NodeCard'
import { getNodeColor } from './utils/nodeColors.js'
import { computeBlastRadius } from './utils/impactAnalysis.js'
import { buildReviewDigest } from './utils/reviewBuilder.js'
import { useArchReview } from './hooks/useArchReview.js'
import ReviewModal from './components/review/ReviewModal.jsx'
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, NODE_LEGEND_ITEMS } from './styles/constants.js'
import { DemoExperience } from './demo/DemoExperience.jsx'

function App() {
  const { buildGraph, loadSnapshot, resetGraph, nodes, edges, cyclicEdges, depMap, stats, loading: analysisLoading, error: analysisError } = useGraphBuilder()
  const { messages, loading, error, sendMessage, clearChat } = useAIExplain()
  const { selectedNode, selectNode, closeInspector } = useNodeSelection()
  const { apiKey, showKeyInput, handleApiKeyChange, toggleKeyInput } = useApiKey()
  const review = useArchReview()
  const [graphReady, setGraphReady] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [demoMode, setDemoMode] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [issuesPanelOpen, setIssuesPanelOpen] = useState(false)
  const [hasAutoOpenedIssues, setHasAutoOpenedIssues] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('info')
  const [showImpact, setShowImpact] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const graphCanvasRef = useRef(null)

  const handleFilesReady = useCallback(async (files, projectId) => {
    try {
      await buildGraph(files, projectId)
      setGraphReady(true)
    } catch {
      setGraphReady(false)
    }
  }, [buildGraph])

  const handleLoadRun = useCallback((snapshot, run) => {
    loadSnapshot({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      depMap: snapshot.depMap,
      cyclicEdges: snapshot.cyclicEdges,
      stats: run.stats,
      unresolvedImports: run.unresolvedImports,
      analysisErrors: run.analysisErrors,
      runId: run.id
    })
    setGraphReady(true)
  }, [loadSnapshot])

  const handleSelectRun = useCallback((runOrId) => {
    if (typeof runOrId === 'string') {
      const run = runs.find(r => r.id === runOrId)
      setSelectedRun(run || null)
    } else {
      setSelectedRun(runOrId || null)
    }
  }, [runs])

  const handleRunsChange = useCallback((newRuns) => {
    setRuns(newRuns)
    if (newRuns.length > 0) {
      setSelectedRun(newRuns[0])
    }
  }, [])

  const handleBackToInput = () => {
    setGraphReady(false)
    setDemoMode(false)
    setShowImpact(false)
    closeInspector()
    resetGraph()
    // Keep activeTab as-is - if user was on Runs tab, they return there
  }

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

  const handleShowInspector = () => {
    // Opens inspector without changing selected node
  }

  const handleSendMessage = (text) => {
    sendMessage(text, apiKey, selectedNode, depMap, stats)
  }

  const handleTryDemo = () => {
    setDemoMode(true)
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

  // Auto-open issues panel on first load if there are issues.
  // Derived during render (guarded by hasAutoOpenedIssues) instead of an
  // effect, so selecting state doesn't cascade extra renders.
  const hasCircularIssues = cyclicEdges?.length > 0
  const hasOrphanIssues = nodes.some(n =>
    n.data &&
    (!n.data.imports || n.data.imports.length === 0) &&
    (!n.data.importedBy || n.data.importedBy.length === 0)
  )
  if (
    graphReady &&
    !hasAutoOpenedIssues &&
    nodes.length > 0 &&
    (hasCircularIssues || hasOrphanIssues)
  ) {
    setIssuesPanelOpen(true)
    setHasAutoOpenedIssues(true)
  }

  // Demo mode
  if (demoMode) {
    return <DemoExperience onBackToApp={handleBackToInput} />
  }

  if (!graphReady) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#0a0a0a',
        color: '#f5f5f5',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          minWidth: 0
        }}>
          <FileInput
            onFilesReady={handleFilesReady}
            analyzing={analysisLoading}
            analysisError={analysisError}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onLoadRun={handleLoadRun}
            selectedRunId={selectedRun?.id}
            onSelectRun={handleSelectRun}
            onRunsChange={handleRunsChange}
            onTryDemo={handleTryDemo}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0a0a0a',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: 'hidden', color: '#f5f5f5'
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        height: '48px', flexShrink: 0,
        background: '#111111',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '16px', zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'linear-gradient(135deg, #e2e2e2, #b0b0b0)',
            borderRadius: '7px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '13px'
          }}>⚡</div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>
            React<span style={{ color: '#e2e2e2' }}>Viz</span>
          </span>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
          My Projects › <span style={{ color: '#a0a0a0' }}>{selectedProject?.name || 'Unsaved'}</span>
        </div>

        {stats && <StatsDisplay stats={stats} />}

        {graphReady && (
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
            <button
              onClick={handleOpenReview}
              data-testid="ai-review-button"
              style={{
                padding: '5px 12px', background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: '6px',
                color: '#e2e2e2', cursor: 'pointer', fontSize: '11px',
                fontWeight: '700',
                transition: 'all 0.2s',
                marginRight: '6px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ffffff'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color = '#e2e2e2'
              }}
              title="One-click AI architecture review"
            >
              ✦ AI Review
            </button>
            <span style={{ color: '#6b6b6b', fontSize: '12px', marginRight: '4px' }}>Export:</span>
            <button
              onClick={() => graphCanvasRef.current?.exportPNG()}
              style={{
                padding: '5px 10px', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                color: '#a0a0a0', cursor: 'pointer', fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#e2e2e2'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = '#a0a0a0'
              }}
              title="Export as PNG"
            >
              PNG
            </button>
            <button
              onClick={() => graphCanvasRef.current?.exportSVG()}
              style={{
                padding: '5px 10px', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                color: '#a0a0a0', cursor: 'pointer', fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#e2e2e2'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = '#a0a0a0'
              }}
              title="Export as SVG"
            >
              SVG
            </button>
            <button
              onClick={() => graphCanvasRef.current?.exportJSON()}
              style={{
                padding: '5px 10px', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                color: '#a0a0a0', cursor: 'pointer', fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#e2e2e2'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = '#a0a0a0'
              }}
              title="Export as JSON"
            >
              JSON
            </button>
          </div>
        )}

        <button
          onClick={handleBackToInput}
          style={{
            padding: '6px 12px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px',
            color: '#6b6b6b', cursor: 'pointer', fontSize: '12px',
            marginLeft: '8px'
          }}
        >← Back</button>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── GRAPH AREA ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <GraphCanvas
        ref={graphCanvasRef}
        highlightIds={highlightIds}
            initialNodes={nodes}
            initialEdges={edges}
            onNodeClick={handleNodeClick}
            searchTerm={search}
            stats={stats}
            cyclicEdges={cyclicEdges}
          />
          <IssuesPanel
            nodes={nodes}
            edges={edges}
            cyclicEdges={cyclicEdges}
            stats={stats}
            onNodeClick={handleNodeClick}
            isOpen={issuesPanelOpen}
            onToggle={() => setIssuesPanelOpen(!issuesPanelOpen)}
          />
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: '260px', flexShrink: 0,
          background: '#111111',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            flexShrink: 0
          }}>
            {['info', 'files'].map(t => (
              <button
                key={t}
                onClick={() => setSidebarTab(t)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${sidebarTab === t ? '#e2e2e2' : 'transparent'}`,
                  color: sidebarTab === t ? '#ffffff' : '#6b6b6b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: sidebarTab === t ? '600' : '400',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s'
                }}
              >{t === 'info' ? '📋 Info' : '📁 Files'}</button>
            ))}
          </div>

          {sidebarTab === 'info' ? (
            <>
              {/* Search */}
              <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '10px', top: '50%',
                    transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '13px'
                  }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search node..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px 8px 32px',
                      background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px', color: '#f5f5f5',
                      fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Legend */}
              <NodesLegend />

              {/* Node info */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                {selectedNode ? (
                  <>
                    <div style={{
                      background: COLORS.bg.card,
                      border: `1px solid ${COLORS.border.light}`,
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        background: `${getNodeColor(selectedNode.nodeType)}22`,
                        border: `1px solid ${getNodeColor(selectedNode.nodeType)}44`,
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          color: getNodeColor(selectedNode.nodeType),
                          fontWeight: TYPOGRAPHY.weight.bold,
                          textTransform: 'uppercase'
                        }}>{selectedNode.nodeType}</span>
                      </div>
                      <div style={{
                        fontFamily: TYPOGRAPHY.fontFamily.mono,
                        fontSize: TYPOGRAPHY.size.xl,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: COLORS.text.primary,
                        wordBreak: 'break-word'
                      }}>{selectedNode.label}</div>
                    </div>

                    <ImportList
                      title="Imports"
                      items={selectedNode.imports}
                      borderColor={COLORS.primary.DEFAULT}
                      textColor={COLORS.primary.light}
                    />

                    <ImportList
                      title="Used By"
                      items={selectedNode.importedBy}
                      borderColor={COLORS.status.success}
                      textColor="#86efac"
                    />

                <button
                  onClick={() => { setSidebarTab('info'); handleShowInspector() }}
                  style={{
                    width: '100%', padding: '9px',
                    background: '#e2e2e222',
                    border: '1px solid #e2e2e244',
                    borderRadius: '8px', color: '#ffffff',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                  }}
                >💬 Ask AI about this file</button>
                  </>
                ) : (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    paddingTop: '40px', gap: '10px', opacity: 0.3
                  }}>
                    <div style={{ fontSize: '24px' }}>🔍</div>
                  <div style={{ color: '#a0a0a0', fontSize: '12px', textAlign: 'center' }}>
                    Click a node to inspect
                  </div>
                  </div>
                )}
              </div>

              {/* AI Context */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '10px'
                }}>
                  <span style={{
                    fontSize: '11px', color: '#6b6b6b', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.8px'
                  }}>AI Context</span>
                  <button
                    onClick={toggleKeyInput}
                    style={{
                      background: 'none', border: 'none',
                      color: '#6b6b6b', cursor: 'pointer', fontSize: '14px'
                    }}
                  >⚙</button>
                </div>

                {showKeyInput && (
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => handleApiKeyChange(e.target.value)}
                    placeholder="OpenRouter API key..."
                    style={{
                      width: '100%', padding: '8px 10px',
                      background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '7px', color: '#f5f5f5',
                      fontSize: '12px', outline: 'none',
                      boxSizing: 'border-box', marginBottom: '8px'
                    }}
                  />
                )}

                {!showKeyInput && (
                  <div style={{
                    padding: '8px 10px', background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px',
                    color: apiKey ? '#5a9e6f' : '#6b6b6b',
                    fontSize: '12px', marginBottom: '8px'
                  }}>
                    {apiKey ? '✓ API Key configured' : 'API Key Required'}
                  </div>
                )}

                <button
                  onClick={() => { setSidebarTab('info') }}
                  style={{
                    width: '100%', padding: '9px',
                    background: apiKey ? '#e2e2e233' : '#1a1a1a',
                    border: `1px solid ${apiKey ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '7px',
                    color: apiKey ? '#ffffff' : '#6b6b6b',
                    cursor: apiKey ? 'pointer' : 'not-allowed',
                    fontSize: '12px', fontWeight: '600', transition: 'all 0.2s'
                  }}
                >💬 Open AI Chat</button>
              </div>
            </>
          ) : (
            /* Files tab */
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <div style={{
                fontSize: '11px', color: '#6b6b6b', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '10px', padding: '0 4px'
              }}>Files ({nodes.length})</div>
              {nodes.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNodeClick(n)}
                  style={{
                    padding: '7px 10px',
                    marginBottom: '3px',
                    background: selectedNode?.id === n.id ? '#e2e2e222' : 'transparent',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${getNodeColor(n.data?.nodeType || 'file')}`,
                    color: selectedNode?.id === n.id ? '#ffffff' : '#a0a0a0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (selectedNode?.id !== n.id) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#f5f5f5' } }}
                  onMouseLeave={e => { if (selectedNode?.id !== n.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a0a0a0' } }}
                >{n.data?.label || n.id}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── AI REVIEW MODAL ── */}
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

        {/* ── FLOATING AI ASSISTANT ── */}
        <NodeInspector
          node={selectedNode}
          depMap={depMap}
          stats={stats}
          impact={blastRadius}
          showImpact={showImpact}
          onToggleImpact={() => setShowImpact(value => !value)}
          messages={messages}
          loading={loading}
          error={error}
          onSendMessage={handleSendMessage}
          onClearChat={clearChat}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onClose={closeInspector}
        />
      </div>
    </div>
  )
}

export default App
