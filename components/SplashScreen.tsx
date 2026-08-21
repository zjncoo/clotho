'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt } from 'lucide-react';

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
    }, 1200);

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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-white text-black select-none cursor-pointer"
        >
          {/* Minimalist Centered Brand Mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center shadow-sm border border-black/5">
              <Shirt className="w-7 h-7 text-black" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight tracking-[-0.04em] text-black">
              clotho
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
