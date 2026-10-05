import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * AnimateCopyButton - Morphing spring animated copy button from Animate UI registry pattern.
 */
export function AnimateCopyButton({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  showLabel = true,
  onCopy,
  style = {},
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy)
      }
      setCopied(true)
      onCopy?.(textToCopy)
      setTimeout(() => setCopied(false), 2200)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: copied
          ? 'rgba(16, 185, 129, 0.16)'
          : 'rgba(255, 255, 255, 0.05)',
        border: copied
          ? '1px solid rgba(16, 185, 129, 0.45)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '7px',
        color: copied ? '#34d399' : '#cbd5e1',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
        outline: 'none',
        ...style,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            📋
          </motion.span>
        )}
      </AnimatePresence>
      {showLabel && (
        <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
          {copied ? copiedLabel : label}
        </span>
      )}
    </motion.button>
  )
}
