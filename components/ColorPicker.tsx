'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  color: string; // hex
  onChange: (hex: string) => void;
  className?: string;
}

// Convert HSB/HSV to Hex
function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert Hex to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return { h: 220, s: 80, v: 90 };

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (max !== min) {
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
    h *= 60;
  }

  return { h, s, v };
}

const QUICK_PRESETS = [
  '#2563eb', // Cobalt Blue
  '#059669', // Emerald
  '#7c3aed', // Violet
  '#e11d48', // Crimson Rose
  '#d97706', // Amber Sunset
  '#0284c7', // Cyan
  '#db2777', // Magenta
  '#18181b', // Onyx
];

export default function ColorPicker({ color, onChange, className = '' }: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color || '#2563eb'));
  const [hexInput, setHexInput] = useState(color || '#2563eb');
  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);

  useEffect(() => {
    if (color) {
      setHexInput(color);
      setHsv(hexToHsv(color));
    }
  }, [color]);

  const updateColorFromHsv = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      setHsv(newHsv);
      const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
      setHexInput(newHex);
      onChange(newHex);
    },
    [onChange]
  );

  const handleSatValMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;

      updateColorFromHsv({ ...hsv, s, v });
    },
    [hsv, updateColorFromHsv]
  );

  // Mouse & Touch events for 2D Saturation/Value Box
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingSatVal.current = true;
    handleSatValMove(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingSatVal.current) {
        handleSatValMove(moveEvent.clientX, moveEvent.clientY);
      }
    };
    const onMouseUp = () => {
      isDraggingSatVal.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingSatVal.current = true;
    if (e.touches[0]) {
      handleSatValMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (isDraggingSatVal.current && moveEvent.touches[0]) {
        handleSatValMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      isDraggingSatVal.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseFloat(e.target.value);
    updateColorFromHsv({ ...hsv, h });
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#?([0-9A-F]{3}){1,2}$/i.test(val)) {
      const formatted = val.startsWith('#') ? val : `#${val}`;
      setHsv(hexToHsv(formatted));
      onChange(formatted);
    }
  };

  const pureHueHex = hsvToHex(hsv.h, 100, 100);

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* 2D Photoshop-style Saturation & Brightness Gradient Plane with Cursor */}
      <div
        ref={satValRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative w-full h-40 rounded-2xl cursor-crosshair overflow-hidden shadow-inner border border-white/20 select-none touch-none"
        style={{
          backgroundColor: pureHueHex,
        }}
      >
        {/* Horizontal White to Transparent (Saturation) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #ffffff, transparent)',
          }}
        />
        {/* Vertical Transparent to Black (Value/Brightness) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #000000, transparent)',
          }}
        />

        {/* Circular Pointer / Cursor */}
        <div
          className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] pointer-events-none transition-transform"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: hexInput.startsWith('#') ? hexInput : `#${hexInput}`,
          }}
        />
      </div>

      {/* Hue Rainbow Slider + Preview Box + Hex Input */}
      <div className="space-y-2.5">
        {/* Rainbow Hue Track Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={hsv.h}
            onChange={handleHueChange}
            className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none shadow-inner"
            style={{
              background:
                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
          />
        </div>

        {/* Live Preview Swatch + Hex Input Row */}
        <div className="flex items-center gap-2.5">
          {/* Preview Box */}
          <div
            className="w-10 h-10 rounded-xl border border-white/20 shadow-md flex-shrink-0 relative overflow-hidden"
            style={{ backgroundColor: hexInput.startsWith('#') ? hexInput : `#${hexInput}` }}
          >
            {/* Native system eye-dropper fallback */}
            <input
              type="color"
              value={hexInput.startsWith('#') ? hexInput : `#${hexInput}`}
              onChange={(e) => {
                const val = e.target.value;
                setHexInput(val);
                setHsv(hexToHsv(val));
                onChange(val);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Pick native color"
            />
          </div>

          {/* Hex Input */}
          <div className="flex-1 liquid-control rounded-xl px-3 py-2 flex items-center gap-1.5 font-mono text-xs">
            <span className="opacity-40">HEX</span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#2563eb"
              className="bg-transparent font-mono uppercase text-xs w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Swatches Row */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setHexInput(p);
                setHsv(hexToHsv(p));
                onChange(p);
              }}
              className={`w-6 h-6 rounded-lg border border-white/20 flex-shrink-0 transition-transform active:scale-90 ${
                hexInput.toLowerCase() === p.toLowerCase() ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: p }}
              title={p}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
