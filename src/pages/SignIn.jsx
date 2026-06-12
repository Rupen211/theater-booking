import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const [tab, setTab] = useState('login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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
      await signUp(email, password, fullName)
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
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
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
