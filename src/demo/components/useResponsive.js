import { useState, useEffect } from 'react'

/**
 * useResponsive - Hook to handle responsive breakpoints
 */
export function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setWidth(w)
      setIsMobile(w < 640)
      setIsTablet(w >= 640 && w < 1024)
      setIsDesktop(w >= 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { width, isMobile, isTablet, isDesktop }
}
