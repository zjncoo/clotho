'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Shirt, Sparkles, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-4 z-50 max-w-4xl mx-auto px-4">
      <nav className="liquid-glass rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-full liquid-control flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
            <span>Archivio</span>
          </Link>

          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
            <Link
              href="/"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                pathname === '/'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Catalogo
            </Link>
            <Link
              href="/create"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                pathname === '/create'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Create</span>
            </Link>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Cambia tema"
          className="w-9 h-9 rounded-full liquid-control flex items-center justify-center text-neutral-700 dark:text-neutral-200"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>
    </header>
  );
}
