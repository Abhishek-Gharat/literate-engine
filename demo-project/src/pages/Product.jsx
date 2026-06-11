import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import './Product.css'

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct } = useProducts()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadProduct = async () => {
      const data = await getProduct(id)
      if (data) {
        setProduct(data)
      } else {
        navigate('/')
      }
      setLoading(false)
    }
    loadProduct()
  }, [id, getProduct, navigate])

  const handleAddToCart = () => {
    if (product) {
      addItem({ ...product, quantity })
    }
  }

  if (loading) {
    return (
      <div className="product-page">
        <div className="loading">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="error">Product not found</div>
      </div>
    )
  }

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-image-large">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>
          
          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>
                +
              </button>
            </div>
          </div>
          
          <button 
            className="add-to-cart-large"
            onClick={handleAddToCart}
          >
            Add {quantity} to Cart - ${(product.price * quantity).toFixed(2)}
          </button>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>
              This is a high-quality {product.name.toLowerCase()} from our 
              {product.category} collection. Perfect for everyday use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
