import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function ProductCard({ product }) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
      </Link>
      <div className="product-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
