'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Scissors,
  Sparkles,
  Search,
  Check,
  Shirt,
} from 'lucide-react';

export default function PromotionalSitePage() {
  return (
    <div
      style={{
        fontFamily:
          "'Neue Haas Grotesk Display Pro', 'Neue Haas Grotesk Text Pro', 'Neue Haas Grotesk', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      className="min-h-screen bg-white text-[#0f0f10] selection:bg-black selection:text-white"
    >
      {/* Masthead */}
      <header className="border-b border-black/[0.08] px-6 sm:px-10 py-3.5 flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <Link href="/site" className="font-black text-base tracking-tight normal-case font-sans">
            clotho
          </Link>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="opacity-60 hidden sm:inline">the digital styling studio</span>
        </div>
        <div>
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full bg-black text-white font-semibold text-[11px] hover:opacity-85 transition-opacity inline-flex items-center gap-1.5"
          >
            <span>Launch WebApp</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Editorial Container */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Column 1: Main Title & Fashion Action Box (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col justify-between gap-8 lg:sticky lg:top-8 self-start">
          <div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-[-0.06em] leading-[0.85] mb-3 font-sans">
              clotho
            </h1>
            <div className="flex items-center justify-between text-xs font-mono text-[#666668] mb-6">
              <span>digital wardrobe studio</span>
              <a href="https://zinco.cc" target="_blank" rel="noreferrer" className="text-[#0f0f10] font-semibold hover:underline">
                by zinco.cc
              </a>
            </div>

            <p className="text-sm leading-relaxed text-[#1e1e20] mb-5">
              Stop staring at a full closet with &ldquo;nothing to wear.&rdquo; clotho turns your physical clothes into an editorial digital lookbook. Auto-cut studio cleanouts, 7-slot mannequin layering, multi-color palette matching, and offline iCloud sync.
            </p>

            <span className="inline-flex items-center gap-1.5 bg-[#eef2ff] text-[#3730a3] px-3 py-1 rounded-md text-[11px] font-semibold font-mono mb-8">
              <Sparkles className="w-3 h-3" />
              <span>Curated Styling • v1.0</span>
            </span>
          </div>

          <div className="border-t border-black/[0.08] pt-6 space-y-4">
            <p className="text-xs text-[#666668] leading-relaxed">
              100% private, free, and local-first. Your outfits and photos never touch third-party servers. Designed specifically for iPhone and Safari Home Screen.
            </p>
            <div className="flex gap-2.5">
              <Link
                href="/"
                className="flex-[1.2] bg-black hover:opacity-85 text-white py-3.5 px-4 rounded-xl font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <span>Open clotho</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/create"
                className="flex-1 bg-white hover:bg-neutral-100 text-[#0f0f10] border border-black/20 py-3.5 px-4 rounded-xl font-semibold text-xs text-center transition-all active:scale-[0.98]"
              >
                <span>Outfit Studio</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Column 2: Minimalist Meta / Info Column (2 cols) */}
        <div className="lg:col-span-2 font-mono text-[11px] flex flex-col gap-8 self-start border-t lg:border-t-0 lg:border-l border-black/[0.08] pt-6 lg:pt-0 lg:pl-6">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-[#666668] mb-2 font-bold">PHILOSOPHY [01]</h4>
            <p className="text-[#333333] leading-snug">
              Wardrobe intentionality over mindless shopping. Digitize what you own, discover new layering formulas, and build signatures that feel authentic to you.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase tracking-wider text-[#666668] mb-2 font-bold">THE SUITE</h4>
            <span className="block text-[#0f0f10] font-semibold text-[10px]">AUTO-CUT CAMERA</span>
            <span className="block text-[#0f0f10] font-semibold text-[10px]">7-SLOT MANNEQUIN</span>
            <span className="block text-[#0f0f10] font-semibold text-[10px]">MULTI-COLOR DRAWER</span>
            <span className="block text-[#0f0f10] font-semibold text-[10px]">32 MATERIAL TAGS</span>
            <span className="block text-[#0f0f10] font-semibold text-[10px]">ICLOUD FILES BACKUP</span>
          </div>
        </div>

        {/* Column 3: Magazine / App UI Recreations (6 cols) */}
        <section className="lg:col-span-6 flex flex-col gap-10">
          {/* Billboard Showcase */}
          <div className="bg-[#090a0c] text-white rounded-2xl p-8 sm:p-11 min-h-[320px] flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.3),transparent_60%)] border border-white/10">
            <span className="font-mono text-[10px] tracking-widest opacity-60">CLOTHO EDITORIAL —— 2026</span>
            <div className="space-y-3 my-6">
              <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] leading-[0.92] uppercase">
                AUDITION OUTFITS<br />BEFORE YOU DRESS.
              </h2>
              <div className="inline-block bg-[#facc15] text-black px-3.5 py-1 font-mono text-xs font-bold -rotate-1 rounded-xs">
                END CLOSET CHAOS FOREVER
              </div>
            </div>
            <span className="font-mono text-[10px] opacity-50">On-device cutout engine • Instant palette extraction • High-res export</span>
          </div>

          {/* APP RECREATION 1: 7-SLOT MANNEQUIN */}
          <div className="border border-black/[0.08] rounded-2xl p-7 bg-white shadow-xs space-y-5">
            <div className="flex justify-between items-center font-mono text-[10px] text-[#666668] uppercase border-b border-black/[0.08] pb-3">
              <span>[FEATURE 01] THE INTERACTIVE MANNEQUIN</span>
              <span>STUDIO CANVAS</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight leading-tight">Audition silhouettes, necklines, and layers on a live canvas.</h3>
              <p className="text-xs text-[#666668] leading-relaxed mt-1">
                Tap any zone to audition garments from your wardrobe. Check how jacket collars fall over knitwear, how trousers drape over boots, and add finishing accessories.
              </p>
            </div>

            <div className="bg-[#f4f6fa] border border-black/[0.08] rounded-xl p-6 flex flex-col items-center relative">
              <div className="w-full flex justify-between items-center font-mono text-[10px] text-[#666668] mb-4">
                <span>CLOTHO STUDIO — CANVAS VIEW</span>
                <span>HIGH-RES POSTER READY</span>
              </div>

              <div className="w-full max-w-[280px] flex flex-col gap-2 relative">
                <div className="bg-white border border-black/10 rounded-xl p-3 flex justify-between items-center font-mono text-xs shadow-xs">
                  <span className="text-[9px] opacity-60 uppercase">01. Headwear</span>
                  <span className="font-bold">Wool Ribbed Beanie</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-40" />
                </div>
                <div className="bg-white border border-black/10 rounded-xl p-3 flex justify-between items-center font-mono text-xs shadow-xs">
                  <span className="text-[9px] opacity-60 uppercase">02. Necklaces</span>
                  <span className="font-bold">Silver 925 Chain</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-40" />
                </div>
                <div className="bg-black text-white rounded-xl p-3 flex justify-between items-center font-mono text-xs shadow-xs">
                  <span className="text-[9px] opacity-80 uppercase">03. Tops</span>
                  <span className="font-bold">Cashmere Boxy Knit</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="bg-black text-white rounded-xl p-3 flex justify-between items-center font-mono text-xs shadow-xs">
                  <span className="text-[9px] opacity-80 uppercase">04. Bottoms</span>
                  <span className="font-bold">Pleated Trousers</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="bg-white border border-black/10 rounded-xl p-3 flex justify-between items-center font-mono text-xs shadow-xs">
                  <span className="text-[9px] opacity-60 uppercase">05. Footwear</span>
                  <span className="font-bold">Square Toe Boots</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-40" />
                </div>
              </div>
            </div>
          </div>

          {/* APP RECREATION 2: MULTI-COLOR DRAWER */}
          <div className="border border-black/[0.08] rounded-2xl p-7 bg-white shadow-xs space-y-5">
            <div className="flex justify-between items-center font-mono text-[10px] text-[#666668] uppercase border-b border-black/[0.08] pb-3">
              <span>[FEATURE 02] MULTI-COLOR DRAWER & SMART FILTERS</span>
              <span>WARDROBE SEARCH</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight leading-tight">Filter by multiple color palettes simultaneously.</h3>
              <p className="text-xs text-[#666668] leading-relaxed mt-1">
                Build tonal outfits effortlessly. Open the expandable color drawer to filter across several tones (e.g. <em>Camel + Cream + Espresso</em>), brands, and 32 alphabetized textile tags.
              </p>
            </div>

            <div className="bg-[#fcfcfd] border border-black/[0.08] rounded-xl p-5 space-y-4 font-mono">
              <div className="bg-white border border-black/10 rounded-lg p-2.5 flex items-center gap-2 text-xs text-[#666]">
                <Search className="w-3.5 h-3.5 opacity-50" />
                <span className="truncate">Search pieces, brands (Margiela, Prada...), materials...</span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto text-[10px]">
                <span className="px-3 py-1 rounded-full bg-black text-white font-bold">All (28)</span>
                <span className="px-3 py-1 rounded-full bg-white border border-black/10">Tops (10)</span>
                <span className="px-3 py-1 rounded-full bg-white border border-black/10">Bottoms (6)</span>
                <span className="px-3 py-1 rounded-full bg-white border border-black/10">Footwear (4)</span>
                <span className="px-3 py-1 rounded-full bg-white border border-black/10">Bags (3)</span>
              </div>

              <div className="bg-white border border-black/10 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-[10px] text-[#666668] font-bold">
                  <span>COLOR PALETTES (2 SELECTED)</span>
                  <span className="text-blue-600 cursor-pointer">RESET</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-100 border border-black font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                    <span>Black</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-100 border border-black font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                    <span>Camel</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f8f8f9] border border-black/5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-200 border" />
                    <span>Cream</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f8f8f9] border border-black/5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                    <span>Navy</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f8f8f9] border border-black/5">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-800" />
                    <span>Olive</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f8f8f9] border border-black/5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                    <span>Stone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* APP RECREATION 3: AUTO-CUT */}
          <div className="border border-black/[0.08] rounded-2xl p-7 bg-white shadow-xs space-y-5">
            <div className="flex justify-between items-center font-mono text-[10px] text-[#666668] uppercase border-b border-black/[0.08] pb-3">
              <span>[FEATURE 03] ON-DEVICE AUTO-CUT</span>
              <span>GARMENT DIGITIZATION</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight leading-tight">Pristine studio cutouts in a fraction of a second.</h3>
              <p className="text-xs text-[#666668] leading-relaxed mt-1">
                Snap a photo of your garment anywhere. clotho isolates the clothing piece, removes the background cleanly on your device, detects primary & secondary tones, and auto-tags material.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#f4f6fa] border border-black/[0.08] rounded-xl aspect-[4/5] p-4 flex flex-col justify-between relative">
                <span className="absolute top-3 right-3 bg-black text-white font-mono text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Scissors className="w-2.5 h-2.5" />
                  <span>Auto-Cut</span>
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <Shirt className="w-16 h-16 stroke-[1.2] text-[#111]" />
                </div>
                <div className="font-mono text-[10px] border-t border-black/10 pt-2 flex justify-between font-bold">
                  <span>Margiela Knit</span>
                  <span className="text-[#666668]">Tops</span>
                </div>
              </div>

              <div className="bg-white border border-black/[0.08] rounded-xl p-5 font-mono text-[11px] flex flex-col justify-between gap-3">
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-[10px] uppercase text-[#666668]">Brand / Label</span>
                  <span className="font-bold">Maison Margiela</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-[10px] uppercase text-[#666668]">Material Fiber</span>
                  <span className="font-bold">100% Cashmere</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-[10px] uppercase text-[#666668]">Detected Colors</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-stone-900 border" />
                    <span className="w-3 h-3 rounded-full bg-stone-200 border" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase text-[#666668]">Storage Status</span>
                  <span className="font-bold text-emerald-600">100% Offline / Private</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-black/[0.08] px-6 sm:px-10 py-6 font-mono text-[11px] text-[#666668] flex flex-col sm:flex-row justify-between gap-3 max-w-[1400px] mx-auto">
        <div>clotho — digital wardrobe & styling studio © 2026</div>
        <div className="flex gap-4">
          <Link href="/" className="text-[#0f0f10] hover:underline">Wardrobe</Link>
          <Link href="/create" className="text-[#0f0f10] hover:underline">Studio</Link>
          <a href="https://zinco.cc" target="_blank" rel="noreferrer" className="text-[#0f0f10] hover:underline">zinco.cc</a>
        </div>
      </footer>
    </div>
  );
}
