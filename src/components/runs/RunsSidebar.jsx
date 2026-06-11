import React from 'react'

function formatRunDate(value) {
  if (!value) return 'Unknown date'

  try {
    const date = new Date(value)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch {
    return 'Unknown date'
  }
}

function getRunStats(run) {
  const stats = run?.stats || {}
  const snapshot = run?.snapshot || {}

  const totalFiles =
    stats.totalFiles ??
    snapshot.totalFiles ??
    snapshot.stats?.totalFiles ??
    0

  const totalComponents =
    stats.totalComponents ??
    snapshot.totalComponents ??
    snapshot.stats?.totalComponents ??
    0

  return { totalFiles, totalComponents }
}

export default function RunHistoryList({
  runs = [],
  selectedRunId,
  loading,
  error,
  onRetry,
  onSelectRun
}) {
  if (loading) {
    return (
      <div style={{ padding: '14px' }}>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            style={{
              padding: '14px 16px',
              borderBottom: item !== 3 ? '1px solid rgba(30, 41, 59, 0.7)' : 'none',
              background: 'rgba(15, 23, 42, 0.35)'
            }}
          >
            <div
              style={{
                height: '12px',
                width: '42%',
                borderRadius: '6px',
                background: 'rgba(100, 116, 139, 0.22)',
                marginBottom: '10px'
              }}
            />
            <div
              style={{
                height: '10px',
                width: '60%',
                borderRadius: '6px',
                background: 'rgba(100, 116, 139, 0.14)'
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          margin: '14px',
          padding: '18px',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          background: 'rgba(127, 29, 29, 0.14)'
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '6px'
          }}
        >
          Couldn’t load runs
        </div>
        <div
          style={{
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#fca5a5',
            marginBottom: '12px'
          }}
        >
          {error}
        </div>
        <button
          onClick={onRetry}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(248, 113, 113, 0.28)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fecaca',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!runs.length) {
    return (
      <div
        style={{
          margin: '14px',
          padding: '28px 18px',
          borderRadius: '12px',
          border: '1px dashed rgba(71, 85, 105, 0.4)',
          background: 'rgba(15, 23, 42, 0.28)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🕘</div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#e2e8f0',
            marginBottom: '6px'
          }}
        >
          No saved runs yet
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            lineHeight: 1.6,
            maxWidth: '240px',
            margin: '0 auto'
          }}
        >
          Run an analysis to save a reusable architecture snapshot for this project.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {runs.map((run, index) => {
        const isSelected = run.id === selectedRunId
        const { totalFiles, totalComponents } = getRunStats(run)

        return (
          <button
            key={run.id}
            onClick={() => onSelectRun?.(run)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 16px',
              background: isSelected
                ? 'linear-gradient(180deg, rgba(99,102,241,0.16) 0%, rgba(79,70,229,0.08) 100%)'
                : 'rgba(2, 6, 23, 0.16)',
              border: 'none',
              borderBottom:
                index !== runs.length - 1 ? '1px solid rgba(30, 41, 59, 0.7)' : 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isSelected ? '#f5f3ff' : '#e2e8f0',
                    marginBottom: '6px'
                  }}
                >
                  {formatRunDate(run.createdAt)}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(71, 85, 105, 0.35)',
                      color: '#cbd5e1'
                    }}
                  >
                    {totalFiles} files
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(71, 85, 105, 0.35)',
                      color: '#cbd5e1'
                    }}
                  >
                    {totalComponents} comps
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: isSelected ? '#c4b5fd' : '#94a3b8',
                    fontWeight: 600
                  }}
                >
                  {isSelected ? 'Selected' : 'Open run'}
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  marginTop: '2px',
                  fontSize: '16px',
                  color: isSelected ? '#a78bfa' : '#475569'
                }}
              >
                {isSelected ? '✓' : '→'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}