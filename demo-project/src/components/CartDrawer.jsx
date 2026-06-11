import React from 'react'
import { useCart } from '../context/CartContext'
import './CartDrawer.css'

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    close, 
    updateQuantity, 
    removeItem, 
    totalPrice 
  } = useCart()

  if (!isOpen) return null

  return (
    <>
      <div className="cart-overlay" onClick={close} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={close} className="close-btn">×</button>
        </div>
        
        <div className="cart-items">
          {items.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
