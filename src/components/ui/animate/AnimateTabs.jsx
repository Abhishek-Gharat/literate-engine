import React from 'react'
import { motion } from 'motion/react'

/**
 * AnimateTabs - Spring-animated segmented tab control from Animate UI registry pattern.
 * Uses layoutId to smoothly slide the pill background beneath the active tab.
 */
export function AnimateTabs({
  tabs,
  activeTab,
  onChange,
  layoutId = 'animate-tab-pill',
  containerStyle = {},
  tabStyle = {},
  activeStyle = {},
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '3px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        position: 'relative',
        ...containerStyle,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#ffffff' : '#94a3b8',
              background: 'transparent',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              outline: 'none',
              ...tabStyle,
              ...(isActive ? activeStyle : {}),
            }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32,
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '7px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                  zIndex: -1,
                }}
              />
            )}
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#c7d2fe' : '#64748b',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
