import { Siren, Phone, MapPin, Navigation, Clock, Star, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHospitals } from '@/lib/data';

export default function Emergency() {
  const nav = useNavigate();
  const { hospitals, loading } = useHospitals();
  if (loading) return <div className="card h-64 animate-pulse bg-[#f3f9fa]" />;
  if (hospitals.length === 0) return null;
  const nearest = hospitals.filter((h) => h.departments.includes('Emergency Care')).sort((a, b) => a.distance_value - b.distance_value)[0] || hospitals[0];
  const others = hospitals.filter((h) => h.id !== nearest.id && h.departments.includes('Emergency Care')).slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-500 text-white"><Siren size={20} /></span>
        <div>
          <h1 className="display text-xl font-extrabold text-[#102c3a]">Emergency Care</h1>
          <p className="text-sm text-[#5a7785]">Nearest severe-care hospital</p>
        </div>
      </div>

      <div className="card overflow-hidden border-red-200">
        <div className="flex items-center gap-2 bg-red-50 px-5 py-2.5">
          <AlertTriangle size={15} className="text-red-500" />
          <span className="text-xs font-bold text-red-600">High priority — seek care immediately</span>
        </div>
        <div className="relative h-32 w-full overflow-hidden">
          {nearest.image ? (
            <img src={nearest.image} alt={nearest.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-red-500 to-red-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-transparent" />
        </div>
        <div className="p-5">
          <h2 className="display text-lg font-extrabold text-[#102c3a]">{nearest.name}</h2>
          <p className="text-sm text-[#5a7785]">{nearest.type} · {nearest.area}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-bold text-[#102c3a]"><Star size={15} fill="#0b8f91" className="text-[#0b8f91]" /> {nearest.rating}</span>
            <span className="flex items-center gap-1 text-[#5a7785]"><MapPin size={15} /> {nearest.distance}</span>
            <span className="flex items-center gap-1 text-[#5a7785]"><Clock size={15} /> {nearest.wait} wait</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <a href="tel:102" className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white">
              <Phone size={16} /> Call Now
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#0b8f91]">
              <Navigation size={16} /> Directions
            </a>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-bold text-[#102c3a]">Other emergency-ready hospitals</p>
        <div className="flex flex-col gap-3">
          {others.map((h) => (
            <div key={h.id} className="flex items-center justify-between border-b border-[#eef3f4] pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {h.image && <img src={h.image} alt="" className="h-10 w-10 rounded-full object-cover" />}
                <div>
                  <button onClick={() => nav(`/hospital/${h.id}`)} className="text-sm font-bold text-[#102c3a] hover:text-[#0b8f91]">{h.name}</button>
                  <p className="text-xs text-[#5a7785]">{h.distance} · {h.wait} wait</p>
                </div>
              </div>
              <a href="tel:102" className="flex items-center gap-1 rounded-full bg-[#e6f5f5] px-3 py-1.5 text-xs font-bold text-[#0b8f91]"><Phone size={12} /> Call</a>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-[#fff7ed] p-5 text-sm text-[#9a6a3a]">
        <p className="font-bold text-[#102c3a]">When to use emergency care</p>
        <p className="mt-1 text-xs">Chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke symptoms, or major injury.</p>
      </div>
    </div>
  );
}
