import { useEffect, useRef, useState } from 'react'

// Fragment shader for Real-time Audio-Reactive Liquid Glass Orb based on LerSent001/orb physics
const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_opacity;
uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;
uniform float u_audioVol;

#define PI 3.14159265359

// Fast Simplex-style 3D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Multi-octave fluid turbulence
float fbm(vec3 p) {
  float f = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    f += amp * snoise(p);
    p = p * 2.02 + vec3(0.12, 0.28, 0.34);
    amp *= 0.5;
  }
  return f;
}

// Siri & Neural Plasma spectral palette
vec3 palette(float t) {
  vec3 c0 = vec3(0.02, 0.72, 0.98); // Electric Cyan
  vec3 c1 = vec3(0.38, 0.26, 0.96); // Royal Violet
  vec3 c2 = vec3(0.92, 0.18, 0.65); // Magenta Neon
  vec3 c3 = vec3(0.12, 0.88, 0.75); // Aqua Marine
  vec3 c4 = vec3(0.98, 0.64, 0.14); // Amber Core

  float x = fract(t);
  if (x < 0.25) return mix(c0, c1, x / 0.25);
  if (x < 0.50) return mix(c1, c2, (x - 0.25) / 0.25);
  if (x < 0.75) return mix(c2, c3, (x - 0.50) / 0.25);
  return mix(c3, c4, (x - 0.75) / 0.25);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float dist = length(uv);
  
  // Audio-reactive dynamic radius expansion on bass & voice energy
  float radius = 0.36 + u_audioLow * 0.035;

  // Outer ambient aura glow modulated by high frequencies & voice energy
  float glowDecay = 12.0 - u_audioHigh * 4.5;
  float glowIntensity = 0.45 + u_audioVol * 0.85;
  float outerGlow = exp(-max(dist - radius, 0.0) * glowDecay) * glowIntensity;
  vec3 glowColor = mix(
    vec3(0.02, 0.65, 0.95),
    vec3(0.85, 0.18, 0.92),
    sin(u_time * 0.8 + u_audioMid * 3.0) * 0.5 + 0.5
  );

  if (dist > radius + 0.09) {
    float bgAlpha = outerGlow * u_opacity;
    if (bgAlpha < 0.005) discard;
    gl_FragColor = vec4(glowColor * outerGlow, bgAlpha);
    return;
  }

  // 3D Glass Sphere Ray Intersection
  float z = sqrt(max(0.0, radius * radius - dist * dist));
  vec3 N = normalize(vec3(uv, z));
  vec3 V = vec3(0.0, 0.0, 1.0);

  // Fresnel effect (edge glass reflection)
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);

  // Liquid internal refraction warp
  vec3 refr = refract(-V, N, 0.72);
  
  // Fluid turbulence coordinates accelerated by voice volume and mids
  vec3 flowPos = vec3(
    uv * (2.4 + u_audioLow * 0.8) + u_mouse * 0.35,
    u_time * (0.32 + u_audioMid * 0.6) + u_audioVol * 1.5
  );

  // Chromatic dispersion expands with audio intensity
  float disp = 0.04 + u_audioVol * 0.06;
  float flowR = fbm(flowPos + refr * 0.4);
  float flowG = fbm(flowPos + refr * (0.4 + disp) + vec3(0.04, 0.02, 0.0));
  float flowB = fbm(flowPos + refr * (0.4 + disp * 2.0) + vec3(0.08, 0.04, 0.0));

  // Swirling ribbon currents
  float angle = atan(uv.y, uv.x);
  float swirl = sin(angle * (3.0 + u_audioMid * 2.0) + u_time * (1.2 + u_audioLow * 1.8) + flowR * 4.0);
  float wave = sin(dist * 18.0 - u_time * 2.0 + swirl * 2.0) * 0.5 + 0.5;

  // Composite multi-channel fluid colors
  float timeShift = u_time * 0.08 + u_audioMid * 0.15;
  vec3 colR = palette(flowR * 0.8 + wave * 0.2 + timeShift);
  vec3 colG = palette(flowG * 0.8 + wave * 0.2 + timeShift + disp);
  vec3 colB = palette(flowB * 0.8 + wave * 0.2 + timeShift + disp * 2.0);
  vec3 liquidColor = vec3(colR.r, colG.g, colB.b);

  // Liquid inner highlights & core energy pulsating with audio bass
  float coreEnergy = smoothstep(radius * 0.9, 0.0, dist) * (0.35 + 0.65 * wave);
  liquidColor += vec3(0.85, 0.95, 1.0) * pow(coreEnergy, 2.3) * (0.65 + u_audioLow * 1.8);

  // Glass Specular highlights
  vec3 lightDir1 = normalize(vec3(-0.5, 0.7, 0.8));
  vec3 lightDir2 = normalize(vec3(0.6, -0.4, 0.7));
  vec3 H1 = normalize(lightDir1 + V);
  vec3 H2 = normalize(lightDir2 + V);
  float spec1 = pow(max(dot(N, H1), 0.0), 42.0);
  float spec2 = pow(max(dot(N, H2), 0.0), 24.0) * 0.5;
  vec3 specular = vec3(1.0, 1.0, 1.0) * (spec1 + spec2) * (0.85 + u_audioHigh * 0.6);

  // Rim glass tint
  vec3 rimColor = mix(vec3(0.2, 0.8, 1.0), vec3(0.95, 0.25, 0.85), fresnel);
  vec3 finalColor = mix(liquidColor, rimColor, fresnel * 0.65) + specular;

  // Edge feather smoothing
  float edgeAlpha = smoothstep(radius, radius - 0.008, dist);
  finalColor += glowColor * outerGlow;

  float alpha = max(edgeAlpha, outerGlow) * u_opacity;
  gl_FragColor = vec4(finalColor, alpha);
}
`

const vertexShaderSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// Futuristic glass chime synthesizer using Web Audio API
function playActivationChime(audioCtx, type = 'on') {
  if (!audioCtx) return

  const now = audioCtx.currentTime
  const masterGain = audioCtx.createGain()
  masterGain.connect(audioCtx.destination)

  if (type === 'on') {
    // Rising futuristic dual-tone chime (D5 -> A5 -> D6 harmonic bell)
    const tones = [
      { freq: 587.33, start: 0.0, dur: 0.28, gain: 0.18 },
      { freq: 880.0, start: 0.08, dur: 0.42, gain: 0.22 },
      { freq: 1174.66, start: 0.16, dur: 0.55, gain: 0.14 },
    ]

    tones.forEach(({ freq, start, dur, gain }) => {
      const osc = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      g.gain.setValueAtTime(0.001, now + start)
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)

      osc.connect(g)
      g.connect(masterGain)

      osc.start(now + start)
      osc.stop(now + start + dur + 0.05)
    })
  } else {
    // Descending off tone
    const osc = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(784.0, now)
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.22)

    g.gain.setValueAtTime(0.15, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(g)
    g.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.26)
  }
}

export default function LiquidGlassOrb({ opacity, isVisible }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Audio analysis references
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSimTimerRef = useRef(null)
  const audioDataRef = useRef({ low: 0, mid: 0, high: 0, vol: 0 })

  // Voice Assistant TTS Response
  const isListeningRef = useRef(false)
  const hasSpokenRef = useRef(false)
  const micReadyAtRef = useRef(0)

  // Preload voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const speakAssistantResponse = (text = 'Hola, soy Evolut, tu asistente tecnológico.') => {
    if (typeof window === 'undefined') return

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'es-ES'
        utterance.rate = 0.98
        utterance.pitch = 1.04

        const voices = window.speechSynthesis.getVoices()
        const esVoice =
          voices.find((v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Sabina') || v.name.includes('Jorge') || v.name.includes('Helena') || v.name.includes('Alva') || v.name.includes('Paulina') || v.name.includes('Monica'))) ||
          voices.find((v) => v.lang.startsWith('es')) ||
          voices[0]

        if (esVoice) utterance.voice = esVoice

        utterance.onstart = () => {
          setIsSpeaking(true)
          let step = 0
          clearInterval(speechSimTimerRef.current)
          speechSimTimerRef.current = setInterval(() => {
            step += 0.28
            const s = Math.sin(step * 4.2) * 0.5 + 0.5
            audioDataRef.current = {
              low: 0.55 + s * 0.45,
              mid: 0.65 + Math.cos(step * 4.8) * 0.35,
              high: 0.5 + s * 0.4,
              vol: 0.7 + s * 0.3,
            }
          }, 35)
        }

        utterance.onend = () => {
          setIsSpeaking(false)
          clearInterval(speechSimTimerRef.current)
          audioDataRef.current = { low: 0, mid: 0, high: 0, vol: 0 }
        }

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e)
          setIsSpeaking(false)
          clearInterval(speechSimTimerRef.current)
          audioDataRef.current = { low: 0, mid: 0, high: 0, vol: 0 }
        }

        window.speechSynthesis.speak(utterance)
      }
    } catch (err) {
      console.warn('Speech synthesis failed:', err)
    }
  }

  // Click on Orb: Play chime & speak greeting
  const handleOrbClick = () => {
    // 1. Play activation chime
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContextClass()
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      playActivationChime(audioContextRef.current, 'on')
    }

    // 2. Pulse orb visual energy
    audioDataRef.current = { low: 0.8, mid: 0.7, high: 0.9, vol: 0.85 }

    // 3. Speak greeting directly
    setTimeout(() => {
      speakAssistantResponse('Hola, soy Evolut, tu asistente tecnológico.')
    }, 280)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return

    // Compile vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vertexShaderSource)
    gl.compileShader(vs)

    // Compile fragment shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fragmentShaderSource)
    gl.compileShader(fs)

    // Link shader program
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Quad geometry covering canvas
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    )

    const posAttr = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uOpacity = gl.getUniformLocation(program, 'u_opacity')
    const uAudioLow = gl.getUniformLocation(program, 'u_audioLow')
    const uAudioMid = gl.getUniformLocation(program, 'u_audioMid')
    const uAudioHigh = gl.getUniformLocation(program, 'u_audioHigh')
    const uAudioVol = gl.getUniformLocation(program, 'u_audioVol')

    let animationFrame = 0
    let startTime = performance.now()
    const freqData = new Uint8Array(128)

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const render = (now) => {
      const width = canvas.clientWidth * window.devicePixelRatio
      const height = canvas.clientHeight * window.devicePixelRatio

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }

      // Read audio frequency levels from mic if not in synthesized voice mode
      if (!isSpeaking && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData)

        let sumLow = 0
        for (let i = 1; i <= 10; i++) sumLow += freqData[i]
        const targetLow = Math.min(1.0, (sumLow / 10 / 255) * 1.6)

        let sumMid = 0
        for (let i = 11; i <= 45; i++) sumMid += freqData[i]
        const targetMid = Math.min(1.0, (sumMid / 35 / 255) * 1.8)

        let sumHigh = 0
        for (let i = 46; i <= 110; i++) sumHigh += freqData[i]
        const targetHigh = Math.min(1.0, (sumHigh / 65 / 255) * 2.2)

        const targetVol = targetLow * 0.45 + targetMid * 0.35 + targetHigh * 0.2

        const ad = audioDataRef.current
        ad.low += (targetLow - ad.low) * 0.25
        ad.mid += (targetMid - ad.mid) * 0.25
        ad.high += (targetHigh - ad.high) * 0.25
        ad.vol += (targetVol - ad.vol) * 0.25
      }

      const elapsed = (now - startTime) * 0.001
      const ad = audioDataRef.current

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(uOpacity, opacity)
      gl.uniform1f(uAudioLow, ad.low)
      gl.uniform1f(uAudioMid, ad.mid)
      gl.uniform1f(uAudioHigh, ad.high)
      gl.uniform1f(uAudioVol, ad.vol)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationFrame = requestAnimationFrame(render)
    }

    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearInterval(speechSimTimerRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [opacity, isSpeaking])

  if (!isVisible && opacity <= 0.01) {
    return null
  }

  return (
    <div
      className="liquid-orb-container"
      style={{
        opacity: opacity,
        transform: `translate(-50%, -50%) scale(${0.9 + opacity * 0.1})`,
        pointerEvents: opacity > 0.3 ? 'auto' : 'none',
      }}
      aria-label="Liquid Glass Voice AI Orb"
    >
      <canvas
        ref={canvasRef}
        className="liquid-orb-canvas"
        onClick={handleOrbClick}
        title="Haz clic para interactuar con Evolut"
      />
    </div>
  )
}
