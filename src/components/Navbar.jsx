import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-cinema-darker border-b border-cinema-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-cinema-gold rounded-lg flex items-center justify-center text-lg">
              🎬
            </div>
            <span className="text-white font-bold text-xl tracking-wide group-hover:text-cinema-gold transition-colors">
              CineBook
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-cinema-gold transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-cinema-gold transition-colors text-sm font-medium"
            >
              About Us
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-cinema-gold transition-colors text-sm font-medium"
                >
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm border border-cinema-border hover:border-red-700 hover:text-red-400 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="bg-cinema-gold hover:bg-cinema-gold-dark text-black text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-cinema-border py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-cinema-gold px-2 py-1 text-sm">Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-cinema-gold px-2 py-1 text-sm">About Us</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-cinema-gold px-2 py-1 text-sm">My Account</Link>
                <button onClick={handleSignOut} className="text-left text-red-400 px-2 py-1 text-sm">Sign Out</button>
              </>
            ) : (
              <Link to="/signin" onClick={() => setMenuOpen(false)} className="text-cinema-gold font-semibold px-2 py-1 text-sm">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
