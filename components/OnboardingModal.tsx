'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shirt,
  Download,
  ArrowRight,
  Check,
  User,
  Layers,
  Palette,
  FolderOpen,
  CloudDownload,
  CheckCircle2,
} from 'lucide-react';
import ColorPicker from './ColorPicker';
import { useTheme } from '@/context/ThemeContext';
import { importWardrobeFromFiles } from '@/utils/cloudStorage';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNameSaved?: (name: string) => void;
  onWardrobeRestored?: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onNameSaved,
  onWardrobeRestored,
}: OnboardingModalProps) {
  const { accent, setCustomAccentHex } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<number>(1); // 1: Name / Restore, 2: Accent Color, 3: Wardrobe slide, 4: Studio slide, 5: Export slide
  const [nameInput, setNameInput] = useState('');
  const [chosenColor, setChosenColor] = useState(accent.hex || '#2563eb');
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen === undefined) {
      if (typeof window !== 'undefined') {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        const setupCompleted = localStorage.getItem('clotho_setup_completed');

        // Only auto-trigger onboarding when running as an installed PWA (or if not completed yet)
        if (isStandalone && !setupCompleted) {
          const storedName = localStorage.getItem('clotho_user_name') || '';
          setNameInput(storedName);
          setInternalOpen(true);
        }
      }
    } else {
      setInternalOpen(isOpen);
      if (isOpen) {
        const storedName = localStorage.getItem('clotho_user_name') || '';
        setNameInput(storedName);
        setChosenColor(accent.hex || '#2563eb');
        setStep(1);
      }
    }
  }, [isOpen, accent.hex]);

  const active = isOpen !== undefined ? isOpen : internalOpen;

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = nameInput.trim() || 'Your';
    localStorage.setItem('clotho_user_name', finalName);
    if (onNameSaved) onNameSaved(finalName);
    setStep(2);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const res = await importWardrobeFromFiles(file);
    if (res.success) {
      setRestoreNotice(`${res.items.length} pieces restored from iCloud / Files!`);
      if (res.userName) {
        setNameInput(res.userName);
        if (onNameSaved) onNameSaved(res.userName);
      }
      if (res.accentColor) {
        setChosenColor(res.accentColor);
        setCustomAccentHex(res.accentColor);
      }
      if (onWardrobeRestored) {
        onWardrobeRestored();
      }

      setTimeout(() => {
        handleFinish();
      }, 1800);
    } else {
      alert(res.error || 'Could not restore backup file.');
    }
  };

  const handleSaveColorAndContinue = () => {
    setCustomAccentHex(chosenColor);
    setStep(3);
  };

  const handleFinish = () => {
    localStorage.setItem('clotho_setup_completed', 'true');
    localStorage.setItem('clotho_tutorial_seen', 'true');
    if (isOpen !== undefined && onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden touch-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] max-h-[90dvh] overflow-y-auto overscroll-contain flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl liquid-control flex items-center justify-center"
                  style={{ color: chosenColor }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Welcome to Clotho</h2>
                  <p className="text-[10px] font-mono opacity-50">
                    Step {step} of 5 • {step === 1 ? 'Personalize or Restore' : step === 2 ? 'Theme Color' : 'Interactive Tour'}
                  </p>
                </div>
              </div>
              {step > 1 && (
                <button
                  onClick={handleFinish}
                  className="p-1.5 liquid-control rounded-full hover:opacity-70 text-xs font-mono opacity-60 hover:opacity-100"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Step 1: Name Input & Restore from iCloud / Files Option */}
            {step === 1 && (
              <div className="space-y-4 py-1">
                {restoreNotice ? (
                  <div className="py-8 flex flex-col items-center text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-400">{restoreNotice}</p>
                    <p className="text-xs font-mono opacity-50">Opening your wardrobe...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 text-center py-1">
                      <div
                        className="w-12 h-12 rounded-2xl liquid-control mx-auto flex items-center justify-center shadow-md"
                        style={{ color: chosenColor }}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold">Set Up Your Wardrobe</h3>
                      <p className="text-xs font-mono opacity-60 max-w-xs mx-auto">
                        Start fresh with a new wardrobe or open an existing backup from iCloud / Files.
                      </p>
                    </div>

                    <form onSubmit={handleSaveName} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono opacity-50">Your Name</label>
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="e.g. Francesco, Sofia, Alex..."
                          className="w-full liquid-control rounded-2xl px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!nameInput.trim()}
                        style={{ backgroundColor: chosenColor }}
                        className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>Start Fresh</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Or Open Backup from Files/iCloud */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                      <div className="text-center">
                        <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">or restore data</span>
                      </div>

                      <label className="cursor-pointer w-full py-3 px-4 liquid-control rounded-2xl flex items-center justify-center gap-2 font-mono text-xs hover:opacity-100 transition-all active:scale-95">
                        <CloudDownload className="w-4 h-4 text-blue-400" />
                        <span>Open from iCloud Drive / Files</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={handleRestoreFile}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Custom Accent Color Picker */}
            {step === 2 && (
              <div className="space-y-4 py-2">
                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-2 font-bold text-base">
                    <Palette className="w-4 h-4" style={{ color: chosenColor }} />
                    <span>Choose Your Accent Color</span>
                  </div>
                  <p className="text-xs font-mono opacity-60">
                    Pick any custom shade. It will color your buttons and wardrobe highlights.
                  </p>
                </div>

                {/* 2D Photoshop-style Gradient Color Picker */}
                <ColorPicker
                  color={chosenColor}
                  onChange={(hex) => setChosenColor(hex)}
                />

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveColorAndContinue}
                    style={{ backgroundColor: chosenColor }}
                    className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Save & Continue to Tour</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Wardrobe & AI Auto-Cut */}
            {step === 3 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${chosenColor}20`, color: chosenColor }}
                  >
                    <Shirt className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold">AI Auto-Cut & Smart Wardrobe</h4>
                  <p className="text-[11px] font-mono opacity-60 leading-relaxed">
                    Upload photos of your clothes. Clotho automatically removes the background, auto-detects colors, brands, and materials.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    style={{ backgroundColor: chosenColor }}
                    className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Next: Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Outfit Studio & Mannequin */}
            {step === 4 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${chosenColor}20`, color: chosenColor }}
                  >
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold">Interactive Mannequin & Layering</h4>
                  <p className="text-[11px] font-mono opacity-60 leading-relaxed">
                    Tap slots on the mannequin to choose and layer tops, headwear, necklaces, bottoms, bags, bracelets, and footwear.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    style={{ backgroundColor: chosenColor }}
                    className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Next: Export & Backups</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Export & Offline Backups */}
            {step === 5 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${chosenColor}20`, color: chosenColor }}
                  >
                    <Download className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold">High-Res Export & JSON Backups</h4>
                  <p className="text-[11px] font-mono opacity-60 leading-relaxed">
                    Export your outfits in ultra-sharp PNG format and safely backup or restore your entire wardrobe anytime.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleFinish}
                    style={{ backgroundColor: chosenColor }}
                    className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step Dots */}
            <div className="flex justify-center items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    step === i ? 'w-6' : 'w-1.5 bg-black/20 dark:bg-white/20'
                  }`}
                  style={{ backgroundColor: step === i ? chosenColor : undefined }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
