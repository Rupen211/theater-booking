# CineBook — Theatre Booking System

A full React + Supabase theatre booking website.

## Quick Start

```bash
cd theater-booking
npm install
npm run dev
```

The app runs on mock data out of the box — no Supabase account needed to explore the UI.

## Supabase Setup (optional, for real auth + bookings)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env` and fill in your credentials:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run `supabase/schema.sql` in your Supabase **SQL Editor** — this creates all tables, RLS policies, and seeds the 6 sample movies.
4. Restart the dev server.

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Extended profiles, linked to `auth.users` |
| `movies` | Film catalogue |
| `showtimes` | Dates + times per movie |
| `seats` | Per-showtime seat map |
| `bookings` | Booking records (user or guest) |
| `booking_tickets` | Ticket type breakdown per booking |
| `booking_seats` | Which seats belong to a booking |

## Booking Flow

```
Home → Movie Detail (calendar + times) → [Login Modal] → Ticket Selection → Seat Selection → Confirmation
```

## Tech Stack

- **React 18** + **React Router v6**
- **Supabase** (auth + database)
- **Tailwind CSS** (dark cinema theme)
- **date-fns** (calendar logic)
- **Vite** (build tool)
