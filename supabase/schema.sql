-- =========================================
-- CineBook — Supabase Schema
-- Run this in your Supabase SQL editor
-- (for sample data, run seed.sql afterwards)
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (mirrors auth.users) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email     TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Movies ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  genre            TEXT,
  duration_minutes INTEGER,
  rating           TEXT,
  poster_url       TEXT,
  cast_members     TEXT[],
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Showtimes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS showtimes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id         UUID REFERENCES movies(id) ON DELETE CASCADE,
  show_date        DATE NOT NULL,
  show_time        TIME NOT NULL,
  hall_number      INTEGER DEFAULT 1,
  total_seats      INTEGER DEFAULT 140,
  available_seats  INTEGER DEFAULT 140,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seats ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  showtime_id  UUID REFERENCES showtimes(id) ON DELETE CASCADE,
  seat_row     TEXT NOT NULL,
  seat_number  INTEGER NOT NULL,
  seat_type    TEXT DEFAULT 'standard',  -- standard | premium | front
  is_booked    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(showtime_id, seat_row, seat_number)
);

-- ── Bookings ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  showtime_id       UUID REFERENCES showtimes(id),
  user_id           UUID REFERENCES auth.users(id),
  guest_email       TEXT,
  guest_name        TEXT,
  total_price       DECIMAL(10,2),
  status            TEXT DEFAULT 'confirmed',
  booking_reference TEXT UNIQUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Booking Tickets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_tickets (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id       UUID REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_type      TEXT NOT NULL,   -- adult | student | senior
  quantity         INTEGER NOT NULL,
  price_per_ticket DECIMAL(10,2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Booking Seats ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_seats (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id    UUID REFERENCES seats(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ─────────────────────────────────────────────────────────
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE showtimes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats   ENABLE ROW LEVEL SECURITY;

-- Public read for catalogue tables
CREATE POLICY "movies_public_read"    ON movies    FOR SELECT USING (true);
CREATE POLICY "showtimes_public_read" ON showtimes FOR SELECT USING (true);
CREATE POLICY "seats_public_read"     ON seats     FOR SELECT USING (true);

-- Users
CREATE POLICY "users_own_read"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_update" ON users FOR UPDATE USING (auth.uid() = id);

-- Bookings — anyone can insert (guests), owners can read theirs
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Booking tickets / seats — open for insert/select (booking flow)
CREATE POLICY "bt_insert" ON booking_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "bt_select" ON booking_tickets FOR SELECT USING (true);
CREATE POLICY "bs_insert" ON booking_seats   FOR INSERT WITH CHECK (true);
CREATE POLICY "bs_select" ON booking_seats   FOR SELECT USING (true);

-- Seats update (mark as booked)
CREATE POLICY "seats_update" ON seats FOR UPDATE USING (true);

-- Showtimes update (decrement available_seats on booking)
CREATE POLICY "showtimes_update" ON showtimes FOR UPDATE USING (true);

-- ── Table privileges ───────────────────────────────────────────────────────────
-- RLS policies only filter rows AFTER Postgres confirms the role has base
-- table access — they don't grant that access themselves. Tables created via
-- the SQL editor (unlike the Table Editor UI) get no privileges for anon /
-- authenticated by default, so without these grants every query 42501s
-- ("permission denied for table ...") before RLS is ever evaluated.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT                 ON movies          TO anon, authenticated;
GRANT SELECT, UPDATE         ON showtimes       TO anon, authenticated;
GRANT SELECT, UPDATE         ON seats           TO anon, authenticated;
GRANT SELECT, INSERT         ON bookings        TO anon, authenticated;
GRANT SELECT, INSERT         ON booking_tickets TO anon, authenticated;
GRANT SELECT, INSERT         ON booking_seats   TO anon, authenticated;
GRANT SELECT, UPDATE         ON users           TO authenticated;

-- ── Auto-create user profile on sign-up ────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
