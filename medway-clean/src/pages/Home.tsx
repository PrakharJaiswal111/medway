import { Link, useNavigate } from 'react-router-dom';
import { Search, Stethoscope, Building2, Cross, MapPin, Siren, Sparkles, GitCompare, Star, Clock, Phone, ArrowRight, SlidersHorizontal, X, ShieldCheck, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDoctors, useHospitals, type Doctor, type Hospital } from '@/lib/data';

const chips = [
  { label: 'Doctor', icon: Stethoscope },
  { label: 'Hospital', icon: Building2 },
  { label: 'Speciality', icon: Cross },
  { label: 'Nearby', icon: MapPin },
];

const allDepts = ['General Medicine','Cardiology','Orthopaedics','Dermatology','Paediatrics','Gynaecology','Neonatology','Neurology','Oncology','Gastroenterology','ENT','Surgery','Emergency Care','Neurosciences','Ophthalmology','Pulmonology','Nephrology','Urology','Psychiatry','Endocrinology','Dental','Radiology','Occupational Health'];

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState('Nearby');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDist, setMaxDist] = useState(15);
  const [maxWait, setMaxWait] = useState(60);
  const [minRating, setMinRating] = useState(0);
  const [dept, setDept] = useState('All');
  const { hospitals, loading } = useHospitals();
  const { doctors } = useDoctors();

  const filtered = useMemo(() => {
    let list = [...hospitals];
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(t) || h.type.toLowerCase().includes(t) || h.area.toLowerCase().includes(t) || h.departments.some((d) => d.toLowerCase().includes(t)));
    }
    list = list.filter((h) => h.distance_value <= maxDist && h.wait_value <= maxWait && h.rating >= minRating);
    if (dept !== 'All') list = list.filter((h) => h.departments.includes(dept));
    if (active === 'Nearby') list.sort((a, b) => a.distance_value - b.distance_value);
    else if (active === 'Hospital') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (active === 'Speciality') list.sort((a, b) => b.departments.length - a.departments.length);
    return list;
  }, [hospitals, q, active, maxDist, maxWait, minRating, dept]);

  const doctorResults = useMemo(() => {
    let list = [...doctors];
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(t) || d.speciality.toLowerCase().includes(t) || d.bio.toLowerCase().includes(t));
    }
    if (dept !== 'All') list = list.filter((d) => d.speciality === dept);
    list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [doctors, q, dept]);

  const filterCount = (maxDist < 15 ? 1 : 0) + (maxWait < 60 ? 1 : 0) + (minRating > 0 ? 1 : 0) + (dept !== 'All' ? 1 : 0);

  return (
    <div className="flex flex-col gap-7">
      <section className="hero-panel flex items-end p-5 text-white md:p-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <ShieldCheck size={14} /> Verified care network
          </span>
          <h1 className="display mt-4 text-3xl font-extrabold md:text-5xl">Find the right healthcare, near you</h1>
          <p className="mt-3 max-w-xl text-sm font-medium text-white/85 md:text-base">Search trusted doctors, compare hospitals, and book appointments around Durgapur in seconds.</p>
          <div className="mt-5 grid max-w-xl grid-cols-3 gap-2">
            <div className="hero-stat rounded-2xl px-3 py-2">
              <p className="display text-lg font-extrabold">24/7</p>
              <p className="text-[10px] font-semibold text-white/75">Emergency</p>
            </div>
            <div className="hero-stat rounded-2xl px-3 py-2">
              <p className="display text-lg font-extrabold">{hospitals.length}+</p>
              <p className="text-[10px] font-semibold text-white/75">Hospitals</p>
            </div>
            <div className="hero-stat rounded-2xl px-3 py-2">
              <p className="display text-lg font-extrabold">{doctors.length}+</p>
              <p className="text-[10px] font-semibold text-white/75">Doctors</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card soft-shadow -mt-3 p-4 md:p-5">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#dcebed] bg-white px-4 py-3 shadow-sm">
            <Search size={20} className="text-[#0b8f91]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors, hospitals, specialities…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ab3bb]" />
          </div>
          <button onClick={() => setShowFilters(true)} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#dcebed] bg-white text-[#5a7785] shadow-sm transition-colors hover:border-[#0b8f91] hover:text-[#0b8f91]">
            <SlidersHorizontal size={18} />
            {filterCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#0b8f91] text-[9px] font-bold text-white">{filterCount}</span>}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => setActive(label)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active === label ? 'brand-mark border-transparent text-white shadow-sm' : 'border-[#dcebed] bg-white text-[#5a7785] hover:border-[#0b8f91] hover:text-[#0b8f91]'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <button onClick={() => nav('/emergency')} className="card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500"><Siren size={20} /></span>
          <span className="text-xs font-bold text-[#102c3a]">Emergency Care</span>
        </button>
        <button onClick={() => nav('/ai-navigator')} className="card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Sparkles size={20} /></span>
          <span className="text-xs font-bold text-[#102c3a]">AI Analyser</span>
        </button>
        <button onClick={() => nav('/compare')} className="card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-50 text-amber-500"><GitCompare size={20} /></span>
          <span className="text-xs font-bold text-[#102c3a]">Compare</span>
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="display text-lg font-bold text-[#102c3a]">{active === 'Doctor' ? 'Doctors near Durgapur' : (q || filterCount > 0 ? 'Search results' : 'Hospitals near Durgapur')}</h2>
          <span className="text-xs font-semibold text-[#0b8f91]">{active === 'Doctor' ? `${doctorResults.length} doctors` : `${filtered.length} hospitals`}</span>
        </div>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="card h-56 animate-pulse bg-[#f3f9fa]" />)}
          </div>
        ) : active === 'Doctor' ? (
          doctorResults.length === 0 ? (
            <div className="card p-10 text-center text-sm text-[#5a7785]">No doctors match your search.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doctorResults.map((d) => <DoctorCard key={d.id} d={d} hospitals={hospitals} />)}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center text-sm text-[#5a7785]">
            <Search size={28} className="mx-auto mb-3 text-[#b9cdd2]" />
            No hospitals match your search. Try adjusting filters.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => (
              <HospitalCard key={h.id} h={h} />
            ))}
          </div>
        )}
      </section>

      <section className="card flex items-center justify-between gap-4 bg-[#0b8f91] p-5 text-white">
        <div>
          <p className="display text-base font-bold">Talk to our AI Analyser</p>
          <p className="text-xs text-white/80">Describe your symptoms and get instant care guidance.</p>
        </div>
        <button onClick={() => nav('/ai-navigator')} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0b8f91]">Try now <Phone size={12} /></button>
      </section>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
          <div className="relative w-full rounded-t-3xl bg-white p-6 md:max-w-md md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="display text-lg font-extrabold text-[#102c3a]">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#eef6f7]"><X size={18} className="text-[#5a7785]" /></button>
            </div>
            <div className="flex flex-col gap-5">
              <FilterSlider label="Max distance" value={maxDist} min={1} max={15} unit=" km" onChange={setMaxDist} />
              <FilterSlider label="Max wait time" value={maxWait} min={5} max={60} unit=" min" onChange={setMaxWait} />
              <div>
                <p className="mb-2 text-sm font-bold text-[#102c3a]">Minimum rating</p>
                <div className="flex gap-2">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${minRating === r ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785]'}`}>
                      {r === 0 ? 'Any' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-[#102c3a]">Department</p>
                <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full rounded-xl border border-[#dcebed] bg-white px-3 py-2.5 text-sm font-semibold text-[#102c3a] outline-none focus:border-[#0b8f91]">
                  <option value="All">All departments</option>
                  {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setMaxDist(15); setMaxWait(60); setMinRating(0); setDept('All'); }} className="flex-1 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#5a7785]">Reset</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white">Show {filtered.length} results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-bold text-[#102c3a]">{label}</p>
        <span className="text-sm font-bold text-[#0b8f91]">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#0b8f91]" />
    </div>
  );
}

function DoctorCard({ d, hospitals }: { d: Doctor; hospitals: Hospital[] }) {
  const hospital = hospitals.find((h) => h.id === d.hospital_id);
  return (
    <Link to={`/doctor/${d.id}`} className="card overflow-hidden p-4 transition-transform hover:-translate-y-1">
      <div className="flex items-center gap-3">
        {d.image ? <img src={d.image} alt={d.name} className="h-14 w-14 rounded-2xl object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6f5f5] text-[#0b8f91]"><Stethoscope size={22} /></span>}
        <div>
          <p className="text-sm font-bold text-[#102c3a]">{d.name}</p>
          <p className="text-xs text-[#5a7785]">{d.speciality} · {d.experience}</p>
          <span className="mt-1 flex items-center gap-1 text-xs font-bold text-[#0b8f91]"><Star size={11} fill="#0b8f91" /> {d.rating} · {d.reviews} visit ratings</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[#5a7785]">
        <span>{hospital?.name || 'Durgapur'}</span>
        <span className="font-bold text-[#0b8f91]">{d.fee ? `₹${d.fee}` : 'Emergency'}</span>
      </div>
    </Link>
  );
}

function HospitalCard({ h }: { h: Hospital }) {
  return (
    <Link to={`/hospital/${h.id}`} className="card overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative h-28 w-full overflow-hidden">
        {h.image ? (
          <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${h.accent}, #0b8f91)` }} />
        )}
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur ${h.opd === 'Open' ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>{h.opd}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-[#102c3a]">{h.name}</p>
            <p className="text-xs text-[#5a7785]">{h.type} · {h.area}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#e6f5f5] px-2 py-0.5 text-xs font-bold text-[#0b8f91]"><Star size={12} fill="#0b8f91" /> {h.rating}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-[#5a7785]">
          <span className="flex items-center gap-1"><MapPin size={12} /> {h.distance}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {h.wait}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5a7785]">{h.departments.length} depts</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#0b8f91]">View <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  );
}
