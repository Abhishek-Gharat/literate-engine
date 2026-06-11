import { useState, useCallback } from 'react'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (searchQuery) => {
    setLoading(true)
    setQuery(searchQuery)
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock results based on query
    const mockResults = searchQuery 
      ? [
          { id: '1', name: `Result for "${searchQuery}"`, category: 'Search Result' }
        ]
      : []
    
    setResults(mockResults)
    setLoading(false)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    results,
    loading,
    search,
    clearSearch
  }
}
