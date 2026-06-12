import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('choice') // choice | login | register | guest
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()
  const { setGuestInfo, setBookingType } = useBooking()
  const navigate = useNavigate()

  const clearError = () => setError('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    try {
      await signIn(email, password)
      setBookingType('user')
      onClose()
      navigate('/tickets')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    try {
      await signUp(email, password, fullName)
      setBookingType('user')
      onClose()
      navigate('/tickets')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = (e) => {
    e.preventDefault()
    clearError()
    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setGuestInfo({ name: guestName.trim(), email: guestEmail.trim() })
    onClose()
    navigate('/tickets')
  }

  const inputClass =
    'w-full bg-cinema-darker border border-cinema-border text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-cinema-gold transition-colors'

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* CHOICE */}
        {mode === 'choice' && (
          <div>
            <div className="text-3xl mb-3">🎟️</div>
            <h2 className="text-white text-2xl font-bold mb-1">Continue Booking</h2>
            <p className="text-gray-400 text-sm mb-6">How would you like to proceed?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { clearError(); setMode('login') }}
                className="w-full bg-cinema-gold hover:bg-cinema-gold-dark text-black font-semibold py-3.5 rounded-xl transition-colors"
              >
                Sign In / Create Account
              </button>
              <button
                onClick={() => { clearError(); setMode('guest') }}
                className="w-full bg-transparent hover:bg-cinema-border text-white font-semibold py-3.5 rounded-xl transition-colors border border-cinema-border"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <div>
            <button onClick={() => { setMode('choice'); clearError() }} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
              ← Back
            </button>
            <h2 className="text-white text-2xl font-bold mb-6">Sign In</h2>
            {error && (
              <div className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-900/40 p-3 rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
              <button type="submit" disabled={loading} className="bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-4 text-center">
              No account?{' '}
              <button onClick={() => { setMode('register'); clearError() }} className="text-cinema-gold hover:underline">
                Register here
              </button>
            </p>
          </div>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <div>
            <button onClick={() => { setMode('login'); clearError() }} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
              ← Back
            </button>
            <h2 className="text-white text-2xl font-bold mb-6">Create Account</h2>
            {error && (
              <div className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-900/40 p-3 rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} minLength={6} required />
              <button type="submit" disabled={loading} className="bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* GUEST */}
        {mode === 'guest' && (
          <div>
            <button onClick={() => { setMode('choice'); clearError() }} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
              ← Back
            </button>
            <h2 className="text-white text-2xl font-bold mb-1">Guest Booking</h2>
            <p className="text-gray-400 text-sm mb-6">We'll send your booking confirmation by email.</p>
            {error && (
              <div className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-900/40 p-3 rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={handleGuest} className="flex flex-col gap-4">
              <input type="text" placeholder="Your full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} required />
              <input type="email" placeholder="Your email address" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputClass} required />
              <button type="submit" className="bg-cinema-gold hover:bg-cinema-gold-dark text-black font-semibold py-3 rounded-xl transition-colors">
                Continue as Guest →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
