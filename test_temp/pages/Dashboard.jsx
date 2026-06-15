import React from 'react'
import { StatsCard } from '../components/StatsCard'
import { ActivityList } from '../components/ActivityList'
import { formatDate } from '../utils/formatDate'

export function Dashboard() {
  const today = formatDate(new Date())

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Today: {today}</p>
      <div className="dashboard-grid">
        <StatsCard title="Views" value="5,678" />
        <StatsCard title="Sales" value="$45,678" />
        <StatsCard title="Orders" value="123" />
        <StatsCard title="Customers" value="890" />
      </div>
      <ActivityList limit={10} />
    </div>
  )
}
