import { useState, useEffect, useCallback } from 'react'

const MOCK_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics', image: '/placeholder.jpg' },
  { id: '2', name: 'Running Shoes', price: 129.99, category: 'Sports', image: '/placeholder.jpg' },
  { id: '3', name: 'Coffee Maker', price: 79.99, category: 'Home', image: '/placeholder.jpg' },
  { id: '4', name: 'Yoga Mat', price: 29.99, category: 'Sports', image: '/placeholder.jpg' },
  { id: '5', name: 'Desk Lamp', price: 49.99, category: 'Home', image: '/placeholder.jpg' },
  { id: '6', name: 'Smart Watch', price: 199.99, category: 'Electronics', image: '/placeholder.jpg' }
]

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async (category = null) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const filtered = category 
        ? MOCK_PRODUCTS.filter(p => p.category === category)
        : MOCK_PRODUCTS
      
      setProducts(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getProduct = useCallback(async (id) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return MOCK_PRODUCTS.find(p => p.id === id) || null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct
  }
}
