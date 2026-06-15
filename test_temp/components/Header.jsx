import React from 'react'

export function Header({ user }) {
  return (
    <header className="header">
      <div className="logo">ReactViz Test</div>
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>
      </nav>
      <div className="user-info">
        {user ? <span>Hello, {user.name}</span> : <span>Guest</span>}
      </div>
    </header>
  )
}
