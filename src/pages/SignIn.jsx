import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const [tab, setTab] = useState('login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const clearMessages = () => { setError(''); setSuccess('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      await signUp(email, password, fullName, phone)
      setSuccess('Account created! Check your email to confirm, then sign in.')
      setTab('login')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-cinema-darker border border-cinema-border text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-cinema-gold transition-colors'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎬</div>
          <h1 className="text-white text-3xl font-bold">Welcome to CineBook</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to manage your bookings</p>
        </div>

        {/* Card */}
        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-cinema-darker rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab('login'); clearMessages() }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'login'
                  ? 'bg-cinema-gold text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); clearMessages() }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'register'
                  ? 'bg-cinema-gold text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-900/40 p-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm mb-4 bg-green-900/20 border border-green-900/40 p-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Sign In form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors mt-1"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                minLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors mt-1"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-cinema-gold text-sm transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
