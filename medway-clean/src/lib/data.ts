import { useEffect, useMemo, useState } from 'react';
import { supabase, type Hospital, type Doctor, type Appointment, type DocumentRow, type DoctorReview, type HospitalReview } from '@/lib/supabase';
import hospitalsFallback from '@/data/hospitals.json';
import doctorsFallback from '@/data/doctors.json';
import appointmentsFallback from '@/data/appointments.json';
import reviewsFallback from '@/data/reviews.json';

export type { Hospital, Doctor, Appointment, DocumentRow, DoctorReview, HospitalReview };
export const CURRENT_PATIENT = 'Aarav Menon';
export const DEFAULT_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
];

const VISITS_KEY = 'medway_local_visits';
const DOC_REVIEWS_KEY = 'medway_local_doctor_reviews';
const HOSP_REVIEWS_KEY = 'medway_local_hospital_reviews';

function mergeRecord<T extends Record<string, any>>(base: T, overlay: T): T {
  const out = { ...base, ...overlay };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const v = overlay[key];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0) || v === 0) {
      out[key] = base[key];
    }
  }
  return out;
}

function overlayKnown<T extends { id: string }>(seed: T[], live: T[]): T[] {
  const map = new Map(seed.map((item) => [item.id, item]));
  live.forEach((item) => {
    const prev = map.get(item.id);
    if (prev) map.set(item.id, mergeRecord(prev, item));
  });
  return [...map.values()];
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normHospital(h: any): Hospital {
  return {
    id: h.id,
    name: h.name,
    type: h.type,
    distance: h.distance,
    distance_value: Number(h.distance_value ?? h.distanceValue ?? 0),
    rating: Number(h.rating),
    reviews: h.reviews,
    cost: h.cost,
    wait: h.wait,
    wait_value: Number(h.wait_value ?? h.waitValue ?? 0),
    opd: h.opd,
    departments: h.departments ?? [],
    accent: h.accent,
    area: h.area,
    image: h.image ?? null,
    gallery: h.gallery ?? [],
  };
}

function normDoctor(d: any): Doctor {
  return {
    id: d.id,
    name: d.name,
    speciality: d.speciality,
    hospital_id: d.hospital_id ?? d.hospitalId,
    experience: d.experience,
    fee: d.fee,
    image: d.image ?? null,
    rating: Number(d.rating ?? 0),
    reviews: Number(d.reviews ?? 0),
    bio: d.bio ?? '',
    slots: Array.isArray(d.slots) && d.slots.length ? d.slots : DEFAULT_SLOTS,
  };
}

function normAppointment(a: any): Appointment {
  return {
    id: a.id,
    patient: a.patient,
    hospital_id: a.hospital_id ?? a.hospitalId,
    doctor_name: a.doctor_name ?? a.doctor,
    department: a.department,
    date: a.date,
    slot: a.slot,
    status: a.status,
    fee: a.fee ?? 0,
    created_at: a.created_at ?? '',
  };
}

function normDocument(d: any): DocumentRow {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    size: d.size,
    date: d.date,
    created_at: d.created_at,
  };
}

const seededHospitals = (hospitalsFallback as any[]).map(normHospital);
const seededDoctors = (doctorsFallback as any[]).map(normDoctor);
const seededAppointments = (appointmentsFallback as any[]).map(normAppointment);
const seededDoctorReviews = ((reviewsFallback as any).doctors ?? []) as DoctorReview[];
const seededHospitalReviews = ((reviewsFallback as any).hospitals ?? []) as HospitalReview[];

export function useHospitals() {
  const [data, setData] = useState<Hospital[]>(seededHospitals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: rows, error: err } = await supabase.from('hospitals').select('*');
        if (err) throw err;
        if (active) setData(overlayKnown(seededHospitals, (rows ?? []).map(normHospital)));
      } catch (e: any) {
        if (active) {
          setError(e.message);
          setData(seededHospitals);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { hospitals: data, loading, error };
}

export function useHospital(id: string | undefined) {
  const { hospitals, loading, error } = useHospitals();
  const hospital = id ? hospitals.find((h) => h.id === id) : undefined;
  return { hospital, loading, error };
}

export function useDoctors() {
  const [data, setData] = useState<Doctor[]>(seededDoctors);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: rows, error } = await supabase.from('doctors').select('*');
        if (error) throw error;
        if (active) setData(overlayKnown(seededDoctors, (rows ?? []).map(normDoctor)));
      } catch {
        if (active) setData(seededDoctors);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { doctors: data, loading };
}

export function useDoctorsForHospital(hospitalId: string | undefined) {
  const { doctors, loading } = useDoctors();
  const filtered = useMemo(
    () => doctors.filter((d) => d.hospital_id === hospitalId),
    [doctors, hospitalId],
  );
  return { doctors: filtered, loading };
}

export function useDoctor(id: string | undefined) {
  const { doctors, loading } = useDoctors();
  const doctor = id ? doctors.find((d) => d.id === id) : undefined;
  return { doctor, loading };
}

