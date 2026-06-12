import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'

const GRADIENTS = [
  'from-amber-900 via-orange-900 to-red-950',
  'from-red-900 via-rose-900 to-pink-950',
  'from-slate-800 via-blue-900 to-indigo-950',
  'from-indigo-900 via-purple-900 to-violet-950',
  'from-gray-800 via-zinc-900 to-gray-950',
  'from-teal-900 via-emerald-900 to-green-950',
]

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate()
  const { setMovie } = useBooking()

  const gradient = GRADIENTS[index % GRADIENTS.length]

  const handleSelect = () => {
    setMovie(movie)
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div
      className="group bg-cinema-card rounded-xl overflow-hidden border border-cinema-border hover:border-cinema-gold/40 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cinema-gold/10 hover:-translate-y-1"
      onClick={handleSelect}
    >
      {/* Poster area */}
      <div className={`relative h-60 bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />

        {/* Film grain texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <span className="bg-cinema-gold text-black text-xs font-bold px-2 py-1 rounded">
              {movie.rating}
            </span>
            <span className="text-white/60 text-xs bg-black/30 px-2 py-1 rounded">
              {movie.duration_minutes} min
            </span>
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">{movie.genre}</p>
            <h3 className="text-white font-bold text-xl leading-tight group-hover:text-cinema-gold transition-colors">
              {movie.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {movie.description}
        </p>
        {movie.cast && (
          <p className="text-gray-600 text-xs mb-4 truncate">
            {movie.cast.join(' · ')}
          </p>
        )}
        <button
          onClick={handleSelect}
          className="w-full bg-cinema-gold hover:bg-cinema-gold-dark text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          Book Tickets
        </button>
      </div>
    </div>
  )
}
