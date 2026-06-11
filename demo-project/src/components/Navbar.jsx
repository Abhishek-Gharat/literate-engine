import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export function Navbar() {
  const { totalItems, toggleCart } = useCart()
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ShopApp</Link>
      </div>
      
      <div className="navbar-search">
        <input type="text" placeholder="Search products..." />
      </div>
      
      <div className="navbar-actions">
        <button className="cart-button" onClick={toggleCart}>
          Cart ({totalItems})
        </button>
        
        {isAuthenticated ? (
          <div className="user-menu">
            <span>Hello, {user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
      </div>
    </nav>
  )
}
