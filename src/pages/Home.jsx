import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import { supabase } from '../lib/supabase'
import { POSTER_MAP, GRADIENT_MAP } from '../data/mockData'

function enrichMovie(m) {
  return {
    ...m,
    cast: m.cast_members ?? [],
    poster_url: POSTER_MAP[m.title] ?? null,
    gradient: GRADIENT_MAP[m.title] ?? 'from-gray-800 via-gray-900 to-gray-950',
  }
}

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMovies() {
      if (!supabase) {
        setError('Database not configured. Please check your environment variables.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.from('movies').select('*').order('title')
      if (error) {
        setError('Failed to load movies. Please try again later.')
      } else {
        setMovies((data ?? []).map(enrichMovie))
      }
      setLoading(false)
    }
    fetchMovies()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-cinema-darker overflow-hidden py-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cinema-dark to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-cinema-gold/10 border border-cinema-gold/25 text-cinema-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            🎬 Now Showing
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-5 leading-tight">
            Your Perfect<br />
            <span className="text-cinema-gold">Cinema Night</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Book your favourite films online. Pick your seats, choose your time, and let the magic begin.
          </p>
          <a
            href="#movies"
            className="inline-block bg-cinema-gold hover:bg-cinema-gold-dark text-black font-bold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Browse Movies →
          </a>
        </div>
      </section>

      {/* Movies grid */}
      <section id="movies" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1 h-8 bg-cinema-gold rounded-full" />
          <h2 className="text-white text-3xl font-bold">Now Showing</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-cinema-card border border-cinema-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-72 bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-800 rounded w-5/6" />
                  <div className="h-10 bg-gray-800 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-gray-400">No movies available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-cinema-darker border-t border-cinema-border py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎟️',
                title: 'Easy Booking',
                desc: 'Book your tickets in under two minutes with our intuitive flow.',
              },
              {
                icon: '💺',
                title: 'Choose Your Seat',
                desc: 'Interactive theater diagram so you always get the spot you want.',
              },
              {
                icon: '🔒',
                title: 'Secure & Simple',
                desc: 'Your details are safe. Guest checkout available — no account needed.',
              },
            ].map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
