'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Shirt, Sparkles, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="liquid-glass pointer-events-auto rounded-full px-4 py-2.5 flex items-center gap-3 shadow-2xl border border-white/20 dark:border-white/10">
        <Link
          href="/"
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-2 ${
            pathname === '/'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Wardrobe</span>
        </Link>

        <Link
          href="/create"
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-2 ${
            pathname === '/create'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Studio</span>
        </Link>

        <div className="w-[1px] h-5 bg-black/10 dark:bg-white/10 mx-1" />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-full liquid-control flex items-center justify-center text-neutral-700 dark:text-neutral-200"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </nav>
    </div>
  );
}
