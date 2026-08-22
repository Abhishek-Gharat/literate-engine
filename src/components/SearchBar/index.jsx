import { useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import useStore from '../../store'
import { TYPOGRAPHY, COLORS, BORDER_RADIUS } from '../../styles/constants'

export default function SearchBar() {
  const search = useStore((s) => s.search)
  const setSearch = useStore((s) => s.setSearch)
  const nodes = useStore((s) => s.nodes)
  const setSearchResults = useStore((s) => s.setSearchResults)

  const fuse = useMemo(() => {
    if (!nodes.length) return null
    return new Fuse(nodes, {
      keys: ['data.label', 'data.nodeType'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    })
  }, [nodes])

  const handleChange = useCallback(
    (e) => {
      const query = e.target.value
      setSearch(query)
      if (!query.trim() || !fuse) {
        setSearchResults([])
        return
      }
      const results = fuse
        .search(query)
        .slice(0, 20)
        .map((r) => ({ nodeId: r.item.id, score: r.score ?? 1 }))
      setSearchResults(results)
    },
    [fuse, setSearch, setSearchResults]
  )

  const handleClear = useCallback(() => {
    setSearch('')
    setSearchResults([])
  }, [setSearch, setSearchResults])

  return (
    <div style={{ position: 'relative' }}>
      {/* Search icon */}
      <span style={{
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: search ? COLORS.text.secondary : COLORS.text.dark,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        transition: 'color 0.15s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search nodes…"
        value={search}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: `8px ${search ? '30px' : '12px'} 8px 30px`,
          background: COLORS.bg.card,
          border: `1px solid ${search ? COLORS.border.light : COLORS.border.DEFAULT}`,
          borderRadius: BORDER_RADIUS.lg,
          color: COLORS.text.primary,
          fontFamily: TYPOGRAPHY.fontFamily.sans,
          fontSize: TYPOGRAPHY.size.sm,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.currentTarget.style.borderColor = COLORS.primary.border}
        onBlur={e => e.currentTarget.style.borderColor = search ? COLORS.border.light : COLORS.border.DEFAULT}
      />
      {/* Clear button */}
      {search && (
        <button
          onClick={handleClear}
          title="Clear search"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: COLORS.text.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '3px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = COLORS.text.secondary}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.text.muted}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}
