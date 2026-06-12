import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { TICKET_PRICES } from '../data/mockData'
import { supabase } from '../lib/supabase'

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${ampm}`
}

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'CB-'
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)]
  return ref
}

export default function Confirmation() {
  const navigate = useNavigate()
  const { booking, resetBooking } = useBooking()
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  if (!booking.selectedMovie || !booking.selectedShowtime) {
    navigate('/')
    return null
  }

  const total = Object.entries(booking.tickets).reduce(
    (sum, [type, qty]) => sum + qty * TICKET_PRICES[type],
    0
  )
  const showDate = booking.selectedDate
    ? format(new Date(booking.selectedDate + 'T00:00:00'), 'EEEE, d MMMM yyyy')
    : ''

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email ||
    booking.guestInfo?.name ||
    'Guest'

  const displayEmail = user?.email || booking.guestInfo?.email || ''

  const handleConfirm = async () => {
    setSubmitting(true)
    const ref = genRef()

    try {
      if (supabase) {
        const { data: bookingRow } = await supabase
          .from('bookings')
          .insert({
            showtime_id: null, // mock showtimes have no UUID in DB
            user_id: user?.id ?? null,
            guest_email: booking.guestInfo?.email ?? null,
            guest_name: booking.guestInfo?.name ?? null,
            total_price: total,
            status: 'confirmed',
            booking_reference: ref,
          })
          .select('id')
          .single()

        if (bookingRow?.id) {
          const ticketRows = Object.entries(booking.tickets)
            .filter(([, qty]) => qty > 0)
            .map(([type, qty]) => ({
              booking_id: bookingRow.id,
              ticket_type: type,
              quantity: qty,
              price_per_ticket: TICKET_PRICES[type],
            }))
          await supabase.from('booking_tickets').insert(ticketRows)
        }
      }
    } catch {
      // DB not configured — still proceed
    }

    setBookingRef(ref)
    setConfirmed(true)
    setSubmitting(false)
  }

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-cinema-card border border-green-800/30 rounded-2xl p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-white text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 mb-8">
            Enjoy the show, {displayName.split(' ')[0]}! Your confirmation details are below.
          </p>

          <div className="bg-cinema-gold/10 border border-cinema-gold/25 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="text-cinema-gold text-3xl font-extrabold tracking-widest">{bookingRef}</p>
          </div>

          <div className="text-left bg-cinema-darker rounded-xl p-5 mb-8 space-y-2 text-sm">
            {[
              ['Film', booking.selectedMovie.title],
              ['Date', showDate],
              ['Time', formatTime(booking.selectedShowtime.show_time)],
              ['Hall', `Hall ${booking.selectedShowtime.hall_number}`],
              [
                'Seats',
                booking.selectedSeats.map((s) => `${s.seat_row}${s.seat_number}`).join(', '),
              ],
              ['Total paid', `£${total.toFixed(2)}`],
              ['Confirmation to', displayEmail],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-200 text-right">{val}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { resetBooking(); navigate('/') }}
            className="bg-cinema-gold hover:bg-cinema-gold-dark text-black font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
        {['Movie', 'Date & Time', 'Tickets', 'Seats', 'Confirm'].map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            {i > 0 && <span>›</span>}
            <span className={step === 'Confirm' ? 'text-cinema-gold font-medium' : ''}>{step}</span>
          </span>
        ))}
      </div>

      <h1 className="text-white text-3xl font-bold mb-8">Review Your Booking</h1>

      {/* Summary card */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-xl mb-5">{booking.selectedMovie.title}</h2>

        <div className="space-y-3 text-sm border-b border-cinema-border pb-5 mb-5">
          {[
            ['Date', showDate],
            ['Time', formatTime(booking.selectedShowtime.show_time)],
            ['Hall', `Hall ${booking.selectedShowtime.hall_number}`],
            [
              'Seats',
              booking.selectedSeats.map((s) => `${s.seat_row}${s.seat_number}`).join(', '),
            ],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="text-white">{val}</span>
            </div>
          ))}
        </div>

        {/* Ticket breakdown */}
        <div className="space-y-2 text-sm border-b border-cinema-border pb-5 mb-5">
          {Object.entries(booking.tickets)
            .filter(([, qty]) => qty > 0)
            .map(([type, qty]) => (
              <div key={type} className="flex justify-between">
                <span className="text-gray-400 capitalize">
                  {type} × {qty}
                </span>
                <span className="text-white tabular-nums">
                  £{(qty * TICKET_PRICES[type]).toFixed(2)}
                </span>
              </div>
            ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white font-bold">Total</span>
          <span className="text-cinema-gold font-bold text-2xl tabular-nums">
            £{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Booker info */}
      <div className="bg-cinema-card border border-cinema-border rounded-xl p-5 mb-8">
        <h3 className="text-gray-400 text-sm mb-2">Booking for</h3>
        <p className="text-white font-semibold">{displayName}</p>
        <p className="text-gray-400 text-sm">{displayEmail}</p>
        {booking.bookingType === 'guest' && (
          <span className="inline-block mt-2 text-xs bg-cinema-border text-gray-400 px-2 py-1 rounded">
            Guest Booking
          </span>
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors text-base"
      >
        {submitting ? 'Processing…' : `Confirm & Pay £${total.toFixed(2)}`}
      </button>
      <p className="text-gray-600 text-xs text-center mt-3">
        By confirming you agree to our terms and conditions.
      </p>
    </div>
  )
}
