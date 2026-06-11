import React, { useState } from 'react'
import { useSearch } from '../hooks/useSearch'

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const { loading, search } = useSearch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (query.trim()) {
      await search(query)
      onSearch?.(query)
    }
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="search-input"
      />
      <button 
        type="submit" 
        className="search-button"
        disabled={loading}
      >
        {loading ? '...' : 'Search'}
      </button>
    </form>
  )
}
