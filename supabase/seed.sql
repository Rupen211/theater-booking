-- =========================================
-- CineBook — Sample Data
-- Run after schema.sql in your Supabase SQL editor
-- (safe to re-run — uses ON CONFLICT DO NOTHING)
-- =========================================

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

-- ── Sample Showtimes ───────────────────────────────────────────────────────────
-- total_seats = 68 (rows A–F: 10 seats each = 60, row G: 8 premium pair seats = 8)
INSERT INTO showtimes (id, movie_id, show_date, show_time, hall_number, total_seats, available_seats) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '13:00', 1, 68, 68),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '18:00', 1, 68, 68),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE + 2, '15:30', 2, 68, 68),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE + 1, '14:00', 2, 68, 68),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, '20:00', 1, 68, 68),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, '16:00', 3, 68, 68),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE + 3, '19:30', 3, 68, 68),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', CURRENT_DATE + 2, '13:00', 1, 68, 68),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', CURRENT_DATE + 4, '17:00', 2, 68, 68),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', CURRENT_DATE + 1, '20:30', 2, 68, 68),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', CURRENT_DATE + 3, '14:30', 1, 68, 68),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', CURRENT_DATE + 2, '18:30', 3, 68, 68),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', CURRENT_DATE + 5, '21:00', 3, 68, 68)
ON CONFLICT DO NOTHING;

-- ── Seats ──────────────────────────────────────────────────────────────────────
-- Layout per showtime:
--   Rows A–F : 10 seats each  (A = front, B–F = standard)
--   Row G    : 8 seats        (premium pairs — 4 pairs of 2)
DO $$
DECLARE
  st_id     UUID;
  r         TEXT;
  rows      TEXT[]    := ARRAY['A','B','C','D','E','F','G'];
  stype     TEXT;
  seat_cnt  INT;
  sn        INT;
BEGIN
  FOR st_id IN SELECT id FROM showtimes LOOP
    FOREACH r IN ARRAY rows LOOP
      IF    r = 'A' THEN stype := 'front';    seat_cnt := 10;
      ELSIF r = 'G' THEN stype := 'premium';  seat_cnt := 8;
      ELSE               stype := 'standard'; seat_cnt := 10;
      END IF;

      FOR sn IN 1..seat_cnt LOOP
        INSERT INTO seats (showtime_id, seat_row, seat_number, seat_type, is_booked)
        VALUES (st_id, r, sn, stype, FALSE)
        ON CONFLICT (showtime_id, seat_row, seat_number) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;
