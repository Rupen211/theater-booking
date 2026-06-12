import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isPast,
} from 'date-fns'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { MOCK_MOVIES, MOCK_SHOWTIMES } from '../data/mockData'
import LoginModal from '../components/LoginModal'

const GRADIENTS = [
  'from-amber-900 via-orange-900 to-red-950',
  'from-red-900 via-rose-900 to-pink-950',
  'from-slate-800 via-blue-900 to-indigo-950',
  'from-indigo-900 via-purple-900 to-violet-950',
  'from-gray-800 via-zinc-900 to-gray-950',
  'from-teal-900 via-emerald-900 to-green-950',
]

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${ampm}`
}

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setMovie, setShowtime } = useBooking()
  const { user } = useAuth()

  const [movie, setMovieState] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [timesForDate, setTimesForDate] = useState([])
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const found = MOCK_MOVIES.find((m) => m.id === id)
    if (!found) { navigate('/'); return }
    setMovieState(found)
    setMovie(found)

    const dates = [
      ...new Set(
        MOCK_SHOWTIMES.filter((st) => st.movie_id === id).map((st) => st.show_date)
      ),
    ]
    setAvailableDates(dates)
  }, [id])

  useEffect(() => {
    if (!selectedDate) return
    const times = MOCK_SHOWTIMES
      .filter((st) => st.movie_id === id && st.show_date === selectedDate)
      .sort((a, b) => a.show_time.localeCompare(b.show_time))
    setTimesForDate(times)
  }, [selectedDate, id])

  const handleTimeClick = (showtime) => {
    setShowtime(showtime, selectedDate)
    if (user) {
      navigate('/tickets')
    } else {
      setShowLoginModal(true)
    }
  }

  // Calendar
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = getDay(monthStart)

  const movieIndex = MOCK_MOVIES.findIndex((m) => m.id === id)
  const gradient = GRADIENTS[movieIndex >= 0 ? movieIndex % GRADIENTS.length : 0]

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading…</div>
      </div>
    )
  }

  return (
    <div>
      {/* Banner */}
      <div className={`relative bg-gradient-to-r ${gradient} py-14 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster placeholder */}
            <div
              className={`flex-shrink-0 w-40 h-56 rounded-xl border border-white/10 bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}
            >
              <div className="text-center text-white opacity-70">
                <div className="text-4xl mb-1">🎬</div>
                <div className="text-xs font-bold">{movie.rating}</div>
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-cinema-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                  {movie.rating}
                </span>
                <span className="text-white/70 text-sm">{movie.genre}</span>
                <span className="text-white/50 text-sm">• {movie.duration_minutes} min</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{movie.title}</h1>
              <p className="text-gray-300 text-base max-w-2xl leading-relaxed mb-4">
                {movie.description}
              </p>
              {movie.cast && (
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-200 font-medium">Cast: </span>
                  {movie.cast.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar + Showtimes */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
            <h2 className="text-white text-xl font-bold mb-6">Select a Date</h2>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-cinema-border text-gray-400 hover:text-white transition-colors"
              >
                ‹
              </button>
              <span className="text-white font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-cinema-border text-gray-400 hover:text-white transition-colors"
              >
                ›
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs text-gray-600 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const isAvailable = availableDates.includes(dateStr)
                const isSelected = selectedDate === dateStr
                const isPastDay = isPast(day) && !isToday(day)

                let cls =
                  'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none '

                if (isSelected) {
                  cls += 'bg-cinema-gold text-black font-bold'
                } else if (!isPastDay && isAvailable) {
                  cls +=
                    'border border-cinema-gold/30 text-white hover:bg-cinema-gold/20 cursor-pointer'
                } else if (isPastDay) {
                  cls += 'text-gray-700 cursor-not-allowed'
                } else {
                  cls += 'text-gray-700 cursor-not-allowed'
                }

                if (isToday(day) && !isSelected) {
                  cls += ' ring-1 ring-cinema-gold/50'
                }

                return (
                  <button
                    key={dateStr}
                    disabled={isPastDay || !isAvailable}
                    onClick={() => isAvailable && !isPastDay && setSelectedDate(dateStr)}
                    className={cls}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-cinema-border text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-cinema-gold/30" />
                Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cinema-gold" />
                Selected
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-1 ring-cinema-gold/50" />
                Today
              </div>
            </div>
          </div>

          {/* Showtimes */}
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
            <h2 className="text-white text-xl font-bold mb-6">
              {selectedDate
                ? `Showtimes — ${format(new Date(selectedDate + 'T00:00:00'), 'EEE, d MMM')}`
                : 'Select a date to see showtimes'}
            </h2>

            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm">Pick a date from the calendar</p>
              </div>
            ) : timesForDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                <div className="text-4xl mb-3">😔</div>
                <p className="text-sm">No showtimes on this date</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {timesForDate.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleTimeClick(st)}
                    className="flex items-center justify-between bg-cinema-darker border border-cinema-border hover:border-cinema-gold/50 rounded-xl p-4 transition-all group text-left"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-cinema-gold font-bold text-lg tabular-nums">
                        {formatTime(st.show_time)}
                      </span>
                      <span className="text-gray-500 text-sm">Hall {st.hall_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-400 bg-green-900/20 px-2.5 py-1 rounded-full">
                        {st.available_seats} seats
                      </span>
                      <span className="text-cinema-gold opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  )
}
