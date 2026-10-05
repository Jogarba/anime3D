import { useState, useEffect, useRef } from 'react'
import { isMobileViewport } from '../constants/breakpoints'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const isMobileRef = useRef(isMobileViewport())

  useEffect(() => {
    const onResize = () => {
      const mobile = isMobileViewport()
      isMobileRef.current = mobile
      setIsMobile(mobile)
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return { isMobile, isMobileRef }
}
