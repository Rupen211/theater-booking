import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import BookingDetailModal from '../components/BookingDetailModal'

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    if (!supabase) { setLoading(false); return }

    let cancelled = false
    supabase
      .from('bookings')
      .select(`
        *,
        booking_tickets(*),
        booking_seats(*, seats(seat_row, seat_number, seat_type)),
        showtimes(show_date, show_time, hall_number, movies(title))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setBookings(data || [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [user])

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-white text-3xl font-bold mb-8">My Bookings</h1>

      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
        {!supabase ? (
          <p className="text-gray-500 text-sm">Connect Supabase to see your bookings.</p>
        ) : loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎟️</div>
            <p className="text-gray-500 text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="text-left bg-cinema-darker border border-cinema-border hover:border-cinema-gold/50 rounded-xl p-4 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cinema-gold font-bold tracking-widest text-sm">{b.booking_reference}</span>
                  <span className="text-xs text-gray-500">
                    {b.created_at ? format(new Date(b.created_at), 'd MMM yyyy') : ''}
                  </span>
                </div>
                {b.showtimes?.movies?.title && (
                  <p className="text-white text-sm font-semibold mb-2">{b.showtimes.movies.title}</p>
                )}
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
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  )
}
