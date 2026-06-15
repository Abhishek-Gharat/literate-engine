import React from 'react'

export function StatsCard({ title, value }) {
  return (
    <div className="stats-card">
      <h3 className="stats-title">{title}</h3>
      <p className="stats-value">{value}</p>
    </div>
  )
}
