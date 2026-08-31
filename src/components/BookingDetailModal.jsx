import { format } from 'date-fns'
import { POSTER_MAP, GRADIENT_MAP } from '../data/movieAssets'

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${ampm}`
}

export default function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null

  const showtime = booking.showtimes
  const movieTitle = showtime?.movies?.title || 'Unknown Film'
  const posterUrl = POSTER_MAP[movieTitle] ?? null
  const gradient = GRADIENT_MAP[movieTitle] ?? 'from-gray-800 via-gray-900 to-gray-950'
  const showDate = showtime?.show_date
    ? format(new Date(showtime.show_date + 'T00:00:00'), 'EEEE, d MMMM yyyy')
    : '—'

  const seats = (booking.booking_seats || [])
    .map((bs) => bs.seats)
    .filter(Boolean)
    .sort((a, b) => a.seat_row === b.seat_row ? a.seat_number - b.seat_number : a.seat_row.localeCompare(b.seat_row))

  const tickets = (booking.booking_tickets || []).filter((t) => t.quantity > 0)
  const ticketsSubtotal = tickets.reduce((sum, t) => sum + t.quantity * t.price_per_ticket, 0)
  const premiumSurcharge = Math.max(0, Number(booking.total_price) - ticketsSubtotal)

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-md relative shadow-2xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-4 mb-5 pr-8">
          <div className={`flex-shrink-0 w-16 h-24 rounded-lg border border-white/10 bg-gradient-to-br ${gradient} overflow-hidden`}>
            {posterUrl && (
              <img src={posterUrl} alt={movieTitle} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold mb-1">{movieTitle}</h2>
            <p className="text-gray-500 text-xs">
              Booked {booking.created_at ? format(new Date(booking.created_at), 'd MMM yyyy, HH:mm') : ''}
            </p>
          </div>
        </div>

        {/* Booking reference */}
        <div className="bg-cinema-gold/10 border border-cinema-gold/25 rounded-xl p-4 mb-5 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Booking Reference</p>
          <p className="text-cinema-gold text-2xl font-extrabold tracking-widest">{booking.booking_reference}</p>
        </div>

        {/* Show details */}
        <div className="space-y-2 text-sm border-b border-cinema-border pb-5 mb-5">
          {[
            ['Date', showDate],
            ['Time', showtime?.show_time ? formatTime(showtime.show_time) : '—'],
            ['Hall', showtime?.hall_number ? `Hall ${showtime.hall_number}` : '—'],
            ['Seats', seats.length > 0 ? seats.map((s) => `${s.seat_row}${s.seat_number}`).join(', ') : '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="text-white text-right">{val}</span>
            </div>
          ))}
        </div>

        {/* Ticket breakdown */}
        <div className="space-y-2 text-sm border-b border-cinema-border pb-5 mb-5">
          {tickets.map((t) => (
            <div key={t.id} className="flex justify-between">
              <span className="text-gray-400 capitalize">
                {t.ticket_type} × {t.quantity}
              </span>
              <span className="text-white tabular-nums">
                £{(t.quantity * t.price_per_ticket).toFixed(2)}
              </span>
            </div>
          ))}
          {premiumSurcharge > 0.01 && (
            <div className="flex justify-between">
              <span className="text-purple-400">Premium surcharge</span>
              <span className="text-purple-300 tabular-nums">£{premiumSurcharge.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-bold">Total</span>
          <span className="text-cinema-gold font-bold text-2xl tabular-nums">
            £{Number(booking.total_price).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-end">
          <span className="text-xs text-green-400 capitalize">{booking.status}</span>
        </div>
      </div>
    </div>
  )
}
