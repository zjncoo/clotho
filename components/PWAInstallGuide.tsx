'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, Check, X, Smartphone, ArrowUpRight } from 'lucide-react';

export default function PWAInstallGuide({
  isOpen,
  onClose,
  isAutomatic = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  isAutomatic?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    // If not controlled externally, check if first time on mobile browser
    if (isOpen === undefined) {
      const isStandalone =
        (typeof window !== 'undefined' && (window.navigator as any).standalone) ||
        (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches);

      const hasSeenPrompt = typeof window !== 'undefined' && localStorage.getItem('clotho_pwa_guide_dismissed');

      // Only show automatically once if on mobile and not standalone PWA
      if (!isStandalone && !hasSeenPrompt) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          const timer = setTimeout(() => {
            setInternalOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isOpen]);

  const active = isOpen !== undefined ? isOpen : internalOpen;

  const handleDismiss = () => {
    if (isOpen !== undefined && onClose) {
      onClose();
    } else {
      localStorage.setItem('clotho_pwa_guide_dismissed', 'true');
      setInternalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden touch-none">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md liquid-glass rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto overscroll-contain flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl liquid-control flex items-center justify-center text-blue-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Install on Your iPhone</h2>
                  <p className="text-[11px] font-mono opacity-50">Full-screen native experience</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 liquid-control rounded-full hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual 3-Step Guide for iOS Safari */}
            <div className="space-y-3.5 text-xs font-mono">
              <p className="opacity-70 text-[11px] leading-relaxed">
                Add Clotho to your home screen for instant offline access and native full-screen mode:
              </p>

              {/* Step 1 */}
              <div className="liquid-control rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                  1
                </div>
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold text-sm text-[#121316] dark:text-[#f8fafc] flex items-center gap-1.5">
                    <span>Tap the Share Button</span>
                    <Share className="w-3.5 h-3.5 text-blue-400" />
                  </p>
                  <p className="opacity-50 text-[10px]">
                    In Safari&apos;s bottom toolbar, tap the square icon with the arrow pointing up.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="liquid-control rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                  2
                </div>
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold text-sm text-[#121316] dark:text-[#f8fafc] flex items-center gap-1.5">
                    <span>Select &ldquo;Add to Home Screen&rdquo;</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </p>
                  <p className="opacity-50 text-[10px]">
                    Scroll down the share sheet and tap &ldquo;Aggiungi alla schermata Home&rdquo;.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="liquid-control rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                  3
                </div>
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold text-sm text-[#121316] dark:text-[#f8fafc] flex items-center gap-1.5">
                    <span>Tap &ldquo;Add&rdquo;</span>
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  </p>
                  <p className="opacity-50 text-[10px]">
                    Confirm in the top-right corner. Clotho will now open like a native app.
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg transition-all"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
