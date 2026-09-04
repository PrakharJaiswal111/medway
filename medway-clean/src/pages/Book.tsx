import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Stethoscope, Calendar, Clock, IndianRupee, User, Star } from 'lucide-react';
import { CURRENT_PATIENT, DEFAULT_SLOTS, createAppointment, useHospital, useDoctorsForHospital } from '@/lib/data';

const dates = ['Today', 'Tomorrow', 'Sat 5', 'Sun 6', 'Mon 7', 'Tue 8', 'Wed 9', 'Thu 10'];

export default function Book() {
  const { hospitalId } = useParams();
  const nav = useNavigate();
  const { hospital: h, loading } = useHospital(hospitalId);
  const { doctors: docs } = useDoctorsForHospital(hospitalId);
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState('');
  const [doc, setDoc] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedDoc = docs.find((d) => d.name === doc);
  const deptDoctors = useMemo(() => {
    const matched = dept ? docs.filter((d) => d.speciality === dept) : docs;
    return matched.length ? matched : docs;
  }, [docs, dept]);
  const slots = selectedDoc?.slots?.length ? selectedDoc.slots : DEFAULT_SLOTS;

  if (loading) return <div className="card h-64 animate-pulse bg-[#f3f9fa]" />;
  if (!h) return <p className="py-20 text-center text-[#5a7785]">Hospital not found.</p>;

  const confirm = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      const id = 'MW-' + Math.floor(1000 + Math.random() * 9000);
      const fee = selectedDoc?.fee || 600;
      await createAppointment({ id, patient: CURRENT_PATIENT, hospital_id: h.id, doctor_name: doc, department: dept, date, slot, fee });
      nav(`/confirmation/${id}`);
    } catch (e: any) {
      setErr(e.message || 'Could not book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav(-1)} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Back
      </button>
      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Book at {h.name}</h1>
        <p className="text-sm text-[#5a7785]">Step {step + 1} of 4 — {['Department', 'Doctor', 'Date', 'Time slot'][step]}</p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#0b8f91]' : 'bg-[#dcebed]'}`} />)}
      </div>

      {step === 0 && (
        <div className="card p-5">
          <p className="mb-4 text-sm font-bold text-[#102c3a]">Select Department</p>
          <div className="flex flex-wrap gap-2">
            {h.departments.map((d) => (
              <button key={d} onClick={() => { setDept(d); setDoc(''); }} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${dept === d ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785] hover:border-[#0b8f91]'}`}>
                {dept === d && <Check size={14} className="mr-1 inline" />} {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-[#102c3a]">Select Doctor</p>
          {deptDoctors.length === 0 && <p className="card p-5 text-sm text-[#5a7785]">No doctors listed for this department yet. Pick another department.</p>}
          {deptDoctors.map((d) => (
            <button key={d.id} onClick={() => { setDoc(d.name); setSlot(''); }} className={`card flex items-center gap-3 p-4 text-left ${doc === d.name ? 'ring-2 ring-[#0b8f91]' : ''}`}>
              {d.image ? <img src={d.image} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Stethoscope size={18} /></span>}
              <div className="flex-1">
                <p className="text-sm font-bold text-[#102c3a]">{d.name}</p>
                <p className="text-xs text-[#5a7785]">{d.speciality} · {d.experience}</p>
                <span className="mt-1 flex items-center gap-1 text-xs font-bold text-[#0b8f91]"><Star size={11} fill="#0b8f91" /> {d.rating} · {d.slots.length} slots</span>
              </div>
              <span className="text-sm font-bold text-[#0b8f91]">{d.fee ? `₹${d.fee}` : '—'}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="card p-5">
          <p className="mb-4 text-sm font-bold text-[#102c3a]">Select Date</p>
          <div className="flex flex-wrap gap-2">
            {dates.map((d) => (
              <button key={d} onClick={() => setDate(d)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${date === d ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785] hover:border-[#0b8f91]'}`}>
                {date === d && <Check size={14} className="mr-1 inline" />} {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-5">
          <p className="mb-4 text-sm font-bold text-[#102c3a]">Select Time slot {selectedDoc ? `for ${selectedDoc.name}` : ''}</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button key={s} onClick={() => setSlot(s)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${slot === s ? 'border-[#0b8f91] bg-[#0b8f91] text-white' : 'border-[#dcebed] text-[#5a7785] hover:border-[#0b8f91]'}`}>
                {slot === s && <Check size={14} className="mr-1 inline" />} {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && dept && doc && date && slot && (
        <div className="card p-5">
          <p className="mb-3 text-sm font-bold text-[#102c3a]">Booking Summary</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[#5a7785]"><Stethoscope size={14} /> Department</span><span className="font-semibold text-[#102c3a]">{dept}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[#5a7785]"><User size={14} /> Doctor</span><span className="font-semibold text-[#102c3a]">{doc}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[#5a7785]"><Calendar size={14} /> Date</span><span className="font-semibold text-[#102c3a]">{date}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[#5a7785]"><Clock size={14} /> Time</span><span className="font-semibold text-[#102c3a]">{slot}</span></div>
            <div className="flex items-center justify-between border-t border-[#eef3f4] pt-2"><span className="flex items-center gap-2 text-[#5a7785]"><IndianRupee size={14} /> Fee</span><span className="font-bold text-[#0b8f91]">₹{selectedDoc?.fee || 600}</span></div>
          </div>
        </div>
      )}

      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{err}</p>}

      <div className="flex gap-3">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#5a7785]">Back</button>}
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 0 && !dept) return;
              if (step === 1 && !doc) return;
              if (step === 2 && !date) return;
              setStep(step + 1);
            }}
            disabled={(step === 0 && !dept) || (step === 1 && !doc) || (step === 2 && !date)}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={confirm} disabled={!dept || !doc || !date || !slot || submitting} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-40">
            {submitting ? 'Booking…' : 'Confirm Booking'} <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
