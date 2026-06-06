/*
 * Handles user authentication via email and password.
 * Integrates with Firebase Auth. No public registration.
 */
import { useState } from 'react'
import { loginWithEmail } from '../../services/firebase.js'

import './auth.css'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setError('')
    setLoading(true)

    try {
      await loginWithEmail(email.trim(), password)
    } catch (err) {
      console.error('Login error:', err)
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Wrong email or password. Try again.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again in a few minutes.')
          break
        case 'auth/invalid-email':
          setError('That doesn\'t look like a valid email address.')
          break
        default:
          setError('Login failed. Check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-space">
        <div className="auth-stars s1" />
        <div className="auth-stars s2" />
        <div className="auth-stars s3" />
      </div>

      <div className="floating-caterpillar c1">🐛</div>
      <div className="floating-caterpillar c2">🐛</div>
      <div className="floating-caterpillar c3">🐛</div>
      <div className="floating-caterpillar c4">🐛</div>

      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon"></span>
          <span className="auth-logo-text">
            Runway<span>Radar</span>
          </span>
        </div>
        <p className="auth-tagline">Put Your Details in, Rat</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-note">
          Private app — invite only.<br />
        </p>
      </div>
    </div>
  )
}
