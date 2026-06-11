import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCart } from '../context/CartContext'
import './Checkout.css'

export function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const [orderComplete, setOrderComplete] = useState(false)

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h1>Checkout</h1>
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <h1>Order Complete!</h1>
          <p>Thank you for your purchase.</p>
          <p>Order total: ${(totalPrice * 1.1).toFixed(2)}</p>
          <button onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (formData) => {
    console.log('Order submitted:', { items, total: totalPrice, ...formData })
    setOrderComplete(true)
    clearCart()
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        <div className="checkout-form-section">
          <h1>Checkout</h1>
          <CheckoutForm onSubmit={handleSubmit} />
        </div>
        
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {items.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">× {item.quantity}</span>
                </div>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="total-row">
              <span>Tax (10%)</span>
              <span>${(totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>${(totalPrice * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
