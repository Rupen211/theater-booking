export const MOCK_MOVIES = [
  {
    id: 'movie-1',
    title: 'Dune: Part Two',
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    genre: 'Sci-Fi / Adventure',
    duration_minutes: 166,
    rating: '12A',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    gradient: 'from-amber-900 via-orange-900 to-red-950',
  },
  {
    id: 'movie-2',
    title: 'Oppenheimer',
    description:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, exploring his complex scientific and political journey through triumph and moral reckoning.",
    genre: 'Biography / Drama',
    duration_minutes: 180,
    rating: '15',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    gradient: 'from-red-900 via-orange-900 to-yellow-950',
  },
  {
    id: 'movie-3',
    title: 'The Batman',
    description:
      "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    genre: 'Action / Crime',
    duration_minutes: 176,
    rating: '15',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
    gradient: 'from-slate-800 via-blue-900 to-indigo-950',
  },
  {
    id: 'movie-4',
    title: 'Interstellar',
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes increasingly uninhabitable.",
    genre: 'Sci-Fi / Drama',
    duration_minutes: 169,
    rating: 'PG',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    gradient: 'from-indigo-900 via-purple-900 to-violet-950',
  },
  {
    id: 'movie-5',
    title: 'Mission: Impossible',
    description:
      "Ethan Hunt and his IMF team must track down a dangerous weapon before it falls into the wrong hands, in their most impossible mission yet.",
    genre: 'Action / Thriller',
    duration_minutes: 163,
    rating: 'PG-13',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames'],
    gradient: 'from-gray-800 via-zinc-900 to-red-950',
  },
  {
    id: 'movie-6',
    title: 'Poor Things',
    description:
      "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    genre: 'Comedy / Drama',
    duration_minutes: 141,
    rating: '18',
    cast: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe'],
    gradient: 'from-teal-900 via-emerald-900 to-green-950',
  },
]

const pad = (n) => String(n).padStart(2, '0')

function generateShowtimes(movieId) {
  const today = new Date()
  const showtimes = []
  const times = ['10:30', '13:00', '15:30', '18:00', '20:30', '23:00']

  for (let day = 0; day < 14; day++) {
    const d = new Date(today)
    d.setDate(today.getDate() + day)
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    times.forEach((time, idx) => {
      if (day === 0 && idx < 2) return
      showtimes.push({
        id: `st-${movieId}-${day}-${idx}`,
        movie_id: movieId,
        show_date: dateStr,
        show_time: time,
        hall_number: (idx % 3) + 1,
        available_seats: 50 + ((day * 7 + idx * 13) % 50),
      })
    })
  }
  return showtimes
}

export const MOCK_SHOWTIMES = MOCK_MOVIES.flatMap((m) => generateShowtimes(m.id))

export function generateSeats(showtimeId, bookedCount = 25) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const seatsPerRow = 14
  const seats = []

  const bookedKeys = new Set()
  let attempts = 0
  while (bookedKeys.size < bookedCount && attempts < 1000) {
    const r = Math.floor(Math.abs(Math.sin(attempts + bookedKeys.size) * 1000) % rows.length)
    const s = Math.floor(Math.abs(Math.cos(attempts + bookedKeys.size) * 1000) % seatsPerRow) + 1
    bookedKeys.add(`${r}-${s}`)
    attempts++
  }

  rows.forEach((row, rowIdx) => {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      let seatType = 'standard'
      if (rowIdx >= 3 && rowIdx <= 6) seatType = 'premium'
      if (rowIdx === 0) seatType = 'front'

      seats.push({
        id: `seat-${showtimeId}-${row}-${seatNum}`,
        showtime_id: showtimeId,
        seat_row: row,
        seat_number: seatNum,
        seat_type: seatType,
        is_booked: bookedKeys.has(`${rowIdx}-${seatNum}`),
      })
    }
  })

  return seats
}

export const TICKET_PRICES = {
  adult: 12.5,
  student: 8.5,
  senior: 9.5,
}
