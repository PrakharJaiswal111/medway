import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Calendar, ChevronRight, Clock, Home, IndianRupee, Radio, ReceiptText } from 'lucide-react';
import { CURRENT_PATIENT, fetchAppointments, useHospitals, type Appointment } from '@/lib/data';
import { downloadReceiptPdf } from '@/lib/receipt';

export default function MyBookings() {
  const nav = useNavigate();
  const { hospitals } = useHospitals();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await fetchAppointments();
        if (active) setAppts(rows.filter((a) => a.patient === CURRENT_PATIENT));
      } catch {
        if (active) setAppts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const hospitalById = useMemo(
    () => new Map(hospitals.map((h) => [h.id, h.name])),
    [hospitals],
  );

  const sorted = useMemo(() => {
    return [...appts].sort((a, b) => {
      if (a.created_at && b.created_at) return b.created_at.localeCompare(a.created_at);
      if (a.created_at) return -1;
      if (b.created_at) return 1;
      return b.id.localeCompare(a.id);
    });
  }, [appts]);

  const upcoming = sorted.filter((a) => a.status !== 'Completed');
  const past = sorted.filter((a) => a.status === 'Completed');

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav(-1)} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Back
      </button>

      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">My Bookings</h1>
        <p className="text-sm text-[#5a7785]">{CURRENT_PATIENT} &middot; {sorted.length} appointments</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <Calendar size={18} className="text-[#0b8f91]" />
          <p className="mt-2 display text-2xl font-extrabold text-[#102c3a]">{upcoming.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5a7785]">Active</p>
        </div>
        <div className="card p-4">
          <Clock size={18} className="text-[#0b8f91]" />
          <p className="mt-2 display text-2xl font-extrabold text-[#102c3a]">{past.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5a7785]">Completed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="card h-32 animate-pulse bg-[#f3f9fa]" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Calendar size={24} /></span>
          <h2 className="display text-lg font-extrabold text-[#102c3a]">No bookings yet</h2>
          <Link to="/" className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] px-5 py-3 text-sm font-bold text-white">
            <Home size={15} /> Book Appointment
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.length > 0 && <BookingGroup title="Active Bookings" appts={upcoming} hospitalById={hospitalById} />}
          {past.length > 0 && <BookingGroup title="Past Bookings" appts={past} hospitalById={hospitalById} />}
        </div>
      )}
    </div>
  );
}

function BookingGroup({ title, appts, hospitalById }: { title: string; appts: Appointment[]; hospitalById: Map<string, string> }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-[#102c3a]">{title}</h2>
      {appts.map((appt) => (
        <BookingCard key={appt.id} appt={appt} hospitalName={hospitalById.get(appt.hospital_id) || appt.hospital_id} />
      ))}
    </section>
  );
}

function BookingCard({ appt, hospitalName }: { appt: Appointment; hospitalName: string }) {
  const active = appt.status !== 'Completed';

  return (
    <article className="card overflow-hidden">
      <Link to={`/confirmation/${appt.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#0b8f91]">{appt.id}</p>
            <h3 className="mt-1 display text-base font-extrabold text-[#102c3a]">{appt.doctor_name}</h3>
            <p className="text-xs font-semibold text-[#5a7785]">{appt.department}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${active ? 'bg-green-50 text-green-600' : 'bg-[#eef3f4] text-[#5a7785]'}`}>
            {appt.status}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <Row icon={Building2} label="Hospital" value={hospitalName} />
          <Row icon={Calendar} label="Date" value={appt.date} />
          <Row icon={Clock} label="Time" value={appt.slot} />
          <Row icon={IndianRupee} label="Fee" value={`Rs ${appt.fee}`} />
        </div>
      </Link>

      <div className="flex items-center border-t border-[#eef3f4]">
        {active && (
          <Link to={`/queue/${appt.id}`} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold text-[#0b8f91]">
            <Radio size={15} /> Track Queue
          </Link>
        )}
        <button onClick={() => downloadReceiptPdf(appt, hospitalName)} className="flex flex-1 items-center justify-center gap-2 border-l border-[#eef3f4] py-3 text-sm font-bold text-[#0b8f91]">
          <ReceiptText size={15} /> Receipt
        </button>
        <Link to={`/confirmation/${appt.id}`} className="flex flex-1 items-center justify-center gap-2 border-l border-[#eef3f4] py-3 text-sm font-bold text-[#5a7785] hover:text-[#0b8f91]">
          Details <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-[#5a7785]"><Icon size={15} /> {label}</span>
      <span className="text-right font-semibold text-[#102c3a]">{value}</span>
    </div>
  );
}
