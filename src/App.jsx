import { useState, useRef } from 'react'
import FileInput from './components/FileInput'
import RunDetailPanel from './components/RunDetailPanel'
import GraphCanvas from './components/GraphCanvas'
import NodeInspector from './components/NodeInspector'
import { useGraphBuilder } from './hooks/useGraphBuilder'
import { useAIExplain } from './hooks/useAIExplain'

function App() {
  const { buildGraph, loadSnapshot, resetGraph, nodes, edges, depMap, stats, loading: analysisLoading, error: analysisError } = useGraphBuilder()
  const { messages, loading, error, sendMessage, clearChat } = useAIExplain()
  const [graphReady, setGraphReady] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showInspector, setShowInspector] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('reactviz_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)

  const handleFilesReady = async (files, projectId) => {
    try {
      await buildGraph(files, projectId)
      setGraphReady(true)
    } catch {
      setGraphReady(false)
    }
  }

  const handleLoadRun = (snapshot, run) => {
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
  }

  const handleSelectRun = (runOrId) => {
    if (typeof runOrId === 'string') {
      // If passed an ID, look it up in runs
      const run = runs.find(r => r.id === runOrId)
      setSelectedRun(run || null)
    } else {
      // Passed a run object directly
      setSelectedRun(runOrId || null)
    }
  }

  const handleRunsChange = (newRuns) => {
    setRuns(newRuns)
    // Auto-select the newest run (first in list, assuming sorted by date desc)
    // Always update to newest run when runs change
    if (newRuns.length > 0) {
      setSelectedRun(newRuns[0])
    }
  }

  const handleBackToInput = () => {
    setGraphReady(false)
    setSelectedNode(null)
    setShowInspector(false)
    resetGraph()
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node.data)
    setShowInspector(true)
  }

  const handleSendMessage = (text) => {
    sendMessage(text, apiKey, selectedNode, depMap, stats)
  }

  const handleApiKeyChange = (val) => {
    setApiKey(val)
    localStorage.setItem('reactviz_api_key', val)
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
        {/* Main dashboard area with FileInput */}
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
          />
        </div>
        {/* Run Details Panel - Fixed width */}
        <div style={{
          width: '380px',
          flexShrink: 0,
          background: '#0d0d14',
          borderLeft: '1px solid #1e1e2e',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <RunDetailPanel run={selectedRun} />
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

        {stats && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
            {[
              { label: `${stats.totalFiles} files`, color: '#6366f1' },
              { label: `${stats.totalComponents} components`, color: '#059669' },
              { label: `${stats.totalHooks} hooks`, color: '#d97706' },
              stats.cyclesFound > 0
                ? { label: `⚠ ${stats.cyclesFound} cycles`, color: '#ef4444' }
                : { label: '✓ No cycles', color: '#22c55e' }
            ].map((s, i) => (
              <span key={i} style={{
                padding: '3px 10px',
                background: `${s.color}15`,
                border: `1px solid ${s.color}40`,
                borderRadius: '20px', fontSize: '12px',
                color: s.color, fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%', background: s.color,
                  display: 'inline-block'
                }} />
                {s.label}
              </span>
            ))}
          </div>
        )}

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
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e2e', flexShrink: 0 }}>
            <div style={{
              fontSize: '11px', color: '#475569', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'
            }}>Nodes Legend</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Root', color: '#7c3aed' },
                { label: 'Component', color: '#059669' },
                { label: 'Hook', color: '#d97706' },
                { label: 'Page', color: '#0891b2' },
                { label: 'External', color: '#475569' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node info */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {selectedNode ? (
              <>
                <div style={{
                  background: '#13131f', border: '1px solid #2a2a3d',
                  borderRadius: '10px', padding: '14px', marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px',
                    background: '#7c3aed22', border: '1px solid #7c3aed44',
                    borderRadius: '4px', marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '10px', color: '#7c3aed',
                      fontWeight: '700', textTransform: 'uppercase'
                    }}>{selectedNode.nodeType}</span>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '14px',
                    fontWeight: '700', color: '#f1f5f9', wordBreak: 'break-word'
                  }}>{selectedNode.label}</div>
                </div>

                {selectedNode.imports?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '11px', color: '#475569', fontWeight: '700',
                      textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'
                    }}>Imports</div>
                    {selectedNode.imports.map((imp, i) => (
                      <div key={i} style={{
                        padding: '6px 10px', marginBottom: '3px',
                        background: '#13131f', borderRadius: '5px',
                        borderLeft: '2px solid #7c3aed',
                        color: '#a78bfa', fontSize: '12px', fontFamily: 'monospace'
                      }}>{imp}</div>
                    ))}
                  </div>
                )}

                {selectedNode.importedBy?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '11px', color: '#475569', fontWeight: '700',
                      textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'
                    }}>Used By</div>
                    {selectedNode.importedBy.map((imp, i) => (
                      <div key={i} style={{
                        padding: '6px 10px', marginBottom: '3px',
                        background: '#13131f', borderRadius: '5px',
                        borderLeft: '2px solid #22c55e',
                        color: '#86efac', fontSize: '12px', fontFamily: 'monospace'
                      }}>{imp}</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowInspector(true)}
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
                onClick={() => setShowKeyInput(s => !s)}
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
              onClick={() => setShowInspector(true)}
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
            onClose={() => {
              setShowInspector(false)
              setSelectedNode(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
