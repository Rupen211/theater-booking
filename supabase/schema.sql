-- =========================================
-- CineBook — Supabase Schema
-- Run this in your Supabase SQL editor
-- (for sample data, run seed.sql afterwards)
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (mirrors auth.users) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email          TEXT NOT NULL,
  full_name      TEXT,
  mobile_number  TEXT,
  address        TEXT,
  permission     TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'staff' | 'admin'
  created_at     TIMESTAMPTZ DEFAULT NOW()
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
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- is_admin() helper — SECURITY DEFINER so the SELECT inside it runs as the
-- function owner (bypassing RLS on `users`) instead of as the calling role.
-- Without that, a policy that queried `users` to check the caller's own
-- permission would trigger that same policy again on the inner query,
-- recursing.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND permission = 'admin'
  );
$$;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Same pattern as is_admin(), but for "can view the Users page" — staff can
-- see the full user list but not add/delete (that's still admin-only,
-- enforced server-side in the create-user/delete-user edge functions, not
-- through RLS at all).
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND permission IN ('admin', 'staff')
  );
$$;
GRANT EXECUTE ON FUNCTION is_staff_or_admin() TO authenticated;

-- Public read for catalogue tables
CREATE POLICY "movies_public_read"    ON movies    FOR SELECT USING (true);
CREATE POLICY "showtimes_public_read" ON showtimes FOR SELECT USING (true);
CREATE POLICY "seats_public_read"     ON seats     FOR SELECT USING (true);

-- Users
CREATE POLICY "users_own_read"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_update" ON users FOR UPDATE USING (auth.uid() = id);
-- Admins and staff can read every row (permissive policies OR together with
-- the one above, so this only ever widens access, never narrows a user's
-- own read). Routed through is_staff_or_admin() (SECURITY DEFINER) rather
-- than checking `permission` inline here, to avoid the policy recursively
-- invoking itself when it queries the very table it's protecting.
CREATE POLICY "users_staff_admin_read_all" ON users FOR SELECT USING (is_staff_or_admin());

-- Bookings — anyone can insert (guests), only the signed-in owner can read.
-- Guest bookings (user_id IS NULL) are deliberately NOT readable via the
-- client — there is no way to scope that to "just the guest who made it"
-- under RLS, so allowing it would make every guest booking's name/email/
-- price/reference public to anyone with the anon key.
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (auth.uid() = user_id);

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
-- UPDATE is deliberately column-scoped, not table-wide: users_own_update's
-- USING clause only checks `auth.uid() = id`, it doesn't restrict which
-- columns can change. A table-wide UPDATE grant would let any signed-in
-- user set their own `permission` to 'admin' via a direct API call,
-- bypassing the app UI entirely. This grant is the actual enforcement.
GRANT SELECT                 ON users           TO authenticated;
GRANT UPDATE (full_name, mobile_number, address) ON users TO authenticated;

-- service_role bypasses RLS but still needs its own base grants — it's a
-- regular Postgres role otherwise, not exempt from the same rule as above.
-- Used by the delete-user/create-user edge functions: SELECT to check the
-- caller's own permission, UPDATE to set a new user's permission to 'admin'
-- (handle_new_user always defaults new rows to 'user' first).
GRANT SELECT, UPDATE ON users TO service_role;

-- ── Auto-create user profile on sign-up ────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, mobile_number, address)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
