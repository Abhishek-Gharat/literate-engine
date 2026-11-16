import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { searchArchitectureNodes } from '../../utils/architectureFilters.js'
import { computeHealthScore, getHealthColor } from '../../utils/healthScore.js'

export function ArchitectureToolbar({
  nodes = [],
  cyclicEdges = [],
  stats = {},
  searchTerm = '',
  onSearchChange,
  onSelectNode,
  typeFilter = 'all',
  onTypeFilterChange,
  riskFilter = 'all',
  onRiskFilterChange,
  issueFilter = 'all',
  onIssueFilterChange,
  onClearFilters,
  totalFilteredCount = 0,
  issuesPanelOpen = false,
  onToggleIssuesPanel,
  onOpenReview,
  onExport,
  issuesCount = { critical: 0, high: 0, total: 0 },
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchContainerRef = useRef(null)

  // Search Results
  const searchResults = useMemo(() => {
    return searchArchitectureNodes(nodes, searchTerm)
  }, [nodes, searchTerm])

  // Reset highlight index when query changes (adjust state during render
  // instead of in an effect, to avoid a cascading extra render pass)
  const [lastSearchTerm, setLastSearchTerm] = useState(searchTerm)
  if (lastSearchTerm !== searchTerm) {
    setLastSearchTerm(searchTerm)
    setHighlightedIndex(-1)
  }

  // Architecture Health Breakdown
  const healthData = useMemo(() => {
    return computeHealthScore({
      nodes,
      cyclicEdges,
      unresolvedImports: stats?.unresolvedImports || 0,
      deadExportCount: stats?.deadExports || 0,
    })
  }, [nodes, cyclicEdges, stats])

  // Count active filters
  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) +
    (riskFilter !== 'all' ? 1 : 0) +
    (issueFilter !== 'all' ? 1 : 0)

  // Keyboard navigation for search dropdown
  const handleSearchKeyDown = (e) => {
    if (!isSearchFocused || searchResults.total === 0) return
    const total = searchResults.flat.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1 < total ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < total) {
        const item = searchResults.flat[highlightedIndex]
        if (item) {
          onSelectNode(item.raw)
          setIsSearchFocused(false)
        }
      } else if (total > 0) {
        onSelectNode(searchResults.flat[0].raw)
        setIsSearchFocused(false)
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false)
    }
  }

  // Close search popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{
      background: 'rgba(10, 14, 24, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '8px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 15,
      position: 'relative'
    }}>
      {/* Top Row: Search + Filter Triggers + Health Score + Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Left Section: Search Control */}
        <div ref={searchContainerRef} style={{ position: 'relative', width: '280px', minWidth: '200px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{
              position: 'absolute',
              left: '10px',
              fontSize: '13px',
              color: '#64748b',
              pointerEvents: 'none'
            }}>⌕</span>
            <input
              type="text"
              placeholder="Search components, hooks, utils..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              style={{
                width: '100%',
                padding: '6px 28px 6px 30px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSearchFocused ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Grouped Search Dropdown */}
          {isSearchFocused && searchTerm.trim() !== '' && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '340px',
              maxHeight: '380px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '10px',
              zIndex: 50,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                paddingBottom: '6px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: '600'
                }}>
                  <span>Matches ({searchResults.total})</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>↑↓ to navigate · ↵ to select</span>
                </div>
                {/* Compact category breakdown */}
                {searchResults.total > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '9.5px', color: '#64748b' }}>
                    {Object.entries(searchResults.grouped).map(([cat, items]) => {
                      if (!items || items.length === 0) return null
                      return (
                        <span key={cat} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1px 5px', borderRadius: '3px' }}>
                          {cat}: {items.length}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {searchResults.total === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  No architectural matches found for "{searchTerm}"
                </div>
              ) : (
                searchResults.flat.slice(0, 20).map((item, idx) => {
                  const isHighlighted = idx === highlightedIndex
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectNode(item.raw)
                        setIsSearchFocused(false)
                      }}
                      style={{
                        padding: '6px 8px',
                        background: isHighlighted ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isHighlighted ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.06)'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#f8fafc',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.label}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#94a3b8'
                        }}>
                          {item.category}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.id}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Center: Quick Architecture Filters Dropdown / Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={e => onTypeFilterChange(e.target.value)}
            style={{
              padding: '4px 8px',
              background: typeFilter !== 'all' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${typeFilter !== 'all' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: typeFilter !== 'all' ? '#c7d2fe' : '#cbd5e1',
              fontSize: '11px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Type: All</option>
            <option value="pages">Pages</option>
            <option value="components">Components</option>
            <option value="hooks">Hooks</option>
            <option value="contexts">Contexts</option>
            <option value="services">Services</option>
            <option value="utils">Utils</option>
          </select>

          {/* Risk Select */}
          <select
            value={riskFilter}
            onChange={e => onRiskFilterChange(e.target.value)}
            style={{
              padding: '4px 8px',
              background: riskFilter !== 'all' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${riskFilter !== 'all' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: riskFilter !== 'all' ? '#fde68a' : '#cbd5e1',
              fontSize: '11px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Risk: All</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          {/* Issues Select */}
          <select
            value={issueFilter}
            onChange={e => onIssueFilterChange(e.target.value)}
            style={{
              padding: '4px 8px',
              background: issueFilter !== 'all' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${issueFilter !== 'all' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: issueFilter !== 'all' ? '#fca5a5' : '#cbd5e1',
              fontSize: '11px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Issues: All</option>
            <option value="cycles">Circular Dependencies</option>
            <option value="unresolved">Unresolved Imports</option>
            <option value="high_impact">High Impact / Central</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              style={{
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '10.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Clear all</span>
              <span>×</span>
            </button>
          )}
        </div>

        {/* Right Section: Health Pill + Issues + AI Review + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Architecture Health Pill */}
          {healthData && healthData.score !== null && (
            <button
              onClick={() => setShowHealthModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${getHealthColor(healthData.score)}55`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Click to view explainable Architecture Health breakdown"
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getHealthColor(healthData.score),
                boxShadow: `0 0 8px ${getHealthColor(healthData.score)}`
              }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#f8fafc' }}>
                Health: {healthData.score}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: getHealthColor(healthData.score),
                background: `${getHealthColor(healthData.score)}22`,
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                {healthData.grade}
              </span>
            </button>
          )}

          {/* Smart Issues Toggle */}
          <button
            onClick={onToggleIssuesPanel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: issuesPanelOpen ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${issuesPanelOpen ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: issuesPanelOpen ? '#fde047' : '#cbd5e1',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <span>⚠️ Issues</span>
            {issuesCount.total > 0 && (
              <span style={{
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: '700',
                background: issuesCount.critical > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                color: issuesCount.critical > 0 ? '#fca5a5' : '#fde68a',
                border: `1px solid ${issuesCount.critical > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`
              }}>
                {issuesCount.total}
              </span>
            )}
          </button>

          {/* AI Review */}
          <button
            onClick={onOpenReview}
            data-testid="ai-review-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.35)'
            }}
          >
            <span>✦</span> AI Review
          </button>

          {/* Export Segmented Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px'
          }}>
            <span style={{ color: '#64748b', fontSize: '10px', padding: '0 6px', fontWeight: '700', textTransform: 'uppercase' }}>
              Export
            </span>
            {['PNG', 'SVG', 'JSON'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onExport?.(fmt)}
                style={{
                  padding: '2px 8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Status Sub-bar when filters or search are active */}
      {(activeFilterCount > 0 || searchTerm) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#94a3b8',
          paddingTop: '4px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
            Filters ({activeFilterCount}):
          </span>
          <span>Showing <strong>{totalFilteredCount}</strong> / {nodes.length} nodes</span>

          {typeFilter !== 'all' && (
            <button
              onClick={() => onTypeFilterChange('all')}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: '#c7d2fe',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to remove Type filter"
            >
              <span>Type: {typeFilter}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>×</span>
            </button>
          )}

          {riskFilter !== 'all' && (
            <button
              onClick={() => onRiskFilterChange('all')}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: '#fde68a',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to remove Risk filter"
            >
              <span>Risk: {riskFilter}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>×</span>
            </button>
          )}

          {issueFilter !== 'all' && (
            <button
              onClick={() => onIssueFilterChange('all')}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: '#fca5a5',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to remove Issue filter"
            >
              <span>Issue: {issueFilter}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>×</span>
            </button>
          )}

          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to clear search query"
            >
              <span>Query: "{searchTerm}"</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>×</span>
            </button>
          )}

          <button
            onClick={onClearFilters}
            style={{
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: '#94a3b8',
              fontSize: '10.5px',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Architecture Health Explainability Modal ── */}
      {/* Rendered through a portal: the toolbar sits inside a backdrop-filter
          container, which turns it into the containing block for fixed-position
          descendants and would clip the modal behind the header. */}
      {showHealthModal && healthData && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🩺</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Architecture Health
                </h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Overall Score with Explainable Penalties */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: `1px solid ${getHealthColor(healthData.score)}44`
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>
                  Architecture Health Score
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Base: <strong>100</strong> · Penalties: <strong style={{ color: healthData.totalPenalty > 0 ? '#ef4444' : '#10b981' }}>-{healthData.totalPenalty || 0}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: getHealthColor(healthData.score) }}>
                  {healthData.score} <span style={{ fontSize: '16px', color: '#64748b' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: getHealthColor(healthData.score) }}>
                  Grade: {healthData.grade}
                </div>
              </div>
            </div>

            {/* Summary bullets (Why the score exists) */}
            {healthData.summary && healthData.summary.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Why this score exists:
                </div>
                {healthData.summary.map((line, idx) => (
                  <div key={idx} style={{
                    fontSize: '11.5px',
                    color: line.startsWith('✓') ? '#86efac' : '#fde047',
                    fontWeight: 500,
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            )}

            {/* Contributing Signals Breakdown with Penalty Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase' }}>
                Contributing Signals Breakdown
              </div>
              {healthData.breakdown.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>
                      {item.label}: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{item.value}</span>
                      {item.penalty > 0 && (
                        <span style={{ fontSize: '10.5px', color: '#ef4444', fontWeight: 700, marginLeft: '6px' }}>
                          (-{item.penalty} pts)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      {item.explanation || item.detail}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: item.status === 'good' ? 'rgba(16, 185, 129, 0.15)' : item.status === 'warn' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.status === 'good' ? '#10b981' : item.status === 'warn' ? '#f59e0b' : '#ef4444',
                      border: `1px solid ${item.status === 'good' ? 'rgba(16, 185, 129, 0.3)' : item.status === 'warn' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHealthModal(false)}
              style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
