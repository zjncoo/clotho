'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Wand2,
  ChevronRight,
  ChevronLeft,
  Check,
  Tag,
  Palette,
  Shirt,
  Sparkle,
} from 'lucide-react';
import { Category, ClothingItem } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { generateHarmonicSuite } from '@/utils/colorMath';
import { removeImageBackground } from '@/utils/bgRemover';
import { processAndCompressImage } from '@/utils/imageProcessor';
import { COLOR_PALETTE } from '@/utils/colorPalette';
import { MATERIALS } from '@/utils/materialConstants';
import CutoutRefiner from '@/components/CutoutRefiner';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'top', label: 'Tops & Jackets', icon: '👕' },
  { id: 'bottom', label: 'Pants & Skirts', icon: '👖' },
  { id: 'shoes', label: 'Footwear & Boots', icon: '👟' },
  { id: 'bag', label: 'Bags & Totes', icon: '👜' },
  { id: 'headwear', label: 'Hats & Beanies', icon: '🧢' },
  { id: 'necklace', label: 'Necklaces & Chains', icon: '📿' },
  { id: 'bracelet', label: 'Bracelets & Cuffs', icon: '⌚' },
  { id: 'accessories', label: 'Accessories', icon: '🕶️' },
];

const POPULAR_BRANDS = [
  'Vintage',
  'Maison Margiela',
  'Acne Studios',
  'Prada',
  'Loro Piana',
  'Our Legacy',
  'COS',
  'Uniqlo',
  'Bottega Veneta',
  'Aimé Leon Dore',
  'Dries Van Noten',
  'Rick Owens',
  'Carhartt WIP',
];

// Use the same material list as the edit modal
const POPULAR_MATERIALS = MATERIALS.filter((m) => m !== 'Other');

interface FullscreenAddPieceProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
}

