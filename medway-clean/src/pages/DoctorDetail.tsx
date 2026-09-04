import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, MessageSquare, Star, Stethoscope } from 'lucide-react';
import { CURRENT_PATIENT, hasVisitedDoctor, useDoctor, useDoctorReviews, useHospital } from '@/lib/data';

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < full ? '#0b8f91' : 'transparent'} className={i < full ? 'text-[#0b8f91]' : 'text-[#dcebed]'} />
      ))}
    </span>
  );
}

export default function DoctorDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { doctor: d, loading } = useDoctor(id);
  const { hospital: h } = useHospital(d?.hospital_id);
  const { reviews, add } = useDoctorReviews(d?.id);
  const visited = d ? hasVisitedDoctor(d.name) : false;
  const alreadyCommented = reviews.some((r) => r.patient === CURRENT_PATIENT);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const avg = useMemo(() => {
    if (!reviews.length) return d?.rating ?? 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews, d]);

  if (loading) return <div className="card h-64 animate-pulse bg-[#f3f9fa]" />;
  if (!d) return <p className="py-20 text-center text-[#5a7785]">Doctor not found.</p>;

  const submit = () => {
    const res = add(rating, text, d.name);
    if (!res.ok) setMsg(res.error || 'Could not post comment.');
    else {
      setText('');
      setMsg('Thanks — your visit comment is now on this profile.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav(-1)} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card p-5">
        <div className="flex items-start gap-4">
          {d.image ? (
            <img src={d.image} alt={d.name} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#e6f5f5] text-[#0b8f91]"><Stethoscope size={28} /></span>
          )}
          <div className="flex-1">
            <h1 className="display text-xl font-extrabold text-[#102c3a]">{d.name}</h1>
            <p className="text-sm font-semibold text-[#0b8f91]">{d.speciality}</p>
            <p className="text-xs text-[#5a7785]">{d.experience} · ₹{d.fee || 'Emergency'} consultation</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Stars value={avg} />
              <span className="font-bold text-[#102c3a]">{avg}</span>
              <span className="text-[#5a7785]">({reviews.length} visit comments)</span>
            </div>
          </div>
        </div>
        {h && (
          <Link to={`/hospital/${h.id}`} className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f3f9fa] px-3 py-2 text-xs font-semibold text-[#5a7785]">
            <MapPin size={14} className="text-[#0b8f91]" /> {h.name} · {h.area}
          </Link>
        )}
        {d.bio && <p className="mt-4 text-sm leading-relaxed text-[#5a7785]">{d.bio}</p>}
      </div>

      <div className="card p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#102c3a]"><Clock size={15} className="text-[#0b8f91]" /> Open slots</p>
        <div className="flex flex-wrap gap-2">
          {d.slots.map((s) => (
            <span key={s} className="rounded-full bg-[#e6f5f5] px-3 py-1.5 text-xs font-semibold text-[#0b8f91]">{s}</span>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-bold text-[#102c3a]"><MessageSquare size={15} className="text-[#0b8f91]" /> Visit comments</p>
        <p className="mb-4 text-xs text-[#5a7785]">Only patients who have actually visited {d.name.split(' ')[1] ? d.name : 'this doctor'} can rate and comment.</p>

        {reviews.length === 0 && <p className="text-sm text-[#5a7785]">No visit comments yet.</p>}
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#eef3f4] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#102c3a]">{r.patient}</p>
                <Stars value={r.rating} size={12} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#5a7785]">{r.text}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                <CheckCircle2 size={11} /> Verified visit · {r.visitedOn}
              </p>
            </div>
          ))}
        </div>

        {visited && !alreadyCommented ? (
          <div className="mt-5 border-t border-[#eef3f4] pt-4">
            <p className="mb-2 text-sm font-bold text-[#102c3a]">Share your visit</p>
            <div className="mb-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star size={22} fill={n <= rating ? '#0b8f91' : 'transparent'} className={n <= rating ? 'text-[#0b8f91]' : 'text-[#dcebed]'} />
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="How was your consultation?" className="w-full resize-none rounded-2xl bg-[#f3f9fa] p-3 text-sm outline-none" />
            <button onClick={submit} disabled={!text.trim()} className="mt-3 w-full rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-40">Post visit comment</button>
          </div>
        ) : alreadyCommented ? (
          <p className="mt-4 text-xs font-semibold text-[#0b8f91]">You already left a visit comment for this doctor.</p>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#f3f9fa] px-3 py-2 text-xs text-[#5a7785]">Book and complete a visit with this doctor to unlock rating and comments.</p>
        )}
        {msg && <p className="mt-3 text-xs font-semibold text-[#0b8f91]">{msg}</p>}
      </div>

      {h && (
        <Link to={`/book/${h.id}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3.5 text-sm font-bold text-white">
          <Calendar size={16} /> Book this doctor
        </Link>
      )}
    </div>
  );
}
