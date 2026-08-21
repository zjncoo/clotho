'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shirt,
  Download,
  ArrowRight,
  Check,
  User,
  X,
  Layers,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNameSaved?: (name: string) => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onNameSaved,
}: OnboardingModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<number>(1); // 1: Name, 2: Wardrobe slide, 3: Studio slide, 4: Export slide
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (isOpen === undefined) {
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('clotho_user_name') : null;
      const tutorialSeen = typeof window !== 'undefined' ? localStorage.getItem('clotho_tutorial_seen') : null;

      if (!storedName || !tutorialSeen) {
        setInternalOpen(true);
        if (storedName) {
          setNameInput(storedName);
          setStep(2); // directly to tutorial if name exists
        }
      }
    } else {
      setInternalOpen(isOpen);
      if (isOpen) {
        const storedName = localStorage.getItem('clotho_user_name') || '';
        setNameInput(storedName);
        setStep(storedName ? 2 : 1);
      }
    }
  }, [isOpen]);

  const active = isOpen !== undefined ? isOpen : internalOpen;

  const handleSaveNameAndContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = nameInput.trim() || 'Your';
    localStorage.setItem('clotho_user_name', finalName);
    if (onNameSaved) onNameSaved(finalName);
    setStep(2);
  };

  const handleFinish = () => {
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
            className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto overscroll-contain flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl liquid-control flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Welcome to Clotho</h2>
                  <p className="text-[10px] font-mono opacity-50">
                    {step === 1 ? 'Step 1 of 4 • Personalize' : `Step ${step} of 4 • Interactive Tour`}
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

            {/* Step 1: Name Input */}
            {step === 1 && (
              <form onSubmit={handleSaveNameAndContinue} className="space-y-4 py-2">
                <div className="space-y-2 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl liquid-control mx-auto flex items-center justify-center text-blue-400 shadow-md">
                    <User className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold">What is your name?</h3>
                  <p className="text-xs font-mono opacity-60 max-w-xs mx-auto">
                    We&apos;ll personalize your digital wardrobe and studio collection.
                  </p>
                </div>

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
                  className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Tour</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Wardrobe & AI Auto-Cut */}
            {step === 2 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
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
                    onClick={() => setStep(3)}
                    className="w-full py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Next: Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Outfit Studio & Mannequin */}
            {step === 3 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
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
                    onClick={() => setStep(4)}
                    className="w-full py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Next: Export & Backups</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Export & Offline Backups */}
            {step === 4 && (
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-2xl liquid-control flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden bg-black/5 dark:bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
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
                    className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step Dots */}
            <div className="flex justify-center items-center gap-1.5 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    step === i ? 'w-6 bg-blue-500' : 'w-1.5 bg-black/20 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
