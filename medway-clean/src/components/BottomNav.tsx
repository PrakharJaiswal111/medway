import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, GitCompare, Calendar, User } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ai-navigator', label: 'AI', icon: Sparkles },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/my-bookings', label: 'Bookings', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 border-t border-white/70 backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
          return (
            <Link key={to} to={to} className="flex flex-1 flex-col items-center gap-0.5 py-1.5">
              <span className={`grid h-7 w-7 place-items-center rounded-full transition-all ${active ? 'brand-mark text-white' : 'text-[#5a7785]'}`}>
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span className={`text-[10px] font-semibold ${active ? 'text-[#0b8f91]' : 'text-[#7a96a3]'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
