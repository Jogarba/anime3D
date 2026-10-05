export const MOBILE_MAX_WIDTH = 900

export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH
