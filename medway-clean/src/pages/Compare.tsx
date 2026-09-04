import { useState } from 'react';
import { GitCompare, Check, Star, Clock, MapPin, Building2, IndianRupee, ArrowRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHospitals, type Hospital } from '@/lib/data';

const cols = [
  { key: 'distance', label: 'Distance', icon: MapPin, get: (h: Hospital) => h.distance, sortVal: (h: Hospital) => h.distance_value, lower: true },
  { key: 'cost', label: 'Cost', icon: IndianRupee, get: (h: Hospital) => h.cost, sortVal: (h: Hospital) => h.cost.length, lower: true },
  { key: 'wait', label: 'Wait time', icon: Clock, get: (h: Hospital) => h.wait, sortVal: (h: Hospital) => h.wait_value, lower: true },
  { key: 'rating', label: 'Rating', icon: Star, get: (h: Hospital) => `${h.rating} (${h.reviews})`, sortVal: (h: Hospital) => h.rating, lower: false },
  { key: 'departments', label: 'Departments', icon: Building2, get: (h: Hospital) => h.departments.length, sortVal: (h: Hospital) => h.departments.length, lower: false },
] as const;

export default function Compare() {
  const nav = useNavigate();
  const { hospitals, loading } = useHospitals();
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'wait' | 'rating' | 'cost'>('rating');

  const chosen = hospitals.filter((h) => selected.includes(h.id));

  const toggle = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s);
  };

  const bestForCol = (colKey: string) => {
    if (chosen.length === 0) return null;
    const col = cols.find((c) => c.key === colKey);
    if (!col) return null;
    const sorted = [...chosen].sort((a, b) => col.lower ? (col.sortVal(a) - col.sortVal(b)) : (col.sortVal(b) - col.sortVal(a)));
    return sorted[0].id;
  };

  const bestOverall = (() => {
    if (chosen.length === 0) return null;
    const col = cols.find((c) => c.key === sortBy);
    if (!col) return null;
    const sorted = [...chosen].sort((a, b) => col.lower ? (col.sortVal(a) - col.sortVal(b)) : (col.sortVal(b) - col.sortVal(a)));
    return sorted[0];
  })();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Compare Hospitals</h1>
        <p className="text-sm text-[#5a7785]">Select up to 3 hospitals and sort by what matters most.</p>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-bold text-[#102c3a]">Choose hospitals</p>
        {loading ? (
          <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-8 w-32 animate-pulse rounded-full bg-[#f3f9fa]" />)}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hospitals.map((h) => {
              const on = selected.includes(h.id);
              return (
                <button key={h.id} onClick={() => toggle(h.id)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${on ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785] hover:border-[#0b8f91]'}`}>
                  {on ? <Check size={12} /> : null} {h.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {chosen.length >= 2 && (
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[#102c3a]"><GitCompare size={16} className="text-[#0b8f91]" /> Sort by</span>
          {([['rating', 'Best rated'], ['distance', 'Nearest'], ['wait', 'Shortest wait'], ['cost', 'Lowest cost']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${sortBy === key ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785] hover:border-[#0b8f91]'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {bestOverall && (
        <div className="card flex items-center gap-3 bg-[#e6f5f5] p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0b8f91] text-white"><Trophy size={18} /></span>
          <div className="flex-1">
            <p className="text-xs text-[#5a7785]">Best match by {sortBy}</p>
            <p className="text-sm font-bold text-[#102c3a]">{bestOverall.name}</p>
          </div>
          <button onClick={() => nav(`/hospital/${bestOverall.id}`)} className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#0b8f91]">View <ArrowRight size={12} /></button>
        </div>
      )}

      {chosen.length === 0 ? (
        <div className="card p-10 text-center text-sm text-[#5a7785]">
          <GitCompare size={28} className="mx-auto mb-3 text-[#b9cdd2]" />
          Select at least 2 hospitals to begin comparing.
        </div>
      ) : (
        <div className="card overflow-x-auto p-5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-28 p-3 text-left text-xs font-bold text-[#5a7785]">Attribute</th>
                {chosen.map((h) => (
                  <th key={h.id} className="p-3 text-left">
                    <div className="flex items-center gap-2">
                      {h.image && <img src={h.image} alt="" className="h-8 w-8 rounded-full object-cover" />}
                      <span className="text-sm font-bold text-[#102c3a]">{h.name}</span>
                    </div>
                    <p className="text-xs font-normal text-[#5a7785]">{h.type}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cols.map((c) => {
                const bestId = bestForCol(c.key);
                return (
                  <tr key={c.key} className="border-t border-[#eef3f4]">
                    <td className="p-3 text-xs font-bold text-[#5a7785]"><span className="flex items-center gap-1.5"><c.icon size={13} /> {c.label}</span></td>
                    {chosen.map((h) => (
                      <td key={h.id} className={`p-3 font-semibold ${bestId === h.id ? 'rounded-xl bg-[#e6f5f5] text-[#0b8f91]' : 'text-[#102c3a]'}`}>
                        {c.get(h)}{bestId === h.id && ' ✓'}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-t border-[#eef3f4]">
                <td className="p-3 text-xs font-bold text-[#5a7785]">OPD</td>
                {chosen.map((h) => (
                  <td key={h.id} className="p-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${h.opd === 'Open' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{h.opd}</span></td>
                ))}
              </tr>
              <tr className="border-t border-[#eef3f4]">
                <td className="p-3 text-xs font-bold text-[#5a7785]">Departments</td>
                {chosen.map((h) => (
                  <td key={h.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {h.departments.slice(0, 4).map((d) => <span key={d} className="rounded-full bg-[#f3f9fa] px-2 py-0.5 text-[10px] font-semibold text-[#5a7785]">{d}</span>)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
