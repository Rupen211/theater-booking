import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { supabase } from '../lib/supabase'

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const PREMIUM_ROW = 'G'

function seatClass(seat, isSelected) {
  const base =
    'w-9 h-9 rounded-md border text-xs font-bold transition-all flex items-center justify-center'

  if (seat.is_booked)
    return `${base} bg-gray-800 border-gray-700 cursor-not-allowed opacity-40`
  if (isSelected)
    return `${base} bg-cinema-gold border-amber-500 text-black cursor-pointer shadow-md shadow-amber-500/40`
  if (seat.seat_type === 'front')
    return `${base} bg-blue-900/30 border-blue-700/60 text-blue-300 hover:bg-blue-700/40 cursor-pointer`
  return `${base} bg-cinema-darker border-cinema-border text-gray-500 hover:bg-gray-700 hover:border-gray-500 hover:text-white cursor-pointer`
}

function premiumSeatClass(seat, isSelected) {
  const base =
    'w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center'

  if (seat.is_booked)
    return `${base} bg-gray-800 border-gray-700 cursor-not-allowed opacity-40`
  if (isSelected)
    return `${base} bg-cinema-gold border-amber-400 text-black cursor-pointer shadow-md shadow-amber-500/50`
  return `${base} bg-purple-900/40 border-purple-600/70 text-purple-200 hover:bg-purple-700/50 hover:border-purple-500 cursor-pointer`
}

