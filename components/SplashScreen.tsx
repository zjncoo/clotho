'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, Shirt } from 'lucide-react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('clotho_splash_seen');
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 1800);

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
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-between p-8 bg-[#0c0d10] text-[#f8fafc] select-none"
        >
          {/* Top minimal skip */}
          <div className="w-full flex justify-end">
            <button
              onClick={handleDismiss}
              className="text-[11px] font-mono tracking-wider uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-full liquid-control"
            >
              <span>Skip</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Editorial Logo & Monogram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl liquid-control flex items-center justify-center border border-white/15 shadow-2xl">
              <Shirt className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight tracking-[-0.04em]">
                CLOTHO
              </h1>
              <p className="text-[11px] font-mono tracking-[0.25em] uppercase opacity-50">
                Digital Wardrobe & Outfit Studio
              </p>
            </div>
          </motion.div>

          {/* Minimal Editorial Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center space-y-2 text-center pb-4"
          >
            <span className="text-[11px] font-mono opacity-40 tracking-wider">CREATIVE STUDIO</span>
            <a
              href="https://zinco.cc"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-control px-4 py-2 rounded-full text-xs font-mono tracking-wide flex items-center gap-1.5 text-white/90 hover:text-white transition-all shadow-md active:scale-95"
            >
              <span>zinco.cc</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
