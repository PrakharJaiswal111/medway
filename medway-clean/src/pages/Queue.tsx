import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Radio, UserRound, Clock, Phone, Navigation, CheckCircle2 } from 'lucide-react';
import { useHospital, fetchAppointment, type Appointment } from '@/lib/data';

export default function Queue() {
  const { appointmentId } = useParams();
  const nav = useNavigate();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const { hospital: h } = useHospital(appt?.hospital_id);
  const [ahead, setAhead] = useState(7);
  const [wait, setWait] = useState(24);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    let active = true;
    (async () => {
      try { const a = await fetchAppointment(appointmentId); if (active) setAppt(a); }
      catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [appointmentId]);

  useEffect(() => {
    timer.current = setInterval(() => {
      setAhead((a) => (a > 0 ? a - 1 : 0));
      setWait((w) => (w > 0 ? w - 3 : 0));
    }, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav(-1)} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Radio size={26} /></span>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Live Queue</h1>
        <p className="text-sm text-[#5a7785]">{h?.name || 'Hospital'} · {appointmentId}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-5 text-center">
          <UserRound size={20} className="mx-auto text-[#0b8f91]" />
          <p className="mt-2 display text-3xl font-extrabold text-[#102c3a]">{ahead}</p>
          <p className="text-xs font-semibold text-[#5a7785]">patients ahead</p>
        </div>
        <div className="card p-5 text-center">
          <Clock size={20} className="mx-auto text-[#0b8f91]" />
          <p className="mt-2 display text-3xl font-extrabold text-[#102c3a]">{wait}</p>
          <p className="text-xs font-semibold text-[#5a7785]">min estimated wait</p>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-bold text-[#102c3a]">Your token</p>
        <p className="mt-1 display text-4xl font-extrabold text-[#0b8f91]">#{appointmentId?.slice(-3) || '042'}</p>
        <p className="mt-2 text-xs text-[#5a7785]">Counter updates every few seconds. Please wait for your turn.</p>
      </div>

      {appt && (
        <div className="card p-4 text-sm">
          <div className="flex items-center justify-between"><span className="text-[#5a7785]">Doctor</span><span className="font-semibold text-[#102c3a]">{appt.doctor_name}</span></div>
          <div className="mt-2 flex items-center justify-between"><span className="text-[#5a7785]">Slot</span><span className="font-semibold text-[#102c3a]">{appt.date} · {appt.slot}</span></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <a href="tel:102" className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white">
          <Phone size={15} /> Call Hospital
        </a>
        <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#0b8f91]">
          <Navigation size={15} /> Directions
        </a>
      </div>

      {ahead === 0 && wait === 0 && (
        <div className="card flex items-center gap-3 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={20} /> It's your turn! Please proceed to the consultation room.
        </div>
      )}
    </div>
  );
}
