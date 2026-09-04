import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  url || 'http://127.0.0.1:54321',
  anonKey || 'local-preview-anon-key',
);

export interface Hospital {
  id: string;
  name: string;
  type: string;
  distance: string;
  distance_value: number;
  rating: number;
  reviews: number;
  cost: string;
  wait: string;
  wait_value: number;
  opd: string;
  departments: string[];
  accent: string;
  area: string;
  image: string | null;
  gallery: string[];
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  hospital_id: string;
  experience: string;
  fee: number;
  image: string | null;
  rating: number;
  reviews: number;
  bio: string;
  slots: string[];
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patient: string;
  rating: number;
  text: string;
  visitedOn: string;
  visited: boolean;
}

export interface HospitalReview {
  id: string;
  hospitalId: string;
  patient: string;
  rating: number;
  text: string;
  visitedOn: string;
  visited: boolean;
}

export interface Appointment {
  id: string;
  patient: string;
  hospital_id: string;
  doctor_name: string;
  department: string;
  date: string;
  slot: string;
  status: string;
  fee: number;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  created_at: string;
}