function localVisits(): Appointment[] {
  return readJson<Appointment[]>(VISITS_KEY, []).map(normAppointment);
}

export function listKnownAppointments(remote: Appointment[] = []): Appointment[] {
  const map = new Map<string, Appointment>();
  seededAppointments.forEach((a) => map.set(a.id, a));
  [...remote, ...localVisits()].forEach((a) => {
    const prev = map.get(a.id);
    map.set(a.id, prev ? mergeRecord(prev, a) : a);
  });
  return [...map.values()];
}

function visitStatuses(status: string) {
  return ['Completed', 'Checked in', 'Visited'].includes(status);
}

export function hasVisitedDoctor(doctorName: string, patient = CURRENT_PATIENT) {
  return listKnownAppointments().some(
    (a) => a.patient === patient && a.doctor_name === doctorName && visitStatuses(a.status),
  );
}

export function hasVisitedHospital(hospitalId: string, patient = CURRENT_PATIENT) {
  return listKnownAppointments().some(
    (a) => a.patient === patient && a.hospital_id === hospitalId && visitStatuses(a.status),
  );
}

export function useDoctorReviews(doctorId: string | undefined) {
  const [extra, setExtra] = useState<DoctorReview[]>(() => readJson(DOC_REVIEWS_KEY, []));

  const reviews = useMemo(() => {
    const all = [...seededDoctorReviews, ...extra].filter((r) => r.visited && r.doctorId === doctorId);
    const seen = new Set<string>();
    return all.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [doctorId, extra]);

  const add = (rating: number, text: string, doctorName: string) => {
    if (!doctorId) return { ok: false, error: 'Missing doctor.' };
    if (!hasVisitedDoctor(doctorName)) {
      return { ok: false, error: 'Only patients who have visited this doctor can comment.' };
    }
    if (reviews.some((r) => r.patient === CURRENT_PATIENT)) {
      return { ok: false, error: 'You have already shared a visit comment for this doctor.' };
    }
    const next: DoctorReview = {
      id: 'local-' + Date.now(),
      doctorId,
      patient: CURRENT_PATIENT,
      rating,
      text: text.trim(),
      visitedOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      visited: true,
    };
    const stored = [...readJson<DoctorReview[]>(DOC_REVIEWS_KEY, []), next];
    writeJson(DOC_REVIEWS_KEY, stored);
    setExtra(stored);
    return { ok: true };
  };

  return { reviews, add };
}

export function useHospitalReviews(hospitalId: string | undefined) {
  const extra = readJson<HospitalReview[]>(HOSP_REVIEWS_KEY, []);
  const reviews = useMemo(() => {
    return [...seededHospitalReviews, ...extra].filter((r) => r.visited && r.hospitalId === hospitalId);
  }, [hospitalId, extra]);
  return { reviews };
}

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return listKnownAppointments((data ?? []).map(normAppointment));
  } catch {
    return listKnownAppointments();
  }
}

export async function fetchAppointment(id: string): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (data) return normAppointment(data);
  } catch { /* use local */ }
  return listKnownAppointments().find((a) => a.id === id) ?? null;
}

export async function createAppointment(a: {
  id: string;
  patient: string;
  hospital_id: string;
  doctor_name: string;
  department: string;
  date: string;
  slot: string;
  fee: number;
  status?: string;
}): Promise<Appointment> {
  const row = {
    id: a.id,
    patient: a.patient,
    hospital_id: a.hospital_id,
    doctor_name: a.doctor_name,
    department: a.department,
    date: a.date,
    slot: a.slot,
    fee: a.fee,
    status: a.status ?? 'Confirmed',
  };
  const local: Appointment = { ...row, created_at: new Date().toISOString() };
  writeJson(VISITS_KEY, [...localVisits(), local]);
  try {
    const { data, error } = await supabase.from('appointments').insert(row).select('*').single();
    if (error) throw error;
    return normAppointment(data);
  } catch {
    return local;
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const local = localVisits();
  const found = [...seededAppointments, ...local].find((a) => a.id === id);
  if (found) writeJson(VISITS_KEY, [...local.filter((a) => a.id !== id), { ...found, status }]);
  try {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) throw error;
  } catch {
    /* local copy is enough for visit-gated comments */
  }
}

export async function updateHospitalOPD(id: string, open: boolean) {
  const { error } = await supabase.from('hospitals').update({ opd: open ? 'Open' : 'Closed' }).eq('id', id);
  if (error) throw error;
}

export function useDocuments() {
  const [data, setData] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data: rows, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setData((rows ?? []).map(normDocument));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (d: { name: string; type: string; size: number; date: string }) => {
    const { data: row, error } = await supabase.from('documents').insert(d).select('*').single();
    if (error) throw error;
    setData((prev) => [normDocument(row), ...prev]);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  return { documents: data, loading, add, remove };
}
