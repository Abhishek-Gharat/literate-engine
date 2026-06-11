import React, { useRef } from 'react'

/**
 * UploadCenter - Center panel with upload controls
 *
 * @param {Object} props
 * @param {string} props.mode - Current upload mode ('local' or 'github')
 * @param {Function} props.setMode - Callback to set upload mode
 * @param {string} props.githubUrl - Current GitHub URL value
 * @param {Function} props.setGithubUrl - Callback to set GitHub URL
 * @param {Object|null} props.selectedProject - Currently selected project
 * @param {boolean} props.isAnalyzing - Whether analysis is in progress
 * @param {string} props.hasAnalysisError - Error message from analysis
 * @param {string} props.analysisError - Current error message
 * @param {string} props.analysisSuccess - Success message
 * @param {Function} props.onLocalFiles - Callback for local file upload
 * @param {Function} props.onGithubFetch - Callback for GitHub fetch
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
  const snapshotStatus = isAnalyzing ? 'Analyzing...' : hasAnalysis ? 'Analysis complete' : 'Ready to visualize'
  const statusColor = isAnalyzing ? '#fbbf24' : hasAnalysis ? '#52f0c5' : '#52f0c5'
  const statusBg = isAnalyzing ? '#451a03' : hasAnalysis ? '#123d45' : '#123d45'
  const statusBorder = isAnalyzing ? '#92400e' : hasAnalysis ? '#1d766f' : '#1d766f'

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
      background: '#0b1424',
      minWidth: 0
    }}>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '28px',
          lineHeight: '1.1',
          fontWeight: '800',
          margin: 0,
          color: '#9ed8dc',
          textShadow: '2px 2px 0 #25465c'
        }}>Analyze Code</h1>
        <p style={{ color: '#d7d2e6', margin: '8px 0 0', fontSize: '14px' }}>
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
              border: mode === m ? '1px solid #8b5cf6' : '1px solid #4a536a',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontWeight: '800',
              fontSize: '15px',
              background: mode === m ? '#7c3aed' : '#2a344c',
              color: mode === m ? '#fff' : '#cbd5e1',
              opacity: isAnalyzing ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: mode === m ? '0 8px 20px #7c3aed28' : 'none',
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
        background: '#121d2f',
        borderRadius: '12px',
        padding: 0,
        width: '100%',
        // maxWidth: 'none',
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
                border: '2px dashed #55507a',
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
                background: '#2b3150',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d8b4fe',
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: 1
              }}>⌂</div>
              <p style={{ margin: '16px 0 8px', fontWeight: '800', fontSize: '18px' }}>
                {isAnalyzing ? 'Analyzing...' : 'Select Files'}
              </p>
              <p style={{
                color: '#d7d2e6',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                letterSpacing: '1.2px',
                margin: 0
              }}>
                .js .jsx .ts .tsx files supported
              </p>
              <p style={{
                color: '#768198',
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
            border: '2px dashed #55507a',
            borderRadius: '10px',
            padding: '32px',
            boxSizing: 'border-box'
          }}>
            <label style={{ fontSize: '14px', color: '#d7d2e6', display: 'block', marginBottom: '8px' }}>
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
                border: '1px solid #4a536a',
                background: '#0b1424',
                color: '#f1f5f9',
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
                background: (isAnalyzing || !githubUrl.trim()) ? '#334155' : '#7c3aed',
                color: (isAnalyzing || !githubUrl.trim()) ? '#64748b' : '#fff',
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
        {/* cards here  */}
        <MetricCard title="Files Analyzed" value={filesAnalyzed} suffix="files" icon="▤" />
        <MetricCard title="Components Found" value={componentsFound} suffix="components" icon="□" />
        <div style={{
          minHeight: '72px',
          background: '#121b2b',
          border: '1px solid #23314b',
          borderRadius: '8px',
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            color: '#d7d2e6',
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
          background: '#121b2b',
          border: '1px solid #23314b',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          <div style={{
            height: '44px',
            borderBottom: '1px solid #3b465d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxSizing: 'border-box'
          }}>
            <span style={{
              color: '#ead7ff',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Analysis Summary</span>
            <span style={{
              color: '#6f7890',
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
              border: '6px solid #2a344c',
              borderRightColor: '#7c3aed',
              borderTopColor: '#7c3aed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <strong style={{ fontSize: '26px', color: '#ece8ff' }}>{hasAnalysis ? Math.min(100, Math.round((componentsFound / Math.max(filesAnalyzed, 1)) * 100)) : 0}%</strong>
              <span style={{
                color: '#9aa4bd',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '12px',
                letterSpacing: '1px'
              }}>Components</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <strong style={{ color: '#ece8ff', fontSize: '16px' }}>Project Stats</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Components</span>
                  <strong style={{ color: '#52f0c5' }}>{latestStats.totalComponents || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Hooks</span>
                  <strong style={{ color: '#52f0c5' }}>{latestStats.totalHooks || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Contexts</span>
                  <strong style={{ color: '#52f0c5' }}>{latestStats.totalContexts || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Routes</span>
                  <strong style={{ color: '#52f0c5' }}>{latestStats.totalRoutes || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Config Files</span>
                  <strong style={{ color: '#52f0c5' }}>{latestStats.totalConfigs || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa4bd' }}>Total Files</span>
                  <strong style={{ color: '#52f0c5' }}>{filesAnalyzed}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          minHeight: '160px',
          background: '#1a1a2e',
          border: '1px solid #2a2a3d',
          borderRadius: '8px',
          padding: '20px',
          color: '#fff',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#f1f5f9' }}>Try Demo Project</h2>
          <p style={{ margin: '12px 24px 16px 0', fontSize: '15px', lineHeight: '1.45', color: '#94a3b8' }}>
            See ReactViz in action with a pre-configured e-commerce React app. 
            No setup required — explore the architecture instantly.
          </p>
          <button
            onClick={onTryDemo}
            disabled={isAnalyzing}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
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
                e.currentTarget.style.background = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366f1'
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
            background: '#6366f115',
            border: '1px solid #6366f130',
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
          color: '#7c3aed',
          fontWeight: '600'
        }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>...</span>
          Analyzing files...
        </div>
      )}

      {analysisSuccess && (
        <div data-testid="success-message" style={{
          background: '#22c55e15',
          border: '1px solid #22c55e40',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#22c55e',
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
          background: '#ef444415',
          border: '1px solid #ef444440',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#ef4444',
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
      background: '#121b2b',
      border: '1px solid #23314b',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div>
        <div style={{
          color: '#d7d2e6',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <strong style={{ color: '#ece8ff', fontSize: '22px', lineHeight: 1 }}>{value}</strong>
          <span style={{ color: '#b9c0d3', fontSize: '13px' }}>{suffix}</span>
        </div>
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        background: '#2a344c',
        color: '#d8b4fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>{icon}</div>
    </div>
  )
}
