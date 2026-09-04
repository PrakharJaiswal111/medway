import { useEffect, useState } from 'react';
import { Users, Clock, ToggleLeft, ToggleRight, Activity, Calendar } from 'lucide-react';
import { useHospitals, fetchAppointments, updateHospitalOPD, updateAppointmentStatus, type Appointment } from '@/lib/data';

export default function Admin() {
  const { hospitals, loading } = useHospitals();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [opd, setOpd] = useState<Record<string, boolean>>({});
  const [queue, setQueue] = useState<Record<string, number>>({});

  useEffect(() => {
    if (hospitals.length === 0) return;
    setOpd(Object.fromEntries(hospitals.map((h) => [h.id, h.opd === 'Open'])));
    setQueue(Object.fromEntries(hospitals.map((h) => [h.id, Math.floor(Math.random() * 20) + 3])));
  }, [hospitals]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const a = await fetchAppointments();
        if (active) setAppts(a);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, []);

  const toggleOPD = async (id: string) => {
    const next = !opd[id];
    setOpd((o) => ({ ...o, [id]: next }));
    try { await updateHospitalOPD(id, next); } catch { /* ignore */ }
  };

  const tick = (id: string, delta: number) => setQueue((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }));

  const hospitalName = (id: string) => hospitals.find((h) => h.id === id)?.name || id;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Admin Dashboard</h1>
        <p className="text-sm text-[#5a7785]">Hospital operations overview</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center"><Users size={18} className="mx-auto text-[#0b8f91]" /><p className="mt-1 display text-2xl font-extrabold text-[#102c3a]">{appts.length}</p><p className="text-[10px] font-semibold text-[#5a7785]">Appointments</p></div>
        <div className="card p-4 text-center"><Activity size={18} className="mx-auto text-[#0b8f91]" /><p className="mt-1 display text-2xl font-extrabold text-[#102c3a]">{Object.values(opd).filter(Boolean).length}</p><p className="text-[10px] font-semibold text-[#5a7785]">OPD Open</p></div>
        <div className="card p-4 text-center"><Clock size={18} className="mx-auto text-[#0b8f91]" /><p className="mt-1 display text-2xl font-extrabold text-[#102c3a]">{Object.values(queue).reduce((a, b) => a + b, 0)}</p><p className="text-[10px] font-semibold text-[#5a7785]">In Queue</p></div>
      </div>

      <div className="card overflow-x-auto p-5">
        <p className="mb-3 text-sm font-bold text-[#102c3a]">Booked Appointments</p>
        {appts.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#5a7785]">No appointments yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-[#5a7785]">
                <th className="pb-2 font-bold">ID</th><th className="pb-2 font-bold">Patient</th><th className="pb-2 font-bold">Hospital</th><th className="pb-2 font-bold">Doctor</th><th className="pb-2 font-bold">Date</th><th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id} className="border-t border-[#eef3f4]">
                  <td className="py-2.5 text-xs font-bold text-[#0b8f91]">{a.id}</td>
                  <td className="py-2.5 font-semibold text-[#102c3a]">{a.patient}</td>
                  <td className="py-2.5 text-[#5a7785]">{hospitalName(a.hospital_id)}</td>
                  <td className="py-2.5 text-[#5a7785]">{a.doctor_name}</td>
                  <td className="py-2.5 text-[#5a7785]">{a.date} · {a.slot}</td>
                  <td className="py-2.5">
                    <button onClick={() => {
                      const next = a.status === 'Confirmed' ? 'Checked in' : a.status === 'Checked in' ? 'Completed' : 'Confirmed';
                      setAppts((prev) => prev.map((x) => x.id === a.id ? { ...x, status: next } : x));
                      updateAppointmentStatus(a.id, next).catch(() => {});
                    }} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.status === 'Completed' ? 'bg-teal-50 text-teal-700' : a.status === 'Checked in' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {a.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-bold text-[#102c3a]">OPD & Live Queue</p>
        {loading ? (
          <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[#f3f9fa]" />)}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {hospitals.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef3f4] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: h.accent }} />
                  <span className="text-sm font-bold text-[#102c3a]">{h.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleOPD(h.id)} className="flex items-center gap-1 text-xs font-bold">
                      {opd[h.id] ? <ToggleRight size={26} className="text-[#0b8f91]" /> : <ToggleLeft size={26} className="text-[#b9cdd2]" />}
                      <span className={opd[h.id] ? 'text-[#0b8f91]' : 'text-[#5a7785]'}>{opd[h.id] ? 'Open' : 'Closed'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#5a7785]">Queue</span>
                    <button onClick={() => tick(h.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#f3f9fa] text-[#5a7785]">-</button>
                    <span className="w-6 text-center text-sm font-bold text-[#102c3a]">{queue[h.id]}</span>
                    <button onClick={() => tick(h.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#f3f9fa] text-[#5a7785]">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card flex items-center gap-3 bg-[#f3f9fa] p-4 text-xs text-[#5a7785]">
        <Calendar size={16} className="text-[#0b8f91]" /> Appointments and OPD status are stored in your Supabase database and persist across refreshes.
      </div>
    </div>
  );
}
