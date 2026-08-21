/**
 * Mathematical Color Harmony Engine
 * Computes deterministic, high-fashion color harmonies, tints, and contrast metrics
 * based on user's theme accent color.
 */

export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function hexToHsl(hex: string): HSL {
  const { r: rRaw, g: gRaw, b: bRaw } = hexToRgb(hex);
  const r = rRaw / 255;
  const g = gRaw / 255;
  const b = bRaw / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Calculates luminance for contrast
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastColor(hex: string): '#09090b' | '#ffffff' {
  return getLuminance(hex) > 0.4 ? '#09090b' : '#ffffff';
}

export interface StepHarmony {
  stepIndex: number;
  name: string;
  bgHex: string;
  cardHex: string;
  borderHex: string;
  accentHex: string;
  textColor: '#09090b' | '#ffffff';
  mutedTextColor: string;
}

export interface HarmonicSuite {
  steps: StepHarmony[];
  categoryBlocks: Record<string, string>;
}

/**
 * Generates the full 5-step mathematical color progression based on user theme accent
 */
export function generateHarmonicSuite(themeHex: string, isDark: boolean): HarmonicSuite {
  const hsl = hexToHsl(themeHex);

  // If theme is neutral/monochrome, default hue to warm terracotta/editorial golden tone
  const baseH = hsl.s < 10 ? 25 : hsl.h;
  const baseS = hsl.s < 10 ? 60 : hsl.s;

  const stepsData = [
    {
      name: 'Capture & Auto-Cut',
      hueShift: 0,
      lightSat: baseS * 0.45,
      lightLum: 94,
      darkSat: baseS * 0.35,
      darkLum: 13,
    },
    {
      name: 'Identity & Category',
      hueShift: 38, // Analogous Shift
      lightSat: baseS * 0.5,
      lightLum: 92,
      darkSat: baseS * 0.38,
      darkLum: 15,
    },
    {
      name: 'Tonal Palette',
      hueShift: 135, // Triadic / Complementary Shift
      lightSat: baseS * 0.48,
      lightLum: 93,
      darkSat: baseS * 0.36,
      darkLum: 14,
    },
    {
      name: 'Brand & Fabric',
      hueShift: 215, // Split Complementary
      lightSat: baseS * 0.42,
      lightLum: 91,
      darkSat: baseS * 0.32,
      darkLum: 16,
    },
    {
      name: 'Runway Confirmation',
      hueShift: 15, // Saturated Harmonic
      lightSat: Math.min(95, baseS * 0.9 + 15),
      lightLum: 48, // Bold Hero accent
      darkSat: Math.min(95, baseS * 0.85 + 10),
      darkLum: 38,
    },
  ];

  const steps: StepHarmony[] = stepsData.map((d, idx) => {
    const h = (baseH + d.hueShift) % 360;
    const s = isDark ? d.darkSat : d.lightSat;
    const l = isDark ? d.darkLum : d.lightLum;

    const bgHex = hslToHex(h, s, l);
    const cardHex = isDark
      ? hslToHex(h, s * 0.9, l + 6)
      : hslToHex(h, s * 0.6, l + 4);
    const borderHex = isDark
      ? hslToHex(h, s * 0.8, l + 14)
      : hslToHex(h, s * 0.7, l - 12);
    const accentHex = hslToHex(h, Math.min(95, baseS + 20), isDark ? 65 : 48);

    const textColor = getContrastColor(bgHex);
    const mutedTextColor =
      textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(9, 9, 11, 0.65)';

    return {
      stepIndex: idx + 1,
      name: d.name,
      bgHex,
      cardHex,
      borderHex,
      accentHex,
      textColor,
      mutedTextColor,
    };
  });

  // Category Color Blocks (Like the colorful stacked cards in the reference!)
  const categoryBlocks: Record<string, string> = {
    'headwear': hslToHex((baseH + 200) % 360, isDark ? 45 : 55, isDark ? 22 : 88),
    'tops': hslToHex((baseH + 30) % 360, isDark ? 55 : 75, isDark ? 26 : 89),
    'bottoms': hslToHex((baseH + 90) % 360, isDark ? 40 : 50, isDark ? 20 : 87),
    'shoes': hslToHex((baseH + 320) % 360, isDark ? 50 : 65, isDark ? 24 : 88),
    'bags': hslToHex((baseH + 160) % 360, isDark ? 45 : 55, isDark ? 21 : 89),
    'necklaces': hslToHex((baseH + 60) % 360, isDark ? 50 : 65, isDark ? 25 : 90),
    'bracelets': hslToHex((baseH + 260) % 360, isDark ? 45 : 55, isDark ? 23 : 89),
    'accessories': hslToHex((baseH + 120) % 360, isDark ? 40 : 50, isDark ? 20 : 88),
  };

  return {
    steps,
    categoryBlocks,
  };
}
