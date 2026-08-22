import React, { useEffect, useMemo, useState } from 'react'
import GraphCanvas from '../GraphCanvas'
import StatsDisplay from '../StatBadge'
import { getRun } from '../../services/runsApi'
import { adaptAnalysisToGraph } from '../../utils/graphAdapter'

/**
 * ShareViewer - Public read-only view of a single saved run,
 * rendered at /share/:runId without any project context.
 */
export default function ShareViewer({ runId }) {
  const [state, setState] = useState({ status: 'loading', run: null })

  const graph = useMemo(() => {
    if (!state.run?.snapshot?.nodes) return null
    return adaptAnalysisToGraph({
      nodes: state.run.snapshot.nodes,
      edges: state.run.snapshot.edges || [],
      depMap: state.run.depMap || {},
      cyclicEdges: state.run.snapshot.cyclicEdges || [],
    })
  }, [state.run])

  useEffect(() => {
    let cancelled = false
    getRun(runId)
      .then((run) => {
        if (!cancelled) setState({ status: 'ready', run })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', run: null })
      })
    return () => {
      cancelled = true
    }
  }, [runId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0a',
      color: '#f5f5f5',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: 'hidden'
    }}>
      <header style={{
        height: '48px',
        flexShrink: 0,
        background: '#111111',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'linear-gradient(135deg, #e2e2e2, #b0b0b0)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px'
          }}>⚡</div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>ReactViz</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
            shared architecture · read-only
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {state.run?.stats && <StatsDisplay stats={state.run.stats} />}
          <a
            href="/"
            style={{
              padding: '5px 12px',
              background: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              color: '#000000',
              fontSize: '11px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >Open ReactViz →</a>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0 }}>
        {state.status === 'loading' && (
          <div style={{
            height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: '14px'
          }}>Loading shared run…</div>
        )}
        {state.status === 'error' && (
          <div style={{
            height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <div style={{ fontSize: '28px' }}>🔗</div>
            <div style={{ color: '#f87171', fontSize: '14px' }}>
              This shared run could not be found.
            </div>
            <a href="/" style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '7px',
              color: '#ededed',
              fontSize: '12px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>Go to ReactViz</a>
          </div>
        )}
        {state.status === 'ready' && (
          graph && graph.nodes.length > 0 ? (
            <GraphCanvas
              ref={() => {}}
              initialNodes={graph.nodes}
              initialEdges={graph.edges}
              stats={state.run.stats}
              cyclicEdges={state.run.snapshot.cyclicEdges || []}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', fontSize: '14px'
            }}>This run has no graph data.</div>
          )
        )}
      </div>
    </div>
  )
}
