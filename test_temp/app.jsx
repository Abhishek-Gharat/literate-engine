import React from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Home } from './pages/Home'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="app">
      <Header user={user} />
      <div className="main-layout">
        <Sidebar />
        <main className="content">
          <Home />
        </main>
      </div>
    </div>
  )
}

export default App
