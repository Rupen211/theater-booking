-- =========================================
-- CineBook — Supabase Schema
-- Run this in your Supabase SQL editor
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

-- ── Sample Movies ──────────────────────────────────────────────────────────────
INSERT INTO movies (id, title, description, genre, duration_minutes, rating, cast_members) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Dune: Part Two',
   'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge.',
   'Sci-Fi / Adventure', 166, '12A',
   ARRAY['Timothée Chalamet','Zendaya','Rebecca Ferguson']),

  ('a0000000-0000-0000-0000-000000000002', 'Oppenheimer',
   'The story of J. Robert Oppenheimer''s role in the development of the atomic bomb.',
   'Biography / Drama', 180, '15',
   ARRAY['Cillian Murphy','Emily Blunt','Matt Damon']),

  ('a0000000-0000-0000-0000-000000000003', 'The Batman',
   'Batman uncovers corruption in Gotham while facing a serial killer known as the Riddler.',
   'Action / Crime', 176, '15',
   ARRAY['Robert Pattinson','Zoë Kravitz','Paul Dano']),

  ('a0000000-0000-0000-0000-000000000004', 'Interstellar',
   'Explorers travel through a wormhole in space to ensure humanity''s survival.',
   'Sci-Fi / Drama', 169, 'PG',
   ARRAY['Matthew McConaughey','Anne Hathaway','Jessica Chastain']),

  ('a0000000-0000-0000-0000-000000000005', 'Mission: Impossible',
   'Ethan Hunt must track down a dangerous weapon before it falls into the wrong hands.',
   'Action / Thriller', 163, 'PG-13',
   ARRAY['Tom Cruise','Hayley Atwell','Ving Rhames']),

  ('a0000000-0000-0000-0000-000000000006', 'Poor Things',
   'The fantastical evolution of Bella Baxter, brought back to life by an unorthodox scientist.',
   'Comedy / Drama', 141, '18',
   ARRAY['Emma Stone','Mark Ruffalo','Willem Dafoe'])
ON CONFLICT DO NOTHING;
