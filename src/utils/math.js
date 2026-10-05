export const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const easeInOut = (value) => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

export const wrapDiff = (target, current) => {
  const diff = (target - current) % (Math.PI * 2)
  return current + (((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
}
