'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Shirt, Sparkles, CalendarDays } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { accent } = useTheme();

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto rounded-full px-3 py-2 flex items-center gap-1.5 sm:gap-2.5 bg-white/95 dark:bg-[#18191e]/95 border border-black/10 dark:border-white/10">
        <Link
          href="/"
          style={pathname === '/' ? { backgroundColor: accent.hex, color: '#ffffff' } : {}}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 active:scale-95 ${
            pathname === '/'
              ? 'font-bold'
              : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Wardrobe</span>
        </Link>

        <Link
          href="/create"
          style={pathname === '/create' ? { backgroundColor: accent.hex, color: '#ffffff' } : {}}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 active:scale-95 ${
            pathname === '/create'
              ? 'font-bold'
              : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio</span>
        </Link>

        <Link
          href="/calendar"
          style={pathname === '/calendar' ? { backgroundColor: accent.hex, color: '#ffffff' } : {}}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 active:scale-95 ${
            pathname === '/calendar'
              ? 'font-bold'
              : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </Link>
      </nav>
    </div>
  );
}
