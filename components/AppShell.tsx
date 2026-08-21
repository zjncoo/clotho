'use client';

import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-full min-h-[100dvh]">
      {children}
    </div>
  );
}
