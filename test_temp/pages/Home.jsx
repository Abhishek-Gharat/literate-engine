import React from 'react'
import { StatsCard } from '../components/StatsCard'
import { ActivityList } from '../components/ActivityList'

export function Home() {
  return (
    <div className="home-page">
      <h1>Welcome Home</h1>
      <div className="stats-grid">
        <StatsCard title="Total Users" value="1,234" />
        <StatsCard title="Revenue" value="$12,345" />
      </div>
      <ActivityList />
    </div>
  )
}
