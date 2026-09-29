import { useEffect, useRef } from 'react'

export default function KineticGrid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let ripples = []
    let meteors = []
    let clickSparks = []

    const spacing = 42

    // 1. Floating cyber dust / square & diamond particles (matching reference image)
    const squareParticleCount = 65
    const squareParticles = Array.from({ length: squareParticleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 1.6,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28 - 0.12,
      alpha: Math.random() * 0.45 + 0.35,
      baseAlpha: Math.random() * 0.45 + 0.35,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.018,
      isDiamond: Math.random() > 0.4,
    }))

    // 2. Floating glowing starlight orbs across all sections
    const orbCount = 70
    const starlightOrbs = Array.from({ length: orbCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 1.0,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35 - 0.08,
      alpha: Math.random() * 0.5 + 0.35,
      baseAlpha: Math.random() * 0.5 + 0.35,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.6 ? '56, 189, 248' : Math.random() > 0.3 ? '96, 165, 250' : '224, 242, 254',
    }))

    // Function to spawn a shooting star / meteor
    const spawnMeteor = () => {
      const startX = Math.random() * (width * 0.7) + width * 0.15
      const startY = Math.random() * (height * 0.35)
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25
      const speed = Math.random() * 6 + 8
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 75 + 60,
        thickness: Math.random() * 1.3 + 1.1,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.014,
      })
    }

    let meteorTimer = 0

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const onClick = (e) => {
      const clickX = e.clientX
      const clickY = e.clientY
      const maxR = Math.max(width, height) * 0.85

      // Cosmic shockwave ripple
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: maxR,
        alpha: 0.95,
        speed: 4.5,
        lineWidth: 2.8,
        color: '56, 189, 248',
      })
      ripples.push({
        x: clickX,
        y: clickY,
        radius: -30,
        maxRadius: maxR,
        alpha: 0.75,
        speed: 4.0,
        lineWidth: 2.0,
        color: '96, 165, 250',
      })

      // Starlight sparks
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 4.2 + 1.5
        clickSparks.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.2 + 1.2,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          color: Math.random() > 0.4 ? '186, 230, 253' : '255, 255, 255',
        })
      }

      if (Math.random() > 0.35) {
        spawnMeteor()
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('click', onClick)

    let tick = 0
    let animId

    const draw = () => {
      tick++
      ctx.clearRect(0, 0, width, height)

      // 1. Draw Floating Square / Diamond Cyber Particles (Matching User Reference Image)
      for (let s = 0; s < squareParticles.length; s++) {
        const sq = squareParticles[s]
        sq.x += sq.vx
        sq.y += sq.vy
        sq.rotation += sq.rotSpeed

        if (sq.x < 0) sq.x = width
        if (sq.x > width) sq.x = 0
        if (sq.y < 0) sq.y = height
        if (sq.y > height) sq.y = 0

        const twinkle = Math.sin(tick * sq.twinkleSpeed + sq.phase)
        const alpha = Math.max(0.12, sq.baseAlpha + twinkle * 0.22)

        ctx.save()
        ctx.translate(sq.x, sq.y)
        ctx.rotate(sq.rotation)
        ctx.fillStyle = `rgba(203, 213, 225, ${alpha})` // Light silver-cyan square
        ctx.shadowColor = '#93c5fd'
        ctx.shadowBlur = 4 * alpha

        if (sq.isDiamond) {
          ctx.beginPath()
          ctx.moveTo(0, -sq.size)
          ctx.lineTo(sq.size, 0)
          ctx.lineTo(0, sq.size)
          ctx.lineTo(-sq.size, 0)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(-sq.size / 2, -sq.size / 2, sq.size, sq.size)
        }
        ctx.restore()
      }

      // 2. Draw Floating Glowing Starlight Particles across all sections
      for (let o = 0; o < starlightOrbs.length; o++) {
        const orb = starlightOrbs[o]
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < 0) orb.x = width
        if (orb.x > width) orb.x = 0
        if (orb.y < 0) orb.y = height
        if (orb.y > height) orb.y = 0

        const pulse = Math.sin(tick * orb.pulseSpeed + orb.phase)
        const alpha = Math.max(0.15, orb.baseAlpha + pulse * 0.25)

        ctx.save()
        ctx.fillStyle = `rgba(${orb.color}, ${alpha})`
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 6 * alpha
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Subtle constellation thread to other nearby orbs
        for (let j = o + 1; j < Math.min(o + 6, starlightOrbs.length); j++) {
          const other = starlightOrbs[j]
          const dist = Math.hypot(orb.x - other.x, orb.y - other.y)
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.18 * Math.min(alpha, other.baseAlpha)
            ctx.strokeStyle = `rgba(125, 211, 252, ${lineAlpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(orb.x, orb.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        }
      }

      // 3. Regular Dot Matrix Grid — Calm, Subtle, Uniform & Static Background
      const cols = Math.floor(width / spacing) + 1
      const rows = Math.floor(height / spacing) + 1

      const startX = (width - cols * spacing) / 2
      const startY = (height - rows * spacing) / 2

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = startX + i * spacing
          const y = startY + j * spacing

          let alpha = 0.16
          let offsetX = 0
          let offsetY = 0

          // Undulating ripple wave interaction on click only
          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k]
            if (rip.radius <= 0) continue
            const ripDist = Math.sqrt((rip.x - x) ** 2 + (rip.y - y) ** 2)
            const rDiff = ripDist - rip.radius
            if (Math.abs(rDiff) < 50) {
              const rFactor = (1 - Math.abs(rDiff) / 50) * rip.alpha
              const waveHeight = Math.sin(rDiff * 0.09) * rFactor
              alpha = Math.max(alpha, 0.2 + rFactor * 0.3)
              const angle = Math.atan2(y - rip.y, x - rip.x)
              offsetX += Math.cos(angle) * waveHeight * 4
              offsetY += Math.sin(angle) * waveHeight * 4
            }
          }

          const px = x + offsetX
          const py = y + offsetY

          ctx.fillStyle = `rgba(75, 142, 255, ${alpha})`
          ctx.beginPath()
          ctx.arc(px, py, 1.0, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 4. Shooting Stars / Meteors
      meteorTimer++
      if (meteorTimer % 280 === 0 && Math.random() > 0.3) {
        spawnMeteor()
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx
        m.y += m.vy
        m.alpha -= m.decay

        if (m.alpha <= 0.01) {
          meteors.splice(i, 1)
          continue
        }

        const tailX = m.x - (m.vx / (Math.abs(m.vx) + Math.abs(m.vy))) * m.length
        const tailY = m.y - (m.vy / (Math.abs(m.vx) + Math.abs(m.vy))) * m.length

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)')
        grad.addColorStop(0.7, `rgba(147, 197, 253, ${m.alpha * 0.6})`)
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`)

        ctx.save()
        ctx.strokeStyle = grad
        ctx.lineWidth = m.thickness
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(m.x, m.y)
        ctx.stroke()

        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.thickness * 1.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 5. Update and draw Shockwaves
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += r.speed
        r.alpha *= 0.985

        if (r.radius > 0 && r.alpha > 0.01) {
          ctx.save()
          ctx.strokeStyle = `rgba(${r.color}, ${r.alpha * 0.8})`
          ctx.lineWidth = r.lineWidth
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 12 * r.alpha
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        if (r.alpha < 0.008 || r.radius > r.maxRadius) {
          ripples.splice(i, 1)
        }
      }

      // 6. Update and draw Supernova Sparks
      for (let i = clickSparks.length - 1; i >= 0; i--) {
        const p = clickSparks[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.97
        p.vy *= 0.97
        p.alpha -= p.decay

        if (p.alpha > 0.01) {
          ctx.save()
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 6 * p.alpha
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        } else {
          clickSparks.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="kinetic-grid-canvas"
      aria-hidden="true"
    />
  )
}

