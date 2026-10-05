import { clamp01 } from './math'

export const getScrollRange = () => {
  if (typeof document === 'undefined') return 0
  const doc = document.documentElement
  return Math.max(0, doc.scrollHeight - doc.clientHeight)
}

export function buildMobileRegions(container) {
  if (!container || typeof window === 'undefined') return []
  const regions = []
  let top = container.getBoundingClientRect().top + window.scrollY
  for (const el of Array.from(container.children)) {
    if (!el.classList.contains('tl-spacer') && !el.classList.contains('portal-panel')) continue
    const from = parseFloat(el.dataset.pFrom ?? '0')
    const to = parseFloat(el.dataset.pTo ?? String(from))
    regions.push({ top, height: el.offsetHeight, from, to })
    top += el.offsetHeight
  }
  return regions
}

export function progressFromRegions(scrollY, regions) {
  if (!regions.length) return 0
  if (scrollY <= regions[0].top) return regions[0].from
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]
    if (scrollY < r.top + r.height) {
      const f = r.height > 0 ? (scrollY - r.top) / r.height : 0
      return r.from + (r.to - r.from) * clamp01(f)
    }
  }
  return regions[regions.length - 1].to
}

export function scrollYFromRegions(target, regions) {
  if (!regions.length) return 0
  if (target <= regions[0].from) return regions[0].top
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]
    const lo = Math.min(r.from, r.to)
    const hi = Math.max(r.from, r.to)
    if (target >= lo && target <= hi) {
      if (r.to === r.from) return r.top
      const f = (target - r.from) / (r.to - r.from)
      return r.top + r.height * clamp01(f)
    }
  }
  const last = regions[regions.length - 1]
  return last.top + last.height
}
