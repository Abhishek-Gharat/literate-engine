import React, { useRef } from 'react'
import { findEntryPoints } from '../../utils/nodeTypeClassifier'
import { computeHealthScore, getHealthColor } from '../../utils/healthScore'
import { AnimateTabs, AnimateTooltip, AnimateGlowCard } from '../ui/animate'

/**
 * getRunHealth - Prefer recomputing from the snapshot (richer breakdown),
 * fall back to cached stats for runs without one.
 */
function getRunHealth(run) {
  const stats = run?.stats || {}
  const snapshot = run?.snapshot || {}
  const nodes = snapshot.nodes || []

  if (nodes.length > 0 || typeof stats.healthScore !== 'number') {
    const result = computeHealthScore({
      nodes,
      cyclicEdges: snapshot.cyclicEdges || [],
      unresolvedImports: (run?.unresolvedImports || []).length
    })
    if (result.score !== null) {
      return { score: result.score, grade: result.grade, ...result.metrics }
    }
  }

  return {
    score: typeof stats.healthScore === 'number' ? stats.healthScore : null,
    grade: stats.healthGrade || null,
    cycles: stats.cyclesFound ?? 0,
    orphans: 0,
    godComponents: 0
  }
}

/**
 * UploadCenter - Center panel with upload controls
 */
