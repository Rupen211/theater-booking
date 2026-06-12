import { createContext, useContext, useState } from 'react'

const BookingContext = createContext({})

const initialState = {
  selectedMovie: null,
  selectedShowtime: null,
  selectedDate: null,
  tickets: { adult: 0, student: 0, senior: 0 },
  selectedSeats: [],
  guestInfo: null,
  bookingType: null,
}

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(initialState)

  const setMovie = (movie) =>
    setBooking((prev) => ({ ...prev, selectedMovie: movie }))

  const setShowtime = (showtime, date) =>
    setBooking((prev) => ({ ...prev, selectedShowtime: showtime, selectedDate: date }))

  const setTickets = (tickets) =>
    setBooking((prev) => ({ ...prev, tickets }))

  const setSeats = (seats) =>
    setBooking((prev) => ({ ...prev, selectedSeats: seats }))

  const setGuestInfo = (info) =>
    setBooking((prev) => ({ ...prev, guestInfo: info, bookingType: 'guest' }))

  const setBookingType = (type) =>
    setBooking((prev) => ({ ...prev, bookingType: type }))

  const resetBooking = () => setBooking(initialState)

  const totalTickets =
    booking.tickets.adult + booking.tickets.student + booking.tickets.senior

  return (
    <BookingContext.Provider
      value={{
        booking,
        setMovie,
        setShowtime,
        setTickets,
        setSeats,
        setGuestInfo,
        setBookingType,
        resetBooking,
        totalTickets,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
