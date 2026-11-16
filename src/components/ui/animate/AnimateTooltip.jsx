import React, { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'

/**
 * AnimateTooltip - Spring-animated floating tooltip component based on Animate UI pattern.
 */
export function AnimateTooltip({
  content,
  children,
  position = 'top',
  delay = 100,
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState(null)

  const handleMouseEnter = () => {
    const t = setTimeout(() => setIsVisible(true), delay)
    setTimer(t)
  }

  const handleMouseLeave = () => {
    clearTimeout(timer)
    setIsVisible(false)
  }

  const positionStyles = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 2 : position === 'bottom' ? -2 : 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            style={{
              position: 'absolute',
              zIndex: 9999,
              pointerEvents: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: '500',
              lineHeight: '1.3',
              whiteSpace: 'nowrap',
              ...positionStyles[position],
              ...style,
            }}
          >
            {content}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
