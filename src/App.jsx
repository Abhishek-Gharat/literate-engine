import { useState, useCallback } from 'react'
import FileInput from './components/FileInput'
import GraphCanvas from './components/GraphCanvas'
import NodeInspector from './components/NodeInspector'
import NodesLegend from './components/NodesLegend'
import { useGraphBuilder } from './hooks/useGraphBuilder'
import { useAIExplain } from './hooks/useAIExplain'
import { useNodeSelection } from './hooks/useNodeSelection'
import { useApiKey } from './hooks/useApiKey'
import { StatsDisplay } from './components/StatBadge'
import { ImportList, EmptyState } from './components/NodeCard'
import { getNodeColor } from './utils/nodeColors.js'
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, NODE_LEGEND_ITEMS } from './styles/constants.js'
import { DemoExperience } from './demo/DemoExperience.jsx'

function App() {
  const { buildGraph, loadSnapshot, resetGraph, nodes, edges, depMap, stats, loading: analysisLoading, error: analysisError } = useGraphBuilder()
  const { messages, loading, error, sendMessage, clearChat } = useAIExplain()
  const { selectedNode, showInspector, selectNode, closeInspector } = useNodeSelection()
  const { apiKey, showKeyInput, handleApiKeyChange, toggleKeyInput } = useApiKey()
  const [graphReady, setGraphReady] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

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
    closeInspector()
    resetGraph()
  }

  const handleNodeClick = (node) => {
    selectNode(node?.data || node)
  }

  const handleShowInspector = () => {
    // Opens inspector without changing selected node
  }

  const handleSendMessage = (text) => {
    sendMessage(text, apiKey, selectedNode, depMap, stats)
  }

  const handleTryDemo = () => {
    setDemoMode(true)
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
        background: '#0a0a12',
        color: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0a0a12',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden', color: '#f1f5f9'
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        height: '48px', flexShrink: 0,
        background: '#0d0d14',
        borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '16px', zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '7px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '13px'
          }}>⚡</div>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>
            React<span style={{ color: '#7c3aed' }}>Viz</span>
          </span>
        </div>

        <div style={{ color: '#334155', fontSize: '13px' }}>
          My Projects › <span style={{ color: '#64748b' }}>{selectedProject?.name || 'Unsaved'}</span>
        </div>

        {stats && <StatsDisplay stats={stats} />}

        <button
          onClick={handleBackToInput}
          style={{
            padding: '6px 12px', background: 'transparent',
            border: '1px solid #1e1e2e', borderRadius: '7px',
            color: '#64748b', cursor: 'pointer', fontSize: '12px',
            marginLeft: stats ? '0' : 'auto'
          }}
        >← Back</button>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: '260px', flexShrink: 0,
          background: '#0d0d14',
          borderRight: '1px solid #1e1e2e',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>

          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid #1e1e2e', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)', color: '#475569', fontSize: '13px'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search node..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  background: '#13131f', border: '1px solid #1e1e2e',
                  borderRadius: '8px', color: '#f1f5f9',
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
                  onClick={handleShowInspector}
                  style={{
                    width: '100%', padding: '9px',
                    background: '#7c3aed22',
                    border: '1px solid #7c3aed44',
                    borderRadius: '8px', color: '#a78bfa',
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
                <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                  Click a node to inspect
                </div>
              </div>
            )}
          </div>

          {/* AI Context */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #1e1e2e', flexShrink: 0 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '10px'
            }}>
              <span style={{
                fontSize: '11px', color: '#475569', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '0.8px'
              }}>AI Context</span>
              <button
                onClick={toggleKeyInput}
                style={{
                  background: 'none', border: 'none',
                  color: '#475569', cursor: 'pointer', fontSize: '14px'
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
                  background: '#13131f', border: '1px solid #1e1e2e',
                  borderRadius: '7px', color: '#f1f5f9',
                  fontSize: '12px', outline: 'none',
                  boxSizing: 'border-box', marginBottom: '8px'
                }}
              />
            )}

            {!showKeyInput && (
              <div style={{
                padding: '8px 10px', background: '#13131f',
                border: '1px solid #1e1e2e', borderRadius: '7px',
                color: apiKey ? '#22c55e' : '#475569',
                fontSize: '12px', marginBottom: '8px'
              }}>
                {apiKey ? '✓ API Key configured' : 'API Key Required'}
              </div>
            )}

            <button
              onClick={() => {}}
              style={{
                width: '100%', padding: '9px',
                background: apiKey ? '#7c3aed' : '#13131f',
                border: `1px solid ${apiKey ? '#7c3aed' : '#1e1e2e'}`,
                borderRadius: '7px',
                color: apiKey ? '#fff' : '#334155',
                cursor: apiKey ? 'pointer' : 'not-allowed',
                fontSize: '12px', fontWeight: '600', transition: 'all 0.2s'
              }}
            >💬 Open AI Chat</button>
          </div>
        </div>

        {/* ── GRAPH CANVAS ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GraphCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodeClick={handleNodeClick}
            searchTerm={search}
          />
        </div>

        {/* ── RIGHT PANEL ── */}
        {showInspector && (
          <NodeInspector
            node={selectedNode}
            depMap={depMap}
            stats={stats}
            messages={messages}
            loading={loading}
            error={error}
            onSendMessage={handleSendMessage}
            onClearChat={clearChat}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
            onClose={closeInspector}
          />
        )}
      </div>
    </div>
  )
}

export default App
