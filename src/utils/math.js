export const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const easeInOut = (value) => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}
