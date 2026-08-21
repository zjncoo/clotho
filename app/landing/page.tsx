'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Shirt,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sliders,
  Check,
  Share2,
  Lock,
  Download,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { COLOR_PALETTE } from '@/utils/colorPalette';

export default function LandingPage() {
  const { accent, setCustomAccentHex } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'studio' | 'privacy'>('all');
  const [previewColor, setPreviewColor] = useState('#2563eb');

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#090a0c] text-[#121316] dark:text-[#f3f4f6] font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Editorial Top Status Header */}
      <header className="border-b border-black/[0.08] dark:border-white/[0.08] px-4 sm:px-8 py-3 flex items-center justify-between text-[11px] font-mono tracking-tight uppercase">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-tighter normal-case font-sans">clotho</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="opacity-60 hidden sm:inline">Editorial Wardrobe & Studio</span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="opacity-50">v1.0 [LOCAL-FIRST]</span>
          <Link
            href="/"
            className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-85 transition-opacity"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* Main Editorial Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Sticky Editorial Column (Inspired by the Reference Portfolio) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-8 self-start space-y-8">
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[0.95] font-sans lowercase"
            >
              clotho
            </motion.h1>

            <p className="text-xs font-mono opacity-50 uppercase tracking-widest">
              Digital Wardrobe & Outfit Studio
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-black/80 dark:text-white/80 max-w-sm pt-2">
              A private, local-first digital closet built for iPhone and desktop. Automatic background
              removal, multi-palette detection, 7-slot mannequin layering, and offline iCloud sync.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-black/5 dark:bg-white/10 opacity-80">
                PWA READY
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-black/5 dark:bg-white/10 opacity-80">
                NO CLOUD TRACKING
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-black/5 dark:bg-white/10 opacity-80">
                0$ SUBSCRIPTION
              </span>
            </div>
          </div>

          {/* Sticky CTA Card */}
          <div className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="opacity-50">INSTANT ACCESS</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Browser & Home Screen
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/"
                style={{ backgroundColor: accent.hex }}
                className="py-3 px-4 rounded-2xl text-white font-semibold text-xs text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 hover:opacity-95"
              >
                <span>Open App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/create"
                className="py-3 px-4 rounded-2xl border border-black/15 dark:border-white/20 font-semibold text-xs text-center hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <span>Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            </div>

            <p className="text-[10px] font-mono opacity-40 text-center">
              Works 100% offline. Add to your iPhone Home screen via Safari.
            </p>
          </div>

          {/* Editorial Metadata Block */}
          <div className="border-t border-black/10 dark:border-white/10 pt-5 space-y-3 text-[11px] font-mono">
            <div>
              <span className="opacity-40 uppercase">Architecture:</span>
              <p className="font-semibold text-xs mt-0.5">Local-First WebAssembly & IndexedDB</p>
            </div>
            <div>
              <span className="opacity-40 uppercase">Storage:</span>
              <p className="font-semibold text-xs mt-0.5">Local Device Storage + iCloud Files</p>
            </div>
            <div>
              <span className="opacity-40 uppercase">Developer:</span>
              <a
                href="https://zinco.cc"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-xs mt-0.5 text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>zinco.cc</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Right Gallery / Showcase Columns */}
        <section className="lg:col-span-8 space-y-12">
          {/* 1. Feature Story: AI Background Removal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.03]"
          >
            <div className="flex items-center justify-between text-xs font-mono border-b border-black/5 dark:border-white/5 pb-3">
              <span className="opacity-50 font-bold uppercase tracking-wider">[01. AUTO-CUT]</span>
              <span className="opacity-40">AI BACKGROUND SEGMENTATION</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Studio cutouts right inside your browser.
              </h2>
              <p className="text-xs sm:text-sm font-mono opacity-70 leading-relaxed max-w-xl">
                Snap a photo of your shirt, jacket, or shoes. clotho processes the image on-device,
                instantly erasing background noise, detecting primary & secondary colors, and assigning
                categories.
              </p>
            </div>

            {/* Visual Demo Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                <span className="text-[10px] font-mono opacity-40 uppercase">Before & After Cutout</span>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
                  <Shirt className="w-16 h-16 opacity-30 text-blue-500" />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white backdrop-blur-md">
                    Alpha Transparent PNG
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>Isolated Garment</span>
                  <span className="text-emerald-500 font-semibold">100% On-Device</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                <span className="text-[10px] font-mono opacity-40 uppercase">Color & Tag Extraction</span>
                <div className="aspect-[4/3] rounded-xl p-4 flex flex-col justify-center gap-2 font-mono text-xs bg-black/5 dark:bg-white/5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-xs border border-black/5 dark:border-white/5">
                    <span className="opacity-60">Brand:</span>
                    <span className="font-bold">Maison Margiela</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-xs border border-black/5 dark:border-white/5">
                    <span className="opacity-60">Material:</span>
                    <span className="font-bold">Cashmere / Wool</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-xs border border-black/5 dark:border-white/5">
                    <span className="opacity-60">Detected Palette:</span>
                    <div className="flex gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-white/20" />
                      <span className="w-3.5 h-3.5 rounded-full bg-stone-300 border border-white/20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>Auto-Metadata</span>
                  <span className="opacity-50">Instant Indexing</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Feature Story: 7-Slot Outfit Studio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.03]"
          >
            <div className="flex items-center justify-between text-xs font-mono border-b border-black/5 dark:border-white/5 pb-3">
              <span className="opacity-50 font-bold uppercase tracking-wider">[02. THE MANNEQUIN]</span>
              <span className="opacity-40">7-SLOT LAYERED STUDIO</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dress, layer, and style on a live editorial silhouette.
              </h2>
              <p className="text-xs sm:text-sm font-mono opacity-70 leading-relaxed max-w-xl">
                Tap any slot on the mannequin to audition pieces from your closet. Headwear, necklaces,
                tops, bottoms, footwear, bags, and bracelets all align in real time with high-resolution
                canvas rendering.
              </p>
            </div>

            {/* Mannequin Blueprint Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              {[
                { slot: 'Headwear', desc: 'Hats, Beanies, Caps' },
                { slot: 'Necklaces', desc: 'Jewelry, Scarves' },
                { slot: 'Tops', desc: 'T-Shirts, Knitwear, Coats' },
                { slot: 'Bottoms', desc: 'Pants, Denim, Skirts' },
                { slot: 'Footwear', desc: 'Sneakers, Boots, Loafers' },
                { slot: 'Bags', desc: 'Totes, Crossbody, Backpacks' },
                { slot: 'Bracelets', desc: 'Watches, Cuffs, Rings' },
                { slot: 'High-Res Export', desc: 'Save PNG Outfit Posters' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-1"
                >
                  <span className="font-bold text-xs">{item.slot}</span>
                  <p className="text-[10px] opacity-50">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-500 hover:underline"
              >
                <span>Explore the Studio Mannequin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* 3. Feature Story: Multi-Select Filter & Color Engine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.03]"
          >
            <div className="flex items-center justify-between text-xs font-mono border-b border-black/5 dark:border-white/5 pb-3">
              <span className="opacity-50 font-bold uppercase tracking-wider">[03. DISCOVERY]</span>
              <span className="opacity-40">MULTI-SELECT COLOR & BRAND FILTER</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Filter by multiple colors, brand labels, and 32 materials.
              </h2>
              <p className="text-xs sm:text-sm font-mono opacity-70 leading-relaxed max-w-xl">
                Combine complex wardrobe filters with an expandable color drawer. Pick multiple shades
                simultaneously, filter by brand collections, and browse alphabetized materials.
              </p>
            </div>

            {/* Color Swatch Interactive Showcase */}
            <div className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="opacity-50">Interactive Color Palette Swatches:</span>
                <span className="font-semibold">{COLOR_PALETTE.length} Standard Hues</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PALETTE.slice(0, 14).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setPreviewColor(c.hex);
                      setCustomAccentHex(c.hex);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-[10px] font-mono flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all bg-white dark:bg-neutral-900"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 4. Feature Story: 100% Offline & iCloud Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.03]"
          >
            <div className="flex items-center justify-between text-xs font-mono border-b border-black/5 dark:border-white/5 pb-3">
              <span className="opacity-50 font-bold uppercase tracking-wider">[04. SOVEREIGNTY]</span>
              <span className="opacity-40">100% PRIVATE & ICLOUD READY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Your wardrobe is yours.</h3>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  No remote database, no tracking cookies, no accounts. All wardrobe data is saved
                  locally in your phone’s memory.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Seamless iCloud Sync.</h3>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  Use "Save to Files" to export a clean JSON snapshot into your iCloud Drive. Open it
                  instantly on any new iPhone or computer.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Editorial Call to Action */}
          <div className="rounded-[3rem] p-8 sm:p-12 text-center space-y-6 bg-black text-white dark:bg-white dark:text-black shadow-2xl">
            <span className="text-xs font-mono uppercase tracking-widest opacity-60">
              Start Organizing Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-xl mx-auto leading-tight">
              A smarter, more intentional digital wardrobe.
            </h2>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                style={{ backgroundColor: accent.hex }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all"
              >
                Launch clotho WebApp
              </Link>
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/20 dark:border-black/20 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
              >
                Try Outfit Studio
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Minimal Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] px-4 sm:px-8 py-8 text-[11px] font-mono opacity-60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs tracking-tighter normal-case font-sans">clotho</span>
          <span>© 2026 — Creative Studio</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:underline">Wardrobe</Link>
          <Link href="/create" className="hover:underline">Studio</Link>
          <a href="https://zinco.cc" target="_blank" rel="noreferrer" className="hover:underline">zinco.cc</a>
        </div>
      </footer>
    </div>
  );
}
