import React from 'react'
import { useAuth } from '../hooks/useAuth'

export function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>Profile</h2>
        <p>Email: {user?.email}</p>
        <p>Name: {user?.name}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
