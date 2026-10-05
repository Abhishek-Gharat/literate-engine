import React, { useRef, useState } from 'react'

/**
 * AnimateGlowCard - Dynamic cursor-following spotlight card from Animate UI registry pattern.
 */
export function AnimateGlowCard({
  children,
  glowColor = 'rgba(99, 102, 241, 0.25)',
  glowRadius = 400,
  borderColor = 'rgba(255, 255, 255, 0.08)',
  style = {},
  className = '',
  ...props
}) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => setOpacity(1)
  const handleBlur = () => setOpacity(0)
  const handleMouseEnter = () => setOpacity(1)
  const handleMouseLeave = () => setOpacity(0)

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: 'relative',
        borderRadius: '14px',
        border: `1px solid ${borderColor}`,
        background: 'rgba(255, 255, 255, 0.025)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity,
          transition: 'opacity 0.25s ease',
          background: `radial-gradient(${glowRadius}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 65%)`,
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
