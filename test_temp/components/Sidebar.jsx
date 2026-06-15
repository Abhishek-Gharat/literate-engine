import React from 'react'
import { Dashboard } from '../pages/Dashboard'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <Dashboard />
      </div>
    </aside>
  )
}
