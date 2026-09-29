import { useState } from 'react'
import { animate } from 'animejs'

export default function LoginForm({ opacity, isVisible }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authSuccess, setAuthSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setAuthSuccess(true)
      setTimeout(() => setAuthSuccess(false), 2600)
    }, 900)
  }

  if (!isVisible && opacity <= 0.01) {
    return null
  }

  return (
    <div
      className="login-overlay-minimal"
      style={{
        opacity: opacity,
        transform: `translate(-50%, -50%) scale(${0.92 + opacity * 0.08})`,
        pointerEvents: opacity > 0.35 ? 'auto' : 'none',
      }}
      aria-hidden={opacity < 0.2}
    >
      <form className="login-minimal-form" onSubmit={handleSubmit}>
        <div className="login-minimal-header">
          <span className="login-minimal-eyebrow">EVOLUT</span>
          <h2 className="login-minimal-title">Sign In</h2>
        </div>

        <div className="login-minimal-inputs">
          {/* User / Email input */}
          <div className="login-minimal-field">
            <svg className="login-minimal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              className="login-minimal-input"
              placeholder="Username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {/* Password input */}
          <div className="login-minimal-field">
            <svg className="login-minimal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-minimal-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-minimal-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`login-minimal-btn${loading ? ' login-minimal-btn--loading' : ''}${authSuccess ? ' login-minimal-btn--success' : ''}`}
          disabled={loading}
          onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.03, duration: 180, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 200, ease: 'outQuad' })}
        >
          {loading ? 'Authenticating...' : authSuccess ? '✓ Access Granted' : 'Sign In →'}
        </button>
      </form>
    </div>
  )
}
