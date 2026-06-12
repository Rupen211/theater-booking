import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-cinema-darker border-t border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-cinema-gold rounded-lg flex items-center justify-center text-base">🎬</div>
            <span className="text-white font-bold text-lg group-hover:text-cinema-gold transition-colors">CineBook</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-cinema-gold transition-colors">Home</Link>
            <Link to="/about" className="hover:text-cinema-gold transition-colors">About Us</Link>
          </div>

          <p className="text-gray-600 text-sm">© 2026 CineBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
