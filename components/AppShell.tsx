'use client';

import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Luxury Light Reflection / Shimmer Sweep on entrance */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.03] dark:via-white/[0.06] to-transparent transform -rotate-12 animate-shimmer-sweep" />

      {children}
    </div>
  );
}
