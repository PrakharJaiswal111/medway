import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Home, Sparkles, GitCompare, FolderOpen, User, Heart, FileText, HelpCircle, Settings, LogOut, ChevronRight, Calendar } from 'lucide-react';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const side = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/ai-navigator', label: 'AI Analyser', icon: Sparkles },
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
    { to: '/documents', label: 'Documents', icon: FolderOpen },
    { to: '/profile', label: 'Profile', icon: User },
  ];
  return (
    <div className="shell">
      {/* Top bar */}
      <header className="glass-nav sticky top-0 z-30 border-b border-white/70 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl text-white">
              <Heart size={18} strokeWidth={2.5} />
            </span>
            <span className="display text-lg font-extrabold text-[#102c3a]">MedWay</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <button onClick={() => nav('/profile')} className="grid h-9 w-9 place-items-center rounded-full text-[#5a7785] transition-colors hover:bg-white hover:text-[#0b8f91]">
              <HelpCircle size={20} />
            </button>
            <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-[#5a7785] transition-colors hover:bg-white hover:text-[#0b8f91] md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop side nav */}
      <aside className="glass-nav fixed left-0 top-0 z-30 hidden h-screen w-[248px] flex-col border-r border-white/70 px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl text-white">
            <Heart size={18} strokeWidth={2.5} />
          </span>
          <span className="display text-lg font-extrabold text-[#102c3a]">MedWay</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {side.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${active ? 'bg-white text-[#0b8f91] shadow-sm ring-1 ring-[#dcebed]' : 'text-[#5a7785] hover:bg-white/75 hover:text-[#0b8f91]'}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/80 bg-white/65 p-4 text-xs text-[#5a7785] shadow-sm">
          <p className="font-semibold text-[#102c3a]">Need help?</p>
          <p className="mt-1">Call 102 for emergency medical assistance.</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-white/95 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="display text-lg font-extrabold text-[#102c3a]">Menu</span>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#eef6f7]">
                <X size={20} className="text-[#5a7785]" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              {side.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#102c3a] hover:bg-[#f3f9fa]">
                  <span className="flex items-center gap-3"><Icon size={18} className="text-[#0b8f91]" /> {label}</span>
                  <ChevronRight size={16} className="text-[#b9cdd2]" />
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-[#e3eef0] pt-4 text-sm text-[#5a7785]">
              <p className="flex items-center gap-2 py-2"><Settings size={16} /> Settings</p>
              <p className="flex items-center gap-2 py-2"><FileText size={16} /> About MedWay</p>
              <p className="flex items-center gap-2 py-2"><LogOut size={16} /> Log out</p>
            </div>
          </div>
        </div>
      )}

      <main className="content fade-in" key={loc.pathname}>{children}</main>
    </div>
  );
}
