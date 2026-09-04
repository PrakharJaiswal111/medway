/*
# MedWay — core schema (single-tenant, no auth)

Creates the tables that back the MedWay healthcare navigation app:
hospitals, doctors, appointments, and medical documents.

1. New Tables
- `hospitals` — directory of hospitals with rating, distance, wait, OPD status, departments, etc.
  - id (text PK), name, type, distance, distance_value, rating, reviews, cost, wait, wait_value, opd, departments (text[]), accent, area
- `doctors` — doctors attached to a hospital.
  - id (text PK), name, speciality, hospital_id (FK -> hospitals), experience, fee
- `appointments` — booked appointments.
  - id (text PK), patient, hospital_id (FK -> hospitals), doctor_name, department, date, slot, status, fee, created_at
- `documents` — uploaded medical document metadata (file bytes are not stored; this is metadata only).
  - id (uuid PK), name, type, size, date, created_at

2. Security
- RLS enabled on all tables.
- This is a single-tenant demo app with no sign-in screen, so all CRUD is open to anon + authenticated (intentionally public/shared data). Policies use USING(true)/WITH CHECK(true) and are documented as such.

3. Notes
- hospitals and doctors are seeded by a follow-up migration.
- appointments.id is a human-readable text like "MW-1042" supplied by the app.
- documents stores metadata only — actual file upload to Storage is out of scope for this step.
*/

CREATE TABLE IF NOT EXISTS hospitals (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  distance text NOT NULL,
  distance_value numeric NOT NULL,
  rating numeric NOT NULL,
  reviews integer NOT NULL,
  cost text NOT NULL,
  wait text NOT NULL,
  wait_value integer NOT NULL,
  opd text NOT NULL,
  departments text[] NOT NULL DEFAULT '{}',
  accent text NOT NULL,
  area text NOT NULL
);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_hospitals" ON hospitals;
CREATE POLICY "anon_select_hospitals" ON hospitals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_hospitals" ON hospitals;
CREATE POLICY "anon_insert_hospitals" ON hospitals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_hospitals" ON hospitals;
CREATE POLICY "anon_update_hospitals" ON hospitals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_hospitals" ON hospitals;
CREATE POLICY "anon_delete_hospitals" ON hospitals FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS doctors (
  id text PRIMARY KEY,
  name text NOT NULL,
  speciality text NOT NULL,
  hospital_id text NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  experience text NOT NULL,
  fee integer NOT NULL
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctors" ON doctors;
CREATE POLICY "anon_select_doctors" ON doctors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctors" ON doctors;
CREATE POLICY "anon_insert_doctors" ON doctors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctors" ON doctors;
CREATE POLICY "anon_update_doctors" ON doctors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctors" ON doctors;
CREATE POLICY "anon_delete_doctors" ON doctors FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS appointments (
  id text PRIMARY KEY,
  patient text NOT NULL,
  hospital_id text NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  department text NOT NULL,
  date text NOT NULL,
  slot text NOT NULL,
  status text NOT NULL DEFAULT 'Confirmed',
  fee integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  date text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);