export default function FullscreenAddPiece({
  isOpen,
  onClose,
  onSave,
}: FullscreenAddPieceProps) {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cutoutDataUrl, setCutoutDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showRefiner, setShowRefiner] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Category>('top');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>('');
  const [material, setMaterial] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accent, theme } = useTheme();
  const isDark = theme === 'dark';

  // Compute mathematical color suite for the current accent
  const suite = useMemo(() => {
    return generateHarmonicSuite(accent.hex, isDark);
  }, [accent.hex, isDark]);

  const currentStepTheme = suite.steps[step - 1] || suite.steps[0];

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFile(null);
      setPreviewUrl(null);
      setCutoutDataUrl(null);
      setIsProcessing(false);
      setName('');
      setCategory('top');
      setSelectedColors([]);
      setBrand('');
      setMaterial('');
      setShowRefiner(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Photo Selection & Auto-Cut
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setProcessingStatus('Analyzing photo...');

    try {
      // 1. Remove background with on-device AI
      const transparentBlob = await removeImageBackground(selectedFile, (progress, status) => {
        setProcessingStatus(status);
      });

      setProcessingStatus('Extracting colors...');
      const { webpBase64, dominantColor } = await processAndCompressImage(transparentBlob, 0.9, 900);

      setCutoutDataUrl(webpBase64);
      setPreviewUrl(webpBase64);

      if (dominantColor && dominantColor !== 'N/D') {
        setSelectedColors([dominantColor]);
      }
      setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      console.error('Error processing photo:', err);
      // Fallback: local URL
      const localUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(localUrl);
      setCutoutDataUrl(localUrl);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefineSave = (refinedDataUrl: string) => {
    setCutoutDataUrl(refinedDataUrl);
    setPreviewUrl(refinedDataUrl);
    setShowRefiner(false);
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleFinish = () => {
    if (!cutoutDataUrl && !previewUrl) return;

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      name: name.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Piece`,
      category,
      image: cutoutDataUrl || previewUrl || '',
      colors: selectedColors.length > 0 ? selectedColors : ['Black'],
      brand: brand.trim() || undefined,
      material: material.trim() || 'Cotton',
      createdAt: Date.now(),
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      style={{
        backgroundColor: currentStepTheme.bgHex,
        color: currentStepTheme.textColor,
        transition: 'background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease',
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Navigation Bar — padded below Dynamic Island / notch */}
      <div
        className="w-full px-5 pb-3 flex items-center justify-between z-20 border-b border-black/[0.06] dark:border-white/[0.06]"
        style={{ paddingTop: 'max(env(safe-area-inset-top) + 12px, 20px)' }}
      >
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor:
                    step === idx
                      ? currentStepTheme.textColor
                      : step > idx
                      ? 'rgba(0,0,0,0.3)'
                      : 'rgba(0,0,0,0.1)',
                }}
                className="w-5 h-1 rounded-full transition-all duration-300"
              />
            ))}
          </div>
          <span className="font-mono text-xs uppercase font-bold tracking-wider ml-1 opacity-70">
            Step {step}/5 — {currentStepTheme.name}
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:opacity-70 transition-all active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Step Content — scrollable, gives max room to grid selectors */}
      <div className="flex-1 w-full max-w-xl mx-auto px-5 py-4 flex flex-col overflow-y-auto overscroll-contain relative z-10">
        <AnimatePresence mode="wait">
          {/* ===================================================================
              STEP 1: CAPTURE & AI AUTO-CUT
              =================================================================== */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-widest text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ON-DEVICE AI AUTO-CUT</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Capture Your Piece
                </h2>
                <p className="text-xs font-mono opacity-65 max-w-sm mx-auto">
                  Take a photo on floor, hanger, or bed. AI erases background on-device.
                </p>
              </div>

              {/* Photo Area */}
              <div className="w-full max-w-xs aspect-square rounded-3xl border-2 border-dashed border-black/15 dark:border-white/15 p-4 flex flex-col items-center justify-center relative overflow-hidden bg-white/40 dark:bg-black/20">
                {previewUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <img
                      src={previewUrl}
                      alt="Garment preview"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    />

                    {/* Magic Wand Refine Trigger */}
                    {!isProcessing && cutoutDataUrl && (
                      <button
                        type="button"
                        onClick={() => setShowRefiner(true)}
                        className="absolute bottom-2 right-2 py-1.5 px-3 rounded-full bg-black text-white text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Wand2 className="w-3 h-3 text-orange-400" />
                        <span>Refine Cutout</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 opacity-80" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold block">
                        Tap to Upload or Snap
                      </span>
                      <span className="text-[10px] font-mono opacity-50 block">
                        Supports iPhone .HEIC, PNG, JPG
                      </span>
                    </div>
                  </button>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 space-y-2">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-mono font-bold tracking-wider">
                      {processingStatus || 'Removing background...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-mono underline opacity-70 hover:opacity-100"
                >
                  Choose another photo
                </button>
              )}
            </motion.div>
          )}

          {/* ===================================================================
              STEP 2: IDENTITY & CATEGORY
              =================================================================== */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-widest font-bold opacity-60">
                  SLOT & SILHOUETTE
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  What is this piece?
                </h2>
              </div>

              {/* Piece Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold opacity-60">
                  Garment Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oversized Mohair Cardigan"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 font-bold text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold opacity-60">
                  Wardrobe Slot
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      style={{
                        backgroundColor:
                          category === cat.id ? '#000000' : 'rgba(255,255,255,0.6)',
                        color: category === cat.id ? '#ffffff' : 'inherit',
                      }}
                      className="p-3 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[11px] font-mono font-bold text-center">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              STEP 3: TONAL COLOR EXTRACTION & TAGGING
              =================================================================== */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-60 flex items-center justify-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span>COLOR HARMONIES</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Tonal Color Palette
                </h2>
                <p className="text-[11px] font-mono opacity-65">
                  Select dominant and accent shades for smart outfit layering.
                </p>
              </div>

              {/* Active Color Badges */}
              <div className="flex flex-wrap gap-2 justify-center py-1">
                {selectedColors.map((col) => (
                  <span
                    key={col}
                    className="px-3 py-1 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => toggleColor(col)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Color Swatch Grid — no height cap, fills available space */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-1">
                {COLOR_PALETTE.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => toggleColor(col.name)}
                      className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                        isSelected
                          ? 'border-2 border-black dark:border-white bg-white/90 dark:bg-black/60 font-bold'
                          : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[10px] font-mono truncate w-full text-center">
                        {col.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              STEP 4: BRAND & LUXURY FABRIC
              =================================================================== */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-widest font-bold opacity-60 flex items-center justify-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>PROVENANCE & TEXTILES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Brand & Material
                </h2>
              </div>

              {/* Brand Input & Quick Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase font-bold opacity-60">
                  Brand / Label
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Maison Margiela, Vintage, COS"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 font-bold text-sm focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto overscroll-contain">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(b)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                        brand === b
                          ? 'bg-black text-white border-black font-bold'
                          : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Input & Luxury Fabrics */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase font-bold opacity-60">
                  Fabric / Material
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto overscroll-contain">
                  {POPULAR_MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setMaterial(mat)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                        material === mat
                          ? 'bg-black text-white border-black font-bold'
                          : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              STEP 5: RUNWAY CONFIRMATION & SAVE
              =================================================================== */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center space-y-5"
            >
              <div className="space-y-0.5">
                <span className="font-mono text-[11px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                  PIECE ARCHIVED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Ready for Runway
                </h2>
              </div>

              {/* Runway Archival Card */}
              <div className="w-full max-w-xs rounded-3xl p-5 border border-black/15 dark:border-white/15 bg-white/90 dark:bg-black/60 shadow-xl space-y-3 text-left">
                <div className="aspect-square w-full rounded-2xl bg-black/5 dark:bg-white/5 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={cutoutDataUrl || previewUrl || ''}
                    alt={name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center font-mono text-[10px] uppercase font-bold opacity-60">
                    <span>{category}</span>
                    <span>{brand || 'Unbranded'}</span>
                  </div>
                  <h3 className="text-base font-black truncate">{name || 'Unnamed Piece'}</h3>
                  <div className="flex items-center gap-1.5 pt-1">
                    {selectedColors.map((c) => (
                      <span
                        key={c}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                    {material && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-semibold truncate">
                        {material}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls — padded above home indicator */}
      <div
        className="w-full px-5 pt-4 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.06] z-20"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom) + 8px, 16px)' }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="py-3 px-5 rounded-2xl border border-black/10 dark:border-white/10 font-mono text-xs font-bold flex items-center gap-1 hover:opacity-75 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            disabled={step === 1 && !previewUrl}
            onClick={() => setStep((s) => s + 1)}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
            }}
            className={`py-3.5 px-7 rounded-2xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              step === 1 && !previewUrl ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
            }}
            className="py-3.5 px-8 rounded-2xl font-mono text-xs font-black flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Add to Wardrobe</span>
          </button>
        )}
      </div>

      {/* Cutout Magic Wand Refiner Modal */}
      {showRefiner && previewUrl && (
        <CutoutRefiner
          initialImage={previewUrl}
          onClose={() => setShowRefiner(false)}
          onApply={handleRefineSave}
          accentColor={accent.hex}
        />
      )}
    </div>
  );
}