export default function UploadCenter({
  mode,
  setMode,
  githubUrl,
  setGithubUrl,
  runs = [],
  selectedProject,
  isAnalyzing,
  hasAnalysisError,
  analysisError,
  analysisSuccess,
  onLocalFiles,
  onGithubFetch,
  onTryDemo
}) {
  const inputRef = useRef()
  const hasProject = Boolean(selectedProject)
  const latestRun = runs?.[0] || null
  const latestStats = latestRun?.stats || {}
  const filesAnalyzed = latestStats.totalFiles || 0
  const componentsFound = latestStats.totalComponents || 0
  const hasAnalysis = filesAnalyzed > 0 || componentsFound > 0
  const statusColor = isAnalyzing ? '#f5a623' : hasAnalysis ? '#0cce6b' : '#0cce6b'
  const statusBg = isAnalyzing ? 'rgba(245,166,35,0.1)' : hasAnalysis ? 'rgba(12,206,107,0.1)' : 'rgba(12,206,107,0.1)'
  const statusBorder = isAnalyzing ? 'rgba(245,166,35,0.3)' : hasAnalysis ? 'rgba(12,206,107,0.3)' : 'rgba(12,206,107,0.3)'

  const snapshotFiles = latestRun?.snapshot?.nodes?.map(n => n.id) || []
  const entryPoints = findEntryPoints(snapshotFiles)
  const hasEntryPoints = entryPoints.length > 0
  const latestHealth = latestRun ? getRunHealth(latestRun) : null
  const healthTrend = (runs || [])
    .slice(0, 10)
    .reverse()
    .map(run => getRunHealth(run).score)
    .filter(score => typeof score === 'number')

  const handleFileChange = async (e) => {
    try {
      await onLocalFiles(e.target.files)
    } catch {
      // Error is handled by parent
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      padding: '28px 36px 40px',
      gap: '20px',
      overflowY: 'auto',
      background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(99, 102, 241, 0.12), transparent 70%), #07090e',
      minWidth: 0
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: '4px' }}>
        <h1 style={{
          fontSize: '28px',
          lineHeight: '1.2',
          fontWeight: '900',
          margin: 0,
          background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          {selectedProject ? `New Analysis for ${selectedProject.name}` : 'Analyze Architecture'}
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          {selectedProject
            ? `Upload files or enter a repository to create a new architecture snapshot for ${selectedProject.name}.`
            : 'Select or create a project to associate with this analysis run.'}
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          margin: '10px auto 0',
          padding: '4px 14px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: selectedProject ? '#cbd5e1' : '#64748b',
          fontSize: '13px'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: selectedProject ? '#10b981' : '#f59e0b',
            boxShadow: selectedProject ? '0 0 6px #10b981' : 'none'
          }} />
          <span>
            {selectedProject
              ? `Project: ${selectedProject.name}`
              : 'No project selected'}
          </span>
        </div>
      </div>

      {!hasProject && (
        <div
          data-testid="no-project-warning"
          style={{
            width: 1,
            height: 1,
            overflow: 'hidden',
            position: 'absolute',
            clip: 'rect(0 0 0 0)'
          }}
        >
          No Project Selected
        </div>
      )}

      {/* Mode Switcher (AnimateTabs from Animate UI) */}
      <div style={{ width: '100%' }}>
        <AnimateTabs
          tabs={[
            { id: 'local', label: 'Local Files', icon: '📁' },
            { id: 'github', label: 'GitHub Repository', icon: '⚡' },
            { id: 'demo', label: 'Demo Sandbox', icon: '✦' },
          ]}
          activeTab={mode}
          onChange={(newMode) => !isAnalyzing && setMode(newMode)}
          layoutId="upload-mode-active-capsule"
          containerStyle={{
            width: '100%',
            display: 'flex',
            padding: '4px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          tabStyle={{
            flex: 1,
            height: '42px',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700',
          }}
        />
      </div>

      {!hasProject && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#c7d2fe'
        }}>
          <span>💡</span>
          <span>No project selected — select an existing project from the top bar or create a new project to associate with this analysis run.</span>
        </div>
      )}

      {/* Upload Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        padding: 0,
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxSizing: 'border-box'
      }}>
        {mode === 'local' ? (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".js,.jsx,.ts,.tsx"
              onChange={handleFileChange}
              disabled={isAnalyzing}
              data-testid="file-input"
              style={{ display: 'none' }}
            />
            <div
              data-testid="file-dropzone"
              onClick={() => !isAnalyzing && inputRef.current.click()}
              style={{
                border: '2px dashed rgba(99, 102, 241, 0.35)',
                borderRadius: '12px',
                minHeight: '210px',
                padding: '28px 20px',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isAnalyzing ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.04) 0%, transparent 80%)'
              }}
              onMouseEnter={e => {
                if (!isAnalyzing) {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.7)'
                  e.currentTarget.style.background = 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 80%)'
                }
              }}
              onMouseLeave={e => {
                if (!isAnalyzing) {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)'
                  e.currentTarget.style.background = 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.04) 0%, transparent 80%)'
                }
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: 1,
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
              }}>⇪</div>
              <p style={{ margin: '16px 0 8px', fontWeight: '800', fontSize: '18px', color: '#f8fafc' }}>
                {isAnalyzing ? 'Analyzing...' : 'Click or Drop files to analyze'}
              </p>
              
              {/* Formats chips */}
              <div style={{ display: 'flex', gap: '6px', margin: '6px 0 10px' }}>
                {['.js', '.jsx', '.ts', '.tsx'].map(ext => (
                  <span key={ext} style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8'
                  }}>{ext}</span>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isAnalyzing && inputRef.current) inputRef.current.click()
                }}
                disabled={isAnalyzing}
                style={{
                  marginTop: '6px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📂</span> Browse Files
              </button>

              <p style={{
                color: '#64748b',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '12px',
                letterSpacing: '0.4px',
                marginTop: '12px',
                marginBottom: 0
              }}>
                Files will be analyzed with dual AST engine and saved to current project
              </p>
            </div>
          </div>
        ) : mode === 'demo' ? (
          <div style={{
            minHeight: '210px',
            borderRadius: '12px',
            padding: '28px',
            boxSizing: 'border-box',
            margin: '10px',
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.12) 0%, transparent 80%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px'
            }}>✦</div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                Explore ShopApp Demo Sandbox
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '520px', lineHeight: '1.5' }}>
                Pre-configured e-commerce architecture with 15 modules (React 18 root, cart context, custom hooks, and pages). 
                Instantly inspect dependency chains, calculate blast radius, and test 1-click refactoring.
              </p>
            </div>
            <button
              type="button"
              onClick={onTryDemo}
              disabled={isAnalyzing}
              style={{
                marginTop: '6px',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                border: 'none',
                color: '#090d16',
                fontSize: '13px',
                fontWeight: '700',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>▶</span> Launch Interactive Demo
            </button>
          </div>
        ) : (
          <div style={{
            minHeight: '210px',
            border: '2px dashed rgba(99, 102, 241, 0.35)',
            borderRadius: '12px',
            padding: '32px',
            boxSizing: 'border-box',
            margin: '10px',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.04) 0%, transparent 80%)'
          }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}>
              <span>🐙</span> GitHub Public Repository URL
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAnalyzing && onGithubFetch()}
                disabled={isAnalyzing}
                placeholder="https://github.com/facebook/react"
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  opacity: isAnalyzing ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(99, 102, 241, 0.2)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                onClick={onGithubFetch}
                disabled={isAnalyzing || !githubUrl.trim()}
                style={{
                  padding: '0 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: (isAnalyzing || !githubUrl.trim())
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: (isAnalyzing || !githubUrl.trim()) ? '#64748b' : '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: (isAnalyzing || !githubUrl.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: (isAnalyzing || !githubUrl.trim())
                    ? 'none'
                    : '0 4px 16px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{isAnalyzing ? '...' : 'Fetch & Analyze'}</span>
                {!isAnalyzing && <span>→</span>}
              </button>
            </div>
            <p style={{
              color: '#64748b',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '11px',
              margin: '10px 0 0'
            }}>
              Supports default branch auto-detection, subtrees, and deep component import analysis.
            </p>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{
        width: '100%',
        maxWidth: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <MetricCard title="Files Analyzed" value={filesAnalyzed} suffix="files" icon="▤" />
        <MetricCard title="Components Found" value={componentsFound} suffix="components" icon="□" />
        <HealthCard health={latestHealth} trend={healthTrend} />
        
        {/* Snapshot Status Card */}
        <div style={{
          minHeight: '76px',
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 18px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            color: '#64748b',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>Snapshot Status</div>
          <div style={{
            height: '34px',
            borderRadius: '8px',
            border: `1px solid ${statusBorder}`,
            background: statusBg,
            color: statusColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.4px'
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
              animation: isAnalyzing ? 'pulse-glow 1.5s infinite' : 'none'
            }} />
            <span>{
              isAnalyzing
                ? 'Analyzing project...'
                : filesAnalyzed === 0
                  ? 'No snapshot available'
                  : 'Ready to visualize'
            }</span>
          </div>
        </div>
      </div>

      {/* Analysis Summary & Demo Project Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Analysis Summary Card */}
        <AnimateGlowCard
          glowColor="rgba(56, 189, 248, 0.18)"
          glowRadius={360}
          style={{
            minHeight: '180px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{
            height: '46px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.015)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxSizing: 'border-box'
          }}>
            <span style={{
              color: '#f8fafc',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>Analysis Summary</span>
            <span style={{
              color: '#64748b',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '11px',
              letterSpacing: '0.5px'
            }}>{latestRun ? `Run: ${new Date(latestRun.createdAt).toLocaleDateString()}` : 'No analysis yet'}</span>
          </div>
          <div style={{
            padding: '24px 20px',
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            gap: '24px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '6px solid rgba(255,255,255,0.06)',
              borderRightColor: '#6366f1',
              borderTopColor: '#3b82f6',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <strong style={{ fontSize: '26px', color: '#f8fafc', fontWeight: '800' }}>
                {hasAnalysis ? Math.min(100, Math.round((componentsFound / Math.max(filesAnalyzed, 1)) * 100)) : 0}%
              </strong>
              <span style={{
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '11px',
                letterSpacing: '0.4px',
                marginTop: '2px'
              }}>Components</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ color: '#f8fafc', fontSize: '15px' }}>Project Metrics</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Components</span>
                  <strong style={{ color: '#818cf8' }}>{latestStats.totalComponents || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Hooks</span>
                  <strong style={{ color: '#38bdf8' }}>{latestStats.totalHooks || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Contexts</span>
                  <strong style={{ color: '#c084fc' }}>{latestStats.totalContexts || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Routes</span>
                  <strong style={{ color: '#fb923c' }}>{latestStats.totalRoutes || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Config Files</span>
                  <strong style={{ color: '#94a3b8' }}>{latestStats.totalConfigs || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Total Files</span>
                  <strong style={{ color: '#10b981' }}>{filesAnalyzed}</strong>
                </div>
                {hasEntryPoints && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    gridColumn: '1 / -1',
                    padding: '8px 0 0',
                    marginTop: '4px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🚪</span> Entry Points
                    </span>
                    <strong style={{ color: '#fbbf24' }}>{entryPoints.length}</strong>
                  </div>
                )}
              </div>
              {hasEntryPoints && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {entryPoints.slice(0, 3).map((file, i) => (
                      <span key={i} style={{
                        fontSize: '11px',
                        color: '#fbbf24',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                      }}>
                        {file.split('/').pop()}
                      </span>
                    ))}
                    {entryPoints.length > 3 && (
                      <span style={{
                        fontSize: '11px',
                        color: '#64748b',
                        padding: '2px 6px'
                      }}>
                        +{entryPoints.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnimateGlowCard>

        {/* Try Demo Project Hero Card */}
        <AnimateGlowCard
          glowColor="rgba(168, 85, 247, 0.3)"
          glowRadius={400}
          style={{
            minHeight: '180px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '14px',
            padding: '24px 28px',
            color: '#ffffff',
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              color: '#c7d2fe',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              <span>✦</span> Instant Architecture Preview
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Explore Pre-Built Demo
            </h2>
            <p style={{
              margin: '8px 70px 18px 0',
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#cbd5e1'
            }}>
              See ReactViz in action with a multi-component e-commerce React app.
              Inspect cycles, blast radius, and 1-click refactoring without setup.
            </p>
          </div>
          <div>
            <button
              onClick={onTryDemo}
              disabled={isAnalyzing}
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#090d16',
                fontSize: '13px',
                fontWeight: '700',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing ? 0.5 : 1,
                transition: 'all 0.18s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <span>▶</span>
              <span>Launch Demo Project</span>
            </button>
          </div>
          <div style={{
            position: 'absolute',
            right: '24px',
            top: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px'
          }}>🚀</div>
        </AnimateGlowCard>
      </div>

      {isAnalyzing && (
        <div data-testid="analyzing-indicator" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          padding: '12px 18px',
          color: '#e0e7ff',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
          <span>Analyzing components and imports...</span>
        </div>
      )}

      {analysisSuccess && (
        <div data-testid="success-message" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '8px',
          padding: '12px 18px',
          color: '#34d399',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✓</span><span>{analysisSuccess}</span>
        </div>
      )}

      {(hasAnalysisError || analysisError) && (
        <div data-testid="error-message" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '8px',
          padding: '12px 18px',
          color: '#f87171',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚠️</span><span>{hasAnalysisError || analysisError}</span>
        </div>
      )}
    </div>
  )
}

function HealthCard({ health, trend = [] }) {
  const score = health?.score ?? null
  const hasScore = typeof score === 'number'
  const color = getHealthColor(score)

  return (
    <div style={{
      minHeight: '76px',
      background: 'rgba(255, 255, 255, 0.025)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: '12px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    }}>
      <div>
        <div style={{
          color: '#64748b',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>Architecture Health</div>
        {hasScore ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <strong style={{
                color,
                fontSize: '24px',
                lineHeight: 1,
                fontWeight: '800',
                textShadow: `0 0 12px ${color}44`
              }}>{score}</strong>
              <span style={{ color: '#64748b', fontSize: '13px' }}>/ 100</span>
              {health?.grade && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  color,
                  border: `1px solid ${color}55`,
                  background: `${color}15`,
                  marginLeft: '4px'
                }}>{health.grade}</span>
              )}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              marginTop: '5px'
            }}>
              {health.cycles || 0} cycles · {health.orphans || 0} orphans · {health.godComponents || 0} god
            </div>
          </>
        ) : (
          <div style={{ color: '#64748b', fontSize: '13px' }}>Run an analysis to score</div>
        )}
      </div>
      <Sparkline scores={trend} color={color} />
    </div>
  )
}

function Sparkline({ scores = [], color }) {
  if (scores.length < 2) {
    return (
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>◈</div>
    )
  }

  const w = 88
  const h = 40
  const pad = 4
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const step = scores.length > 1 ? (w - pad * 2) / (scores.length - 1) : 0
  const points = scores.map((s, i) => [
    pad + i * step,
    h - pad - ((s - min) / range) * (h - pad * 2)
  ])
  const path = points.map(p => p.join(',')).join(' ')
  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
    </svg>
  )
}

function MetricCard({ title, value, suffix, icon }) {
  return (
    <div style={{
      minHeight: '76px',
      background: 'rgba(255, 255, 255, 0.025)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: '12px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    }}>
      <div>
        <div style={{
          color: '#64748b',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <strong style={{ color: '#f8fafc', fontSize: '24px', lineHeight: 1, fontWeight: '800' }}>{value}</strong>
          <span style={{ color: '#64748b', fontSize: '13px' }}>{suffix}</span>
        </div>
      </div>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>{icon}</div>
    </div>
  )
}
