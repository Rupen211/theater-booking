import dunePoster from '../source_files/Dune_part_two.webp'
import oppenheimerPoster from '../source_files/Oppenheimer.webp'
import batmanPoster from '../source_files/The_Batman.webp'
import interstellarPoster from '../source_files/Interstellar.webp'
import missionImpossiblePoster from '../source_files/MI_Dead_reckoning.webp'
import poorThingsPoster from '../source_files/Poor_things_v01.jpg'

export const POSTER_MAP = {
  'Dune: Part Two': dunePoster,
  'Oppenheimer': oppenheimerPoster,
  'The Batman': batmanPoster,
  'Interstellar': interstellarPoster,
  'Mission: Impossible': missionImpossiblePoster,
  'Poor Things': poorThingsPoster,
}

export const GRADIENT_MAP = {
  'Dune: Part Two': 'from-amber-900 via-orange-900 to-red-950',
  'Oppenheimer': 'from-red-900 via-orange-900 to-yellow-950',
  'The Batman': 'from-slate-800 via-blue-900 to-indigo-950',
  'Interstellar': 'from-indigo-900 via-purple-900 to-violet-950',
  'Mission: Impossible': 'from-gray-800 via-zinc-900 to-red-950',
  'Poor Things': 'from-teal-900 via-emerald-900 to-green-950',
}

export const TICKET_PRICES = {
  adult: 12.5,
  student: 8.5,
  senior: 9.5,
}
