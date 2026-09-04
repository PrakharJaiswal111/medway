import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Star, MapPin, Clock, Phone, ArrowLeft, Stethoscope, Building2, MessageSquare, Calendar, Navigation, CheckCircle2, ArrowRight } from 'lucide-react';
import { useHospital, useDoctorsForHospital, useHospitalReviews } from '@/lib/data';

export default function HospitalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hospital: h, loading } = useHospital(id);
  const { doctors: docs } = useDoctorsForHospital(id);
  const { reviews } = useHospitalReviews(id);
  const [tab, setTab] = useState<'overview' | 'doctors' | 'reviews'>('overview');
  const [activeImg, setActiveImg] = useState(0);

  if (loading) return <div className="card h-64 animate-pulse bg-[#f3f9fa]" />;
  if (!h) return <p className="py-20 text-center text-[#5a7785]">Hospital not found.</p>;

  const gallery = [h.image, ...(h.gallery ?? [])].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav(-1)} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card overflow-hidden">
        <div className="relative h-44 w-full overflow-hidden md:h-56">
          {gallery.length > 0 ? (
            <img src={gallery[activeImg]} alt={h.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${h.accent}, #0b8f91)` }} />
          )}
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <a href="tel:102" className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#0b8f91] backdrop-blur">
              <Phone size={13} /> Call
            </a>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(h.name + ' ' + h.area)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#0b8f91] backdrop-blur">
              <Navigation size={13} /> Directions
            </a>
          </div>
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-5 py-3">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${activeImg === i ? 'border-[#0b8f91]' : 'border-transparent'}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="px-5 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="display text-xl font-extrabold text-[#102c3a] md:text-2xl">{h.name}</h1>
              <p className="text-sm text-[#5a7785]">{h.type} · {h.area}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-bold text-[#102c3a]"><Star size={15} fill="#0b8f91" className="text-[#0b8f91]" /> {h.rating}</span>
            <span className="text-[#5a7785]">({h.reviews} reviews)</span>
            <span className="flex items-center gap-1 text-[#5a7785]"><MapPin size={15} /> {h.distance}</span>
            <span className="flex items-center gap-1 text-[#5a7785]"><Clock size={15} /> ~{h.wait} wait</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl bg-[#f3f9fa] p-1">
        {([['overview', 'Overview', Building2], ['doctors', `Doctors (${docs.length})`, Stethoscope], ['reviews', 'Reviews', MessageSquare]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition-colors ${tab === key ? 'bg-white text-[#0b8f91] soft-shadow' : 'text-[#5a7785]'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#102c3a]">OPD Status</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${h.opd === 'Open' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{h.opd}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#102c3a]">Estimated Wait</span>
              <span className="text-sm font-bold text-[#0b8f91]">{h.wait}</span>
            </div>
          </div>
          <div className="card p-5">
            <p className="mb-3 text-sm font-bold text-[#102c3a]">Departments</p>
            <div className="flex flex-wrap gap-2">
              {h.departments.map((d) => <span key={d} className="rounded-full bg-[#e6f5f5] px-3 py-1.5 text-xs font-semibold text-[#0b8f91]">{d}</span>)}
            </div>
          </div>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="flex flex-col gap-3">
          {docs.length === 0 && <p className="card p-6 text-center text-sm text-[#5a7785]">No doctors listed yet.</p>}
          {docs.map((d) => (
            <Link key={d.id} to={`/doctor/${d.id}`} className="card flex items-center justify-between p-4 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Stethoscope size={18} /></span>
                )}
                <div>
                  <p className="text-sm font-bold text-[#102c3a]">{d.name}</p>
                  <p className="text-xs text-[#5a7785]">{d.speciality} · {d.experience}</p>
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-[#0b8f91]">
                    <Star size={11} fill="#0b8f91" /> {d.rating} · {d.reviews} visit ratings
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#0b8f91]">{d.fee ? `₹${d.fee}` : '—'}</span>
                <p className="flex items-center justify-end gap-0.5 text-[10px] font-semibold text-[#5a7785]">Profile <ArrowRight size={10} /></p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#5a7785]">Hospital comments are from patients who have visited this campus.</p>
          {reviews.length === 0 && <p className="card p-6 text-center text-sm text-[#5a7785]">No visit reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#102c3a]">{r.patient}</p>
                <span className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} fill="#0b8f91" className="text-[#0b8f91]" />)}</span>
              </div>
              <p className="mt-1.5 text-xs text-[#5a7785]">{r.text}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-green-700"><CheckCircle2 size={11} /> Verified visit · {r.visitedOn}</p>
            </div>
          ))}
        </div>
      )}

      <Link to={`/book/${h.id}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3.5 text-sm font-bold text-white">
        <Calendar size={16} /> Book Appointment
      </Link>
    </div>
  );
}
