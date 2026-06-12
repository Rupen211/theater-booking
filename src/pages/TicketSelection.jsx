import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useBooking } from '../context/BookingContext'
import { TICKET_PRICES } from '../data/mockData'

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${ampm}`
}

const TICKET_TYPES = [
  { key: 'adult', label: 'Adult', description: 'Ages 18 and over', emoji: '🧑' },
  { key: 'student', label: 'Student', description: 'Valid student ID required', emoji: '🎓' },
  { key: 'senior', label: 'Senior', description: 'Ages 60 and over', emoji: '👴' },
]

function Stepper({ value, onChange, min = 0, max = 10 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-cinema-border text-white hover:border-cinema-gold hover:text-cinema-gold disabled:opacity-30 transition-colors font-bold text-lg leading-none flex items-center justify-center"
      >
        −
      </button>
      <span className="text-white font-bold w-5 text-center tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border border-cinema-border text-white hover:border-cinema-gold hover:text-cinema-gold disabled:opacity-30 transition-colors font-bold text-lg leading-none flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}

export default function TicketSelection() {
  const navigate = useNavigate()
  const { booking, setTickets } = useBooking()
  const [tickets, setLocal] = useState({ adult: 0, student: 0, senior: 0 })

  if (!booking.selectedMovie || !booking.selectedShowtime) {
    navigate('/')
    return null
  }

  const total = Object.entries(tickets).reduce(
    (sum, [type, qty]) => sum + qty * TICKET_PRICES[type],
    0
  )
  const totalTickets = Object.values(tickets).reduce((s, q) => s + q, 0)

  const handleChange = (type, val) => {
    setLocal((prev) => ({ ...prev, [type]: Math.max(0, Math.min(10, val)) }))
  }

  const handleConfirm = () => {
    if (totalTickets === 0) return
    setTickets(tickets)
    navigate('/seats')
  }

  const showDate = booking.selectedDate
    ? format(new Date(booking.selectedDate + 'T00:00:00'), 'EEEE, d MMMM yyyy')
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
        {['Movie', 'Date & Time', 'Tickets', 'Seats', 'Confirm'].map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            {i > 0 && <span>›</span>}
            <span className={step === 'Tickets' ? 'text-cinema-gold font-medium' : ''}>{step}</span>
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 mb-8">
        <h2 className="text-white font-bold text-lg mb-2">{booking.selectedMovie.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>📅 {showDate}</span>
          <span>🕐 {formatTime(booking.selectedShowtime.show_time)}</span>
          <span>🎭 Hall {booking.selectedShowtime.hall_number}</span>
        </div>
      </div>

      {/* Ticket types */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-6">Select Tickets</h1>
        <div className="flex flex-col gap-4">
          {TICKET_TYPES.map((type) => (
            <div
              key={type.key}
              className="bg-cinema-card border border-cinema-border rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{type.emoji}</span>
                <div>
                  <div className="text-white font-semibold">{type.label}</div>
                  <div className="text-gray-500 text-sm">{type.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-cinema-gold font-bold tabular-nums">
                  £{TICKET_PRICES[type.key].toFixed(2)}
                </span>
                <Stepper
                  value={tickets[type.key]}
                  onChange={(v) => handleChange(type.key, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      {totalTickets > 0 && (
        <div className="bg-cinema-card border border-cinema-border rounded-xl p-5 mb-6">
          <div className="flex flex-wrap gap-3 mb-3">
            {Object.entries(tickets)
              .filter(([, qty]) => qty > 0)
              .map(([type, qty]) => (
                <span key={type} className="text-sm text-gray-400 capitalize">
                  {qty}× {type}
                </span>
              ))}
          </div>
          <div className="flex justify-between items-center border-t border-cinema-border pt-3">
            <span className="text-white font-semibold">
              Total ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
            </span>
            <span className="text-cinema-gold font-bold text-xl tabular-nums">
              £{total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={totalTickets === 0}
        className="w-full bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors text-base"
      >
        Confirm Tickets — Select Seats →
      </button>
    </div>
  )
}