export default function SeatSelection() {
  const navigate = useNavigate()
  const { booking, setSeats, totalTickets } = useBooking()
  const [allSeats, setAllSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchedRef = useRef(false)
  useEffect(() => {
    if (!booking.selectedShowtime) { navigate('/'); return }
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchSeats() {
      if (!supabase) { setLoading(false); return }
      const { data } = await supabase
        .from('seats')
        .select('*')
        .eq('showtime_id', booking.selectedShowtime.id)
        .order('seat_row')
        .order('seat_number')
      setAllSeats(data ?? [])
      setLoading(false)
    }

    fetchSeats()
  }, [booking.selectedShowtime])

  if (!booking.selectedMovie || !booking.selectedShowtime) return null

  const toggleSeat = (seat) => {
    if (seat.is_booked) return
    setSelected((prev) => {
      const already = prev.find((s) => s.id === seat.id)
      if (already) return prev.filter((s) => s.id !== seat.id)
      if (prev.length >= totalTickets) return prev
      return [...prev, seat]
    })
  }

  const handleConfirm = () => {
    if (selected.length !== totalTickets) return
    setSeats(selected)
    navigate('/confirmation')
  }

  const remaining = totalTickets - selected.length

  const renderRegularRow = (row) => {
    const rowSeats = allSeats.filter((s) => s.seat_row === row)
    const mid = Math.floor(rowSeats.length / 2)
    const left = rowSeats.slice(0, mid)
    const right = rowSeats.slice(mid)

    return (
      <div key={row} className="flex items-center gap-2">
        <span className="w-5 text-right text-gray-600 text-xs font-mono select-none">{row}</span>

        <div className="flex items-center gap-0.5">
          {left.map((seat) => (
            <button
              key={seat.id}
              onClick={() => toggleSeat(seat)}
              className={seatClass(seat, !!selected.find((s) => s.id === seat.id))}
              title={`${seat.seat_row}${seat.seat_number}${seat.is_booked ? ' (booked)' : ''}`}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>

        <div className="w-5" />

        <div className="flex items-center gap-0.5">
          {right.map((seat) => (
            <button
              key={seat.id}
              onClick={() => toggleSeat(seat)}
              className={seatClass(seat, !!selected.find((s) => s.id === seat.id))}
              title={`${seat.seat_row}${seat.seat_number}${seat.is_booked ? ' (booked)' : ''}`}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>

        <span className="w-5 text-gray-600 text-xs font-mono select-none">{row}</span>
      </div>
    )
  }

  const renderPremiumRow = (row) => {
    const rowSeats = allSeats.filter((s) => s.seat_row === row)
    const pairs = []
    for (let i = 0; i < rowSeats.length; i += 2) {
      pairs.push(rowSeats.slice(i, i + 2))
    }
    const leftPairs = pairs.slice(0, 2)
    const rightPairs = pairs.slice(2)

    return (
      <div key={row} className="flex items-center gap-2 mt-6 pt-4 border-t border-purple-900/40">
        <span className="w-5 text-right text-purple-400 text-xs font-mono font-bold select-none">{row}</span>

        <div className="flex items-center gap-2">
          {leftPairs.map((pair, pIdx) => (
            <div key={pIdx} className="flex items-center gap-0.5">
              {pair.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat)}
                  className={premiumSeatClass(seat, !!selected.find((s) => s.id === seat.id))}
                  title={`${seat.seat_row}${seat.seat_number} — Premium${seat.is_booked ? ' (booked)' : ''}`}
                >
                  {seat.seat_number}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="w-5" />

        <div className="flex items-center gap-2">
          {rightPairs.map((pair, pIdx) => (
            <div key={pIdx} className="flex items-center gap-0.5">
              {pair.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat)}
                  className={premiumSeatClass(seat, !!selected.find((s) => s.id === seat.id))}
                  title={`${seat.seat_row}${seat.seat_number} — Premium${seat.is_booked ? ' (booked)' : ''}`}
                >
                  {seat.seat_number}
                </button>
              ))}
            </div>
          ))}
        </div>

        <span className="w-5 text-purple-400 text-xs font-mono font-bold select-none">{row}</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
        {['Movie', 'Date & Time', 'Tickets', 'Seats', 'Confirm'].map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            {i > 0 && <span>›</span>}
            <span className={step === 'Seats' ? 'text-cinema-gold font-medium' : ''}>{step}</span>
          </span>
        ))}
      </div>

      <h1 className="text-white text-3xl font-bold mb-1">Select Your Seats</h1>
      <p className="text-gray-400 text-sm mb-8">
        {remaining > 0
          ? `Choose ${remaining} more seat${remaining !== 1 ? 's' : ''} for ${booking.selectedMovie.title}`
          : `All ${totalTickets} seat${totalTickets !== 1 ? 's' : ''} selected — ready to confirm!`}
      </p>

      {/* Theater diagram */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 md:p-8 overflow-x-auto">
        {/* Screen */}
        <div className="mb-10 text-center min-w-[500px]">
          <div
            className="w-4/5 max-w-lg mx-auto h-2 rounded-full bg-cinema-gold/30 border border-cinema-gold/40 mb-2"
            style={{ boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}
          />
          <span className="text-xs text-gray-600 uppercase tracking-[0.25em]">SCREEN</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex flex-col gap-2 items-center min-w-[500px] animate-pulse">
            {SEAT_ROWS.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <div className="w-5 h-4 bg-gray-800 rounded" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-9 h-9 bg-gray-800 rounded-md" />
                  ))}
                </div>
                <div className="w-5" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-9 h-9 bg-gray-800 rounded-md" />
                  ))}
                </div>
                <div className="w-5 h-4 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center min-w-[500px]">
            {SEAT_ROWS.map((row) =>
              row === PREMIUM_ROW ? renderPremiumRow(row) : renderRegularRow(row)
            )}
            <p className="text-purple-400/70 text-xs mt-2 tracking-widest uppercase">
              ★ Premium Pairs — Row G
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-5 mt-8 pt-6 border-t border-cinema-border text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-cinema-darker border border-cinema-border" />
            Standard
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-900/30 border border-blue-700/60" />
            Front Row (A)
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-purple-900/40 border-2 border-purple-600/70" />
            Premium Pairs (G)
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-cinema-gold border border-amber-500 shadow-md shadow-amber-500/30" />
            Selected
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gray-800 border border-gray-700 opacity-40" />
            Unavailable
          </div>
        </div>
      </div>

      {/* Selected seats chips */}
      {selected.length > 0 && (
        <div className="mt-4 bg-cinema-card border border-cinema-border rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-2">
            Selected: {selected.length}/{totalTickets}
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSeat(s)}
                className="bg-cinema-gold text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                title="Click to deselect"
              >
                {s.seat_row}{s.seat_number} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={selected.length !== totalTickets}
        className="w-full mt-6 bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors text-base"
      >
        {selected.length === totalTickets
          ? 'Confirm Seats — Review Booking →'
          : `Select ${remaining} more seat${remaining !== 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
