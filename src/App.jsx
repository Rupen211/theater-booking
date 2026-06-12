import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import MovieDetail from './pages/MovieDetail'
import TicketSelection from './pages/TicketSelection'
import SeatSelection from './pages/SeatSelection'
import Confirmation from './pages/Confirmation'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-cinema-dark flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/tickets" element={<TicketSelection />} />
                <Route path="/seats" element={<SeatSelection />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
