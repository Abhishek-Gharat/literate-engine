import React from 'react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { SearchBar } from '../components/SearchBar'
import './Home.css'

export function Home() {
  const { products, loading, error } = useProducts()

  const handleSearch = (query) => {
    console.log('Searching for:', query)
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error">Failed to load products: {error}</div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to ShopApp</h1>
        <p>Discover amazing products at great prices</p>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="products-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
