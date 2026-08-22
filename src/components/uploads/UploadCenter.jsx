import React, { useRef } from 'react'
import { findEntryPoints } from '../../utils/nodeTypeClassifier'

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
      padding: '24px 32px 32px',
      gap: '16px',
      overflowY: 'auto',
      background: '#000000',
      minWidth: 0
    }}>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '28px',
          lineHeight: '1.1',
          fontWeight: '800',
          margin: 0,
          color: '#ffffff',
          textShadow: 'none'
        }}>Analyze Code</h1>
        <p style={{ color: '#a1a1a1', margin: '8px 0 0', fontSize: '14px' }}>
          {selectedProject
            ? `Project: ${selectedProject.name}`
            : 'Select a project or create a new one'}
        </p>
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        width: '100%',
        maxWidth: 'none'
      }}>
        {['local', 'github'].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m) }}
            disabled={isAnalyzing}
            style={{
              height: '44px',
              padding: '0 16px',
              borderRadius: '8px',
              border: mode === m ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontWeight: '800',
              fontSize: '15px',
              background: mode === m ? '#ffffff' : '#111111',
              color: mode === m ? '#000000' : '#a1a1a1',
              opacity: isAnalyzing ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: mode === m ? '0 8px 20px rgba(255,255,255,0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span style={{
              width: m === 'local' ? '20px' : '22px',
              height: m === 'local' ? '15px' : '11px',
              border: '2px solid currentColor',
              borderRadius: m === 'local' ? '3px' : '999px',
              boxSizing: 'border-box',
              display: 'inline-block'
            }} />
            {m === 'local' ? 'Local Files' : 'GitHub URL'}
          </button>
        ))}
      </div>

      <div style={{
        background: '#111111',
        borderRadius: '12px',
        padding: 0,
        width: '100%',
        border: 'none',
        opacity: !hasProject ? 0.5 : 1,
        pointerEvents: !hasProject ? 'none' : 'auto',
        boxSizing: 'border-box'
      }}>
        {mode === 'local' ? (
          <div style={{ textAlign: 'center' }}>
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
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '10px',
                minHeight: '200px',
                padding: '24px 20px',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.2s',
                opacity: isAnalyzing ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: 1
              }}>⌂</div>
              <p style={{ margin: '16px 0 8px', fontWeight: '800', fontSize: '18px', color: '#ededed' }}>
                {isAnalyzing ? 'Analyzing...' : 'Select Files'}
              </p>
              <p style={{
                color: '#a1a1a1',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                letterSpacing: '1.2px',
                margin: 0
              }}>
                .js .jsx .ts .tsx files supported
              </p>
              <p style={{
                color: '#71717a',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                letterSpacing: '1px',
                margin: '12px 0 0'
              }}>
                Files will be analyzed and saved with the selected project
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            minHeight: '200px',
            border: '2px dashed rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '32px',
            boxSizing: 'border-box'
          }}>
            <label style={{ fontSize: '14px', color: '#ededed', display: 'block', marginBottom: '8px' }}>
              GitHub Public Repo URL
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isAnalyzing && onGithubFetch()}
              disabled={isAnalyzing}
              placeholder="https://github.com/facebook/react"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: '#0a0a0a',
                color: '#ededed',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                opacity: isAnalyzing ? 0.5 : 1
              }}
            />
            <button
              onClick={onGithubFetch}
              disabled={isAnalyzing || !githubUrl.trim()}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: (isAnalyzing || !githubUrl.trim()) ? '#1a1a1a' : '#ffffff',
                color: (isAnalyzing || !githubUrl.trim()) ? '#71717a' : '#000000',
                fontWeight: '800',
                fontSize: '14px',
                cursor: (isAnalyzing || !githubUrl.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >{isAnalyzing ? 'Analyzing...' : 'Analyze Repo ->'}</button>
          </div>
        )}
      </div>

      <div style={{
        width: '100%',
        maxWidth: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <MetricCard title="Files Analyzed" value={filesAnalyzed} suffix="files" icon="▤" />
        <MetricCard title="Components Found" value={componentsFound} suffix="components" icon="□" />
        <div style={{
          minHeight: '72px',
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            color: '#a1a1a1',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>Snapshot Status</div>
          <div style={{
            height: '36px',
            borderRadius: '11px',
            border: `1px solid ${statusBorder}`,
            background: statusBg,
            color: statusColor,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '13px',
            letterSpacing: '1.6px'
          }}>{
            isAnalyzing
              ? '⟳ Analyzing project...'
              : filesAnalyzed === 0
                ? '○ No snapshot available'
                : '✓ Ready to visualize'
          }</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          minHeight: '160px',
          width: '100%',
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          <div style={{
            height: '44px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxSizing: 'border-box'
          }}>
            <span style={{
              color: '#ededed',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Analysis Summary</span>
            <span style={{
              color: '#71717a',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              letterSpacing: '1.4px'
            }}>{latestRun ? `Run: ${new Date(latestRun.createdAt).toLocaleDateString()}` : 'No analysis yet'}</span>
          </div>
          <div style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '152px 1fr',
            gap: '24px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '112px',
              height: '112px',
              borderRadius: '50%',
              border: '6px solid rgba(255,255,255,0.1)',
              borderRightColor: '#ffffff',
              borderTopColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <strong style={{ fontSize: '26px', color: '#ededed' }}>{hasAnalysis ? Math.min(100, Math.round((componentsFound / Math.max(filesAnalyzed, 1)) * 100)) : 0}%</strong>
              <span style={{
                color: '#a1a1a1',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '12px',
                letterSpacing: '1px'
              }}>Components</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <strong style={{ color: '#ededed', fontSize: '16px' }}>Project Stats</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Components</span>
                  <strong style={{ color: '#0cce6b' }}>{latestStats.totalComponents || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Hooks</span>
                  <strong style={{ color: '#0cce6b' }}>{latestStats.totalHooks || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Contexts</span>
                  <strong style={{ color: '#0cce6b' }}>{latestStats.totalContexts || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Routes</span>
                  <strong style={{ color: '#0cce6b' }}>{latestStats.totalRoutes || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Config Files</span>
                  <strong style={{ color: '#0cce6b' }}>{latestStats.totalConfigs || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1a1' }}>Total Files</span>
                  <strong style={{ color: '#0cce6b' }}>{filesAnalyzed}</strong>
                </div>
                {hasEntryPoints && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    gridColumn: '1 / -1',
                    padding: '6px 0',
                    marginTop: '4px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ color: '#f5a623', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🚪</span> Entry Points
                    </span>
                    <strong style={{ color: '#f5a623' }}>{entryPoints.length}</strong>
                  </div>
                )}
              </div>
              {hasEntryPoints && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#71717a', 
                    marginBottom: '4px',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                  }}>
                    Detected:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {entryPoints.slice(0, 3).map((file, i) => (
                      <span key={i} style={{
                        fontSize: '11px',
                        color: '#f5a623',
                        background: 'rgba(245,166,35,0.15)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(245,166,35,0.3)',
                        fontFamily: 'monospace'
                      }}>
                        {file.split('/').pop()}
                      </span>
                    ))}
                    {entryPoints.length > 3 && (
                      <span style={{
                        fontSize: '11px',
                        color: '#71717a',
                        padding: '2px 8px'
                      }}>
                        +{entryPoints.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          minHeight: '160px',
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '20px',
          color: '#fff',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#ededed' }}>Try Demo Project</h2>
          <p style={{ margin: '12px 24px 16px 0', fontSize: '15px', lineHeight: '1.45', color: '#a1a1a1' }}>
            See ReactViz in action with a pre-configured e-commerce React app. 
            No setup required — explore the architecture instantly.
          </p>
          <button
            onClick={onTryDemo}
            disabled={isAnalyzing}
            style={{
              padding: '10px 20px',
              background: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.5 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isAnalyzing) {
                e.currentTarget.style.background = '#e2e2e2'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>▶</span>
            Try Demo
          </button>
          <div style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>🚀</div>
        </div>
      </div>

      {isAnalyzing && (
        <div data-testid="analyzing-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#ffffff',
          fontWeight: '600'
        }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>...</span>
          Analyzing files...
        </div>
      )}

      {analysisSuccess && (
        <div data-testid="success-message" style={{
          background: 'rgba(12,206,107,0.1)',
          border: '1px solid rgba(12,206,107,0.4)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#0cce6b',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>OK</span>{analysisSuccess}
        </div>
      )}

      {(hasAnalysisError || analysisError) && (
        <div data-testid="error-message" style={{
          background: 'rgba(255,92,92,0.1)',
          border: '1px solid rgba(255,92,92,0.4)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#ff5c5c',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>!</span>{hasAnalysisError || analysisError}
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, suffix, icon }) {
  return (
    <div style={{
      minHeight: '72px',
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div>
        <div style={{
          color: '#a1a1a1',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <strong style={{ color: '#ededed', fontSize: '22px', lineHeight: 1 }}>{value}</strong>
          <span style={{ color: '#a1a1a1', fontSize: '13px' }}>{suffix}</span>
        </div>
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        background: '#1a1a1a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>{icon}</div>
    </div>
  )
}
