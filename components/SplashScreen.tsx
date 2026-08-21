'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check session storage so it displays nicely on initial session launch
    const hasSeenSplash = sessionStorage.getItem('clotho_splash_seen');
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('clotho_splash_seen', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-between p-8 bg-[#0d0e11] text-[#f5f5f7] select-none"
        >
          {/* Top ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full flex justify-end">
            <button
              onClick={handleDismiss}
              className="text-[11px] font-mono opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-full liquid-control"
            >
              <span>Skip</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Central Logo & Branding */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-4 max-w-sm"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl liquid-glass flex items-center justify-center shadow-2xl border border-white/20 relative">
                <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-20 blur-md -z-10" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                CLOTHO
              </h1>
              <p className="text-xs font-mono tracking-widest uppercase opacity-60">
                Digital Wardrobe & Outfit Studio
              </p>
            </div>
          </motion.div>

          {/* Creator Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col items-center space-y-2 text-center pb-4"
          >
            <p className="text-xs font-mono opacity-50">Crafted with style by</p>
            <a
              href="https://zinco.cc"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-control px-4 py-2 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-all shadow-lg hover:scale-105"
            >
              <span>zinco.cc</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
