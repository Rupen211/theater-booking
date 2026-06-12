import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Section({ title, children }) {
  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-5">
      <h2 className="text-white font-bold text-lg mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Alert({ type, message }) {
  if (!message) return null
  const styles =
    type === 'error'
      ? 'text-red-400 bg-red-900/20 border-red-900/40'
      : 'text-green-400 bg-green-900/20 border-green-900/40'
  return (
    <div className={`text-sm mb-4 border p-3 rounded-xl ${styles}`}>{message}</div>
  )
}

const inputClass =
  'w-full bg-cinema-darker border border-cinema-border text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-cinema-gold transition-colors'

const btnClass =
  'bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm'

export default function Profile() {
  const { user, updateProfile, updateEmail, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  // Personal info
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' })

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' })

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  // Booking history
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    const meta = user.user_metadata || {}
    setFullName(meta.full_name || '')
    setPhone(meta.phone || '')
    setAddress(meta.address || '')
    setNewEmail(user.email || '')
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    if (!supabase || !user) return
    setBookingsLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*, booking_tickets(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setBookingsLoading(false)
  }

  const handleInfoSave = async (e) => {
    e.preventDefault()
    setInfoLoading(true)
    setInfoMsg({ type: '', text: '' })
    try {
      await updateProfile({ full_name: fullName, phone, address })
      setInfoMsg({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message })
    } finally {
      setInfoLoading(false)
    }
  }

  const handleEmailSave = async (e) => {
    e.preventDefault()
    if (newEmail === user.email) {
      setEmailMsg({ type: 'error', text: 'That is already your current email.' })
      return
    }
    setEmailLoading(true)
    setEmailMsg({ type: '', text: '' })
    try {
      await updateEmail(newEmail)
      setEmailMsg({ type: 'success', text: 'Confirmation sent to your new email. Click the link there to finalise the change.' })
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message })
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPassLoading(true)
    setPassMsg({ type: '', text: '' })
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setPassMsg({ type: 'success', text: 'Password updated successfully.' })
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message })
    } finally {
      setPassLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold">My Account</h1>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={handleSignOut} className="text-sm border border-cinema-border hover:border-red-700 hover:text-red-400 text-gray-400 px-4 py-2 rounded-lg transition-colors">
          Sign Out
        </button>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information">
        <Alert type={infoMsg.type} message={infoMsg.text} />
        <form onSubmit={handleInfoSave} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 000000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your address"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={infoLoading} className={btnClass}>
              {infoLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* Email */}
      <Section title="Email Address">
        <Alert type={emailMsg.type} message={emailMsg.text} />
        <form onSubmit={handleEmailSave} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <p className="text-gray-600 text-xs">
            Changing your email will send a confirmation link to the new address.
          </p>
          <div className="flex justify-end">
            <button type="submit" disabled={emailLoading} className={btnClass}>
              {emailLoading ? 'Sending…' : 'Update Email'}
            </button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <Alert type={passMsg.type} message={passMsg.text} />
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              minLength={6}
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={passLoading} className={btnClass}>
              {passLoading ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Booking History */}
      <Section title="Booking History">
        {!supabase ? (
          <p className="text-gray-500 text-sm">Connect Supabase to see your booking history.</p>
        ) : bookingsLoading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎟️</div>
            <p className="text-gray-500 text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-cinema-darker border border-cinema-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cinema-gold font-bold tracking-widest text-sm">{b.booking_reference}</span>
                  <span className="text-xs text-gray-500">
                    {b.created_at ? format(new Date(b.created_at), 'd MMM yyyy') : ''}
                  </span>
                </div>
                {b.booking_tickets?.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {b.booking_tickets.map((t) => (
                      <span key={t.id} className="text-xs text-gray-400 capitalize bg-cinema-card border border-cinema-border px-2.5 py-1 rounded-full">
                        {t.ticket_type} × {t.quantity} — £{(t.quantity * t.price_per_ticket).toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-cinema-border">
                  <span className="text-xs text-green-400 capitalize">{b.status}</span>
                  <span className="text-white font-bold tabular-nums">£{Number(b.total_price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
