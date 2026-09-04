import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sparkles, Send, ArrowRight, Activity, AlertTriangle, Star, MapPin, Clock, Loader2 } from 'lucide-react';
import { useHospitals, type Hospital } from '@/lib/data';

const rules: { keys: string[]; category: string; urgency: 'Low' | 'Medium' | 'High' }[] = [
  { keys: ['chest', 'breath', 'unconscious', 'bleeding', 'stroke'], category: 'Emergency Care', urgency: 'High' },
  { keys: ['fever', 'cough', 'cold', 'flu', 'sore throat'], category: 'General Medicine', urgency: 'Medium' },
  { keys: ['abdominal', 'vomit', 'nausea', 'stomach', 'diarrhea'], category: 'Gastroenterology', urgency: 'High' },
  { keys: ['bone', 'fracture', 'joint', 'knee', 'back'], category: 'Orthopaedics', urgency: 'Medium' },
  { keys: ['skin', 'rash', 'acne', 'itch'], category: 'Dermatology', urgency: 'Low' },
  { keys: ['heart', 'palpitation', 'bp', 'pressure'], category: 'Cardiology', urgency: 'High' },
  { keys: ['child', 'kid', 'infant', 'baby'], category: 'Paediatrics', urgency: 'Medium' },
  { keys: ['eye', 'vision', 'cataract', 'retina'], category: 'Ophthalmology', urgency: 'Medium' },
  { keys: ['kidney', 'urine', 'dialysis'], category: 'Nephrology', urgency: 'High' },
  { keys: ['thyroid', 'diabetes', 'sugar', 'hormone'], category: 'Endocrinology', urgency: 'Medium' },
  { keys: ['anxiety', 'depression', 'sleep', 'mental'], category: 'Psychiatry', urgency: 'Medium' },
  { keys: ['ear', 'nose', 'throat', 'sinus', 'hearing'], category: 'ENT', urgency: 'Low' },
];

function analyse(text: string) {
  const t = text.toLowerCase();
  for (const r of rules) {
    if (r.keys.some((k) => t.includes(k))) return r;
  }
  return { category: 'General Medicine', urgency: 'Medium' as const };
}

export default function AINavigator() {
  const nav = useNavigate();
  const { hospitals } = useHospitals();
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ category: string; urgency: string; hospitals: Hospital[] } | null>(null);

  const [analysing, setAnalysing] = useState(false);

  const submit = () => {
    if (!text.trim() || hospitals.length === 0) return;
    setAnalysing(true);
    setTimeout(() => {
    const r = analyse(text);
    const matches = hospitals.filter((h) => h.departments.includes(r.category)).sort((a, b) => a.distance_value - b.distance_value);
    const ranked = (matches.length ? matches : hospitals).slice(0, 3);
    setResult({ category: r.category, urgency: r.urgency, hospitals: ranked });
    setAnalysing(false);
    }, 900);
  };

  const urgencyColor = (u: string) => u === 'High' ? 'bg-red-50 text-red-600' : u === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">AI Analyser</h1>
        <p className="text-sm text-[#5a7785]">Describe your symptoms and we'll guide you to the right care.</p>
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-2 rounded-2xl bg-[#f3f9fa] p-4">
          <Sparkles size={20} className="mt-0.5 text-[#0b8f91]" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. I have abdominal pain, vomiting and mild fever since last night…" className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#9ab3bb]" />
        </div>
        <button onClick={submit} disabled={analysing || !text.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-50">
          {analysing ? <><Loader2 size={15} className="animate-spin" /> Analysing…</> : <><Send size={15} /> Analyse Symptoms</>}
        </button>
      </div>

      {result && (
        <div className="flex flex-col gap-4 fade-in">
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#0b8f91]" />
              <div>
                <p className="text-xs text-[#5a7785]">Suggested care</p>
                <p className="text-sm font-bold text-[#102c3a]">{result.category}</p>
              </div>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${urgencyColor(result.urgency)}`}>
              <AlertTriangle size={12} /> {result.urgency} urgency
            </span>
          </div>

          <h2 className="display text-base font-bold text-[#102c3a]">Top recommended hospitals</h2>
          {result.hospitals.map((h, i) => (
            <div key={h.id} className="card overflow-hidden p-0">
              {h.image && <img src={h.image} alt={h.name} className="h-24 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0b8f91] text-xs font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-[#102c3a]">{h.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[#5a7785]">
                        <span className="flex items-center gap-0.5"><Star size={11} fill="#0b8f91" className="text-[#0b8f91]" /> {h.rating}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={11} /> {h.distance}</span>
                        <span className="flex items-center gap-0.5"><Clock size={11} /> {h.wait}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => nav(`/hospital/${h.id}`)} className="flex items-center gap-1 text-xs font-bold text-[#0b8f91]">View <ArrowRight size={12} /></button>
                </div>
                <p className="mt-3 rounded-xl bg-[#f3f9fa] p-2.5 text-xs text-[#5a7785]">
                  {i === 0 ? `Closest hospital with ${result.category} — only ${h.distance} away and rated ${h.rating}/5.` :
                    i === 1 ? `Strong match for ${result.category}; shorter wait time (${h.wait}) and good availability.` :
                    `Reliable alternative with ${h.departments.length} departments and ${h.reviews}+ patient reviews.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
