import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Stethoscope, Building2, Sparkles, GitCompare, ChevronRight, Settings, LogOut, FileText, MessageSquare, Flag, Heart, X, User, Bell, Shield, Globe, Moon, Check, Calendar, Camera, CreditCard, Trash2 } from 'lucide-react';

const links = [
  { to: '/ai-navigator', label: 'AI Analyser', icon: Sparkles },
  { to: '/compare', label: 'Compare Hospitals', icon: GitCompare },
  { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
  { to: '/documents', label: 'Medical Documents', icon: FileText },
  { to: '/', label: 'Find Doctors', icon: Stethoscope },
  { to: '/', label: 'Find Hospitals', icon: Building2 },
];

type ModalType = 'feedback' | 'about' | 'report' | 'settings' | 'logout' | 'edit' | null;
const PROFILE_PHOTO_KEY = 'medway_profile_photo';

export default function Profile() {
  const nav = useNavigate();
  const [modal, setModal] = useState<ModalType>(null);
  const [name, setName] = useState('Aarav Menon');
  const [email, setEmail] = useState('aarav.menon@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [photo, setPhoto] = useState(() => localStorage.getItem(PROFILE_PHOTO_KEY) || '');
  const [feedback, setFeedback] = useState('');
  const [report, setReport] = useState('');
  const [notif, setNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);
  const [saved, setSaved] = useState(false);

  const close = () => { setModal(null); setSaved(false); };
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const changePhoto = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === 'string' ? reader.result : '';
      setPhoto(next);
      localStorage.setItem(PROFILE_PHOTO_KEY, next);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto('');
    localStorage.removeItem(PROFILE_PHOTO_KEY);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="card flex items-center gap-4 p-5">
        <div className="relative h-16 w-16 shrink-0">
          {photo ? (
            <img src={photo} alt={name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e6f5f5] text-xl font-extrabold text-[#0b8f91]">{initials}</span>
          )}
          <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#0b8f91] text-white shadow-sm">
            <Camera size={14} />
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => changePhoto(e.target.files?.[0])} />
          </label>
        </div>
        <div className="flex-1">
          <h1 className="display text-lg font-extrabold text-[#102c3a]">{name}</h1>
          <p className="text-xs text-[#5a7785]">{email}</p>
          <p className="text-xs text-[#5a7785]">{phone}</p>
          <p className="mt-1 inline-block rounded-full bg-[#e6f5f5] px-2 py-0.5 text-[10px] font-bold text-[#0b8f91]">Mock user</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setModal('edit')} className="rounded-full border border-[#dcebed] px-3 py-1.5 text-xs font-bold text-[#5a7785] hover:border-[#0b8f91] hover:text-[#0b8f91]">Edit</button>
          {photo && (
            <button onClick={removePhoto} className="grid h-8 w-8 place-items-center self-end rounded-full border border-[#dcebed] text-[#5a7785] hover:border-red-200 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-[#fff7ed] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#c2410c]">Government Health Card</p>
              <h2 className="display mt-1 text-lg font-extrabold text-[#102c3a]">Ayushman Bharat PM-JAY</h2>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0b8f91]"><CreditCard size={20} /></span>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#5a7785]">Beneficiary</p>
              <p className="text-sm font-extrabold text-[#102c3a]">{name}</p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600">Verified sample</span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <CardField label="ABHA ID" value="91-2847-6632-1045" />
            <CardField label="PM-JAY ID" value="PMJAY-WB-4829-1184" />
            <CardField label="Family ID" value="FAM-KOL-2048" />
            <CardField label="Coverage" value="Rs 5,00,000 per family" />
            <CardField label="State" value="West Bengal" />
            <CardField label="Valid Through" value="31 Mar 2027" />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f3f9fa] p-3 text-xs font-semibold text-[#5a7785]">
            <Shield size={16} className="shrink-0 text-[#0b8f91]" /> Dummy card for demo profile only.
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-2 text-sm font-bold text-[#102c3a]">Quick links</p>
        <div className="flex flex-col">
          {links.map(({ to, label, icon: Icon }, i) => (
            <Link key={i} to={to} className="flex items-center justify-between border-b border-[#eef3f4] py-3 text-sm font-semibold text-[#102c3a] last:border-0">
              <span className="flex items-center gap-3"><Icon size={17} className="text-[#0b8f91]" /> {label}</span>
              <ChevronRight size={16} className="text-[#b9cdd2]" />
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-2 text-sm font-bold text-[#102c3a]">More</p>
        <div className="flex flex-col">
          {([
            { label: 'Feedback', icon: MessageSquare, action: () => setModal('feedback') },
            { label: 'About MedWay', icon: FileText, action: () => setModal('about') },
            { label: 'Report a Problem', icon: Flag, action: () => setModal('report') },
            { label: 'Settings', icon: Settings, action: () => setModal('settings') },
            { label: 'Log Out', icon: LogOut, action: () => setModal('logout') },
          ] as const).map(({ label, icon: Icon, action }, i) => (
            <button key={i} onClick={action} className="flex items-center gap-3 border-b border-[#eef3f4] py-3 text-sm font-semibold text-[#5a7785] last:border-0 hover:text-[#0b8f91]">
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-[#b9cdd2]">
        <Heart size={12} className="text-[#0b8f91]" /> MedWay · v1.0 · Demo build
      </p>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/30" onClick={close} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="display text-lg font-extrabold text-[#102c3a]">
                {modal === 'edit' && 'Edit Profile'}
                {modal === 'feedback' && 'Send Feedback'}
                {modal === 'about' && 'About MedWay'}
                {modal === 'report' && 'Report a Problem'}
                {modal === 'settings' && 'Settings'}
                {modal === 'logout' && 'Log Out'}
              </h3>
              <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#eef6f7]"><X size={18} className="text-[#5a7785]" /></button>
            </div>

            {modal === 'edit' && (
              <div className="flex flex-col gap-3">
                <Field label="Name" value={name} onChange={setName} />
                <Field label="Email" value={email} onChange={setEmail} />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <button onClick={() => { setSaved(true); setTimeout(close, 800); }} className="mt-2 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white">
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}

            {modal === 'feedback' && (
              <div className="flex flex-col gap-3">
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Tell us what you think…" className="w-full resize-none rounded-2xl bg-[#f3f9fa] p-4 text-sm outline-none placeholder:text-[#9ab3bb]" />
                <button onClick={() => { setFeedback(''); setSaved(true); setTimeout(close, 800); }} disabled={!feedback.trim()} className="rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-40">
                  {saved ? 'Sent!' : 'Submit Feedback'}
                </button>
              </div>
            )}

            {modal === 'about' && (
              <div className="flex flex-col gap-3 text-sm text-[#5a7785]">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b8f91] text-white"><Heart size={18} /></span>
                  <span className="display text-base font-extrabold text-[#102c3a]">MedWay</span>
                </div>
                <p>MedWay is an intelligent healthcare navigation app that helps you find the right doctors and hospitals near you, compare options, and book appointments — all in one place.</p>
                <p className="text-xs">Version 1.0 · Built with React, Vite & Supabase</p>
              </div>
            )}

            {modal === 'report' && (
              <div className="flex flex-col gap-3">
                <textarea value={report} onChange={(e) => setReport(e.target.value)} rows={4} placeholder="Describe the issue you encountered…" className="w-full resize-none rounded-2xl bg-[#f3f9fa] p-4 text-sm outline-none placeholder:text-[#9ab3bb]" />
                <button onClick={() => { setReport(''); setSaved(true); setTimeout(close, 800); }} disabled={!report.trim()} className="rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white disabled:opacity-40">
                  {saved ? 'Reported!' : 'Submit Report'}
                </button>
              </div>
            )}

            {modal === 'settings' && (
              <div className="flex flex-col gap-1">
                <ToggleRow icon={Bell} label="Notifications" value={notif} onChange={setNotif} />
                <ToggleRow icon={Moon} label="Dark mode" value={darkMode} onChange={setDarkMode} />
                <ToggleRow icon={Globe} label="Location services" value={location} onChange={setLocation} />
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f3f9fa] p-3 text-xs text-[#5a7785]">
                  <Shield size={16} className="text-[#0b8f91]" /> Your data is stored securely in your Supabase database.
                </div>
              </div>
            )}

            {modal === 'logout' && (
              <div className="flex flex-col gap-4 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500"><LogOut size={26} /></span>
                <p className="text-sm text-[#5a7785]">Are you sure you want to log out? You can log back in anytime.</p>
                <div className="flex gap-3">
                  <button onClick={close} className="flex-1 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#5a7785]">Cancel</button>
                  <button onClick={() => { close(); nav('/'); }} className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white">Log Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-[#5a7785]">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-[#dcebed] bg-white px-4 py-2.5 text-sm font-semibold text-[#102c3a] outline-none focus:border-[#0b8f91]" />
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef3f4] bg-white px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#7a96a3]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#102c3a]">{value}</p>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center justify-between border-b border-[#eef3f4] py-3 last:border-0">
      <span className="flex items-center gap-3 text-sm font-semibold text-[#102c3a]"><Icon size={17} className="text-[#5a7785]" /> {label}</span>
      <span className={`grid h-6 w-11 place-items-center rounded-full transition-colors ${value ? 'bg-[#0b8f91]' : 'bg-[#dcebed]'}`}>
        <span className={`h-5 w-5 rounded-full bg-white transition-transform ${value ? 'translate-x-2' : '-translate-x-2.5'}`} />
      </span>
    </button>
  );
}
