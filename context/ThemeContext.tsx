'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface AccentPreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'blue', name: 'Cobalt Blue', hex: '#2563eb', hoverHex: '#1d4ed8' },
  { id: 'emerald', name: 'Emerald', hex: '#059669', hoverHex: '#047857' },
  { id: 'violet', name: 'Amethyst', hex: '#7c3aed', hoverHex: '#6d28d9' },
  { id: 'rose', name: 'Crimson', hex: '#e11d48', hoverHex: '#be123c' },
  { id: 'amber', name: 'Amber', hex: '#d97706', hoverHex: '#b45309' },
  { id: 'onyx', name: 'Onyx Black', hex: '#18181b', hoverHex: '#27272a' },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  accent: AccentPreset;
  setAccentId: (id: string) => void;
  setCustomAccentHex: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  accent: ACCENT_PRESETS[0],
  setAccentId: () => {},
  setCustomAccentHex: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [accent, setAccentState] = useState<AccentPreset>(ACCENT_PRESETS[0]);

  const updateCssVariables = (hex: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', hex);
    }
  };

  const updateThemeColor = (t: Theme) => {
    const color = t === 'dark' ? '#0c0d10' : '#f4f6fa';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      updateThemeColor(savedTheme);
    } else {
      setThemeState('light');
      document.documentElement.classList.remove('dark');
      updateThemeColor('light');
    }

    const customHex = localStorage.getItem('clotho_custom_accent');
    if (customHex) {
      const customPreset: AccentPreset = {
        id: 'custom',
        name: 'Custom',
        hex: customHex,
        hoverHex: customHex,
      };
      setAccentState(customPreset);
      updateCssVariables(customHex);
    } else {
      const savedAccentId = localStorage.getItem('clotho_accent_preset');
      const matched = ACCENT_PRESETS.find((a) => a.id === savedAccentId) || ACCENT_PRESETS[0];
      setAccentState(matched);
      updateCssVariables(matched.hex);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('app_theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    updateThemeColor(t);
  };

  const setAccentId = (id: string) => {
    const matched = ACCENT_PRESETS.find((a) => a.id === id) || ACCENT_PRESETS[0];
    setAccentState(matched);
    localStorage.removeItem('clotho_custom_accent');
    localStorage.setItem('clotho_accent_preset', id);
    updateCssVariables(matched.hex);
  };

  const setCustomAccentHex = (hex: string) => {
    const customPreset: AccentPreset = {
      id: 'custom',
      name: 'Custom',
      hex: hex,
      hoverHex: hex,
    };
    setAccentState(customPreset);
    localStorage.setItem('clotho_custom_accent', hex);
    updateCssVariables(hex);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, accent, setAccentId, setCustomAccentHex }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
