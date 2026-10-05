import React, { useState } from 'react'
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/constants.js'
import ApiKeyInput from '../inspector/ApiKeyInput.jsx'
import { AnimateTabs, AnimateCopyButton } from '../ui/animate'

export default function RefactorModal({
  issue,
  plan,
  loading,
  error,
  apiKey,
  onApiKeyChange,
  onRegenerate,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('diffs') // 'diffs' | 'strategy' | 'patch'
  const [copiedKey, setCopiedKey] = useState(null)
  const [showKeyConfig, setShowKeyConfig] = useState(false)

  if (!issue) return null

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDownloadPatch = () => {
    if (!plan?.patch) return
    const blob = new Blob([plan.patch], { type: 'text/x-diff;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const targetName = (issue.source || issue.node?.id || 'refactor').replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `reactviz-fix-${targetName}.patch`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const issueTitle =
    issue.type === 'cycle'
      ? `Circular Dependency: ${issue.source} ↔ ${issue.target}`
      : issue.type === 'god_component' || issue.type === 'most_connected'
      ? `Decompose God Component: ${issue.node?.data?.label || issue.node?.id}`
      : `Refactor Target: ${issue.node?.data?.label || issue.node?.id}`

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: BORDER_RADIUS.xl,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f5f5f5',
          fontFamily: TYPOGRAPHY.fontFamily.sans,
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #181818, #111111)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #b07a8a, #8b6fb0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              ✨
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  AI Architecture Refactor & Patch Generator
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: plan?.isOffline ? '#e2e2e21a' : '#0cce6b22',
                    border: `1px solid ${plan?.isOffline ? '#ffffff22' : '#0cce6b44'}`,
                    color: plan?.isOffline ? '#a0a0a0' : '#0cce6b',
                  }}
                >
                  {plan?.isOffline ? '⚡ Instant AST Rule Engine' : '🤖 OpenRouter AI'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#a0a0a0',
                  marginTop: '2px',
                  fontFamily: TYPOGRAPHY.fontFamily.mono,
                }}
              >
                {issueTitle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {plan?.patch && (
              <>
                <button
                  onClick={handleDownloadPatch}
                  style={{
                    padding: '6px 12px',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s',
                  }}
                  title="Download unified git patch file"
                >
                  <span>⬇</span> Download .patch
                </button>
                <AnimateCopyButton
                  textToCopy={plan.patch}
                  label="Copy Patch"
                  copiedLabel="Copied Patch!"
                />
              </>
            )}

            <button
              onClick={() => setShowKeyConfig((v) => !v)}
              style={{
                padding: '6px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#a0a0a0',
                cursor: 'pointer',
                fontSize: '13px',
              }}
              title="Configure OpenRouter API Key"
            >
              ⚙
            </button>

            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: '#8a8a8a',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── API KEY CONFIG ACCORDION ── */}
        {showKeyConfig && (
          <div
            style={{
              padding: '12px 20px',
              background: '#0d0d0d',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, maxWidth: '480px' }}>
              <ApiKeyInput
                apiKey={apiKey}
                onChange={onApiKeyChange}
                placeholder="Enter OpenRouter API key for live deep LLM models..."
              />
            </div>
            <button
              onClick={onRegenerate}
              disabled={loading}
              style={{
                padding: '6px 14px',
                background: '#2a2a2a',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              🔄 Re-run with AI
            </button>
          </div>
        )}

        {/* ── TABS (AnimateTabs from Animate UI) ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '8px 20px',
          }}
        >
          <AnimateTabs
            tabs={[
              { id: 'diffs', label: 'Refactored Files', icon: '📄', badge: plan?.files?.length || 0 },
              { id: 'strategy', label: 'Decoupling Strategy', icon: '📐' },
              { id: 'patch', label: 'Unified Git Diff', icon: '⚡' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            layoutId="refactor-modal-active-tab-pill"
          />
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(255,255,255,0.15)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: '13px', color: '#a0a0a0' }}>
                Analyzing AST and synthesizing architectural decoupling patch...
              </div>
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                padding: '16px',
                background: '#ff5c5c15',
                border: '1px solid #ff5c5c44',
                borderRadius: '8px',
                color: '#ff5c5c',
                fontSize: '13px',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && plan && (
            <>
              {/* TAB 1: CODE & REFACTORED FILES */}
              {activeTab === 'diffs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {plan.files && plan.files.length > 0 ? (
                    plan.files.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#0a0a0a',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '8px 14px',
                            background: '#161616',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: file.status === 'created' ? '#0cce6b22' : '#4a7c9b22',
                                color: file.status === 'created' ? '#0cce6b' : '#7dd3fc',
                                border: `1px solid ${file.status === 'created' ? '#0cce6b44' : '#4a7c9b44'}`,
                                textTransform: 'uppercase',
                              }}
                            >
                              {file.status || 'modified'}
                            </span>
                            <span
                              style={{
                                fontFamily: TYPOGRAPHY.fontFamily.mono,
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#e2e2e2',
                              }}
                            >
                              {file.path}
                            </span>
                          </div>

                          <AnimateCopyButton
                            textToCopy={file.code}
                            label="Copy File"
                            copiedLabel="Copied!"
                          />
                        </div>

                        <pre
                          style={{
                            margin: 0,
                            padding: '14px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '12px',
                            lineHeight: '1.5',
                            color: '#e2e2e2',
                            overflowX: 'auto',
                            maxHeight: '320px',
                          }}
                        >
                          <code>{file.code}</code>
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#8a8a8a', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
                      No new files generated. Review the strategy and patch tabs for recommendations.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STRATEGY & DIAGNOSIS */}
              {activeTab === 'strategy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: '#161616',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: '#b07a8a',
                        marginTop: 0,
                        marginBottom: '8px',
                        fontWeight: '700',
                      }}
                    >
                      Root Cause Diagnosis
                    </h3>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#d4d4d4',
                        lineHeight: '1.6',
                      }}
                    >
                      {plan.diagnosis}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#161616',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: '#7dd3fc',
                        marginTop: 0,
                        marginBottom: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Step-by-Step Decoupling Strategy
                    </h3>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#d4d4d4',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {plan.strategy}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: UNIFIED GIT DIFF */}
              {activeTab === 'patch' && (
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#a0a0a0',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Apply directly with git:</span>
                    <code
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        background: '#1a1a1a',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: '#0cce6b',
                      }}
                    >
                      git apply reactviz-fix.patch
                    </code>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '16px',
                      background: '#080808',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: '#ededed',
                      overflowX: 'auto',
                      maxHeight: '440px',
                    }}
                  >
                    {plan.patch
                      ? plan.patch.split('\n').map((line, lIdx) => {
                          const isAdd = line.startsWith('+') && !line.startsWith('+++')
                          const isDel = line.startsWith('-') && !line.startsWith('---')
                          const isHdr = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')
                          return (
                            <div
                              key={lIdx}
                              style={{
                                color: isAdd ? '#86efac' : isDel ? '#f87171' : isHdr ? '#93c5fd' : '#a0a0a0',
                                backgroundColor: isAdd ? '#0cce6b11' : isDel ? '#ff5c5c11' : 'transparent',
                              }}
                            >
                              {line}
                            </div>
                          )
                        })
                      : 'No patch diff available.'}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.10)',
            background: '#141414',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#8a8a8a',
          }}
        >
          <span>
            {plan?.isOffline
              ? '⚡ Instant rule-based solution ready to download or copy.'
              : '🤖 Powered by OpenRouter AI architectural analysis.'}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: '#222222',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '6px',
              color: '#f5f5f5',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
