'use client';

import React, { createContext, useContext, useState, useId } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MorphingDialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  uniqueId: string;
}

const MorphingDialogContext = createContext<MorphingDialogContextType | null>(null);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) throw new Error('useMorphingDialog must be used within MorphingDialog');
  return context;
}

export function MorphingDialog({
  children,
  transition = { type: 'spring', stiffness: 220, damping: 26 },
}: {
  children: React.ReactNode;
  transition?: Transition;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();

  return (
    <MorphingDialogContext.Provider value={{ isOpen, setIsOpen, uniqueId }}>
      {children}
    </MorphingDialogContext.Provider>
  );
}

export function MorphingDialogTrigger({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { setIsOpen, uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`dialog-${uniqueId}`}
      onClick={() => setIsOpen(true)}
      className={cn('cursor-pointer', className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogContainer({ children }: { children: React.ReactNode }) {
  const { isOpen } = useMorphingDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function MorphingDialogContent({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { uniqueId, setIsOpen } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`dialog-${uniqueId}`}
      className={cn('relative z-50 overflow-hidden shadow-2xl', className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.h3 layoutId={`dialog-title-${uniqueId}`} className={cn('font-semibold', className)}>
      {children}
    </motion.h3>
  );
}

export function MorphingDialogSubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.p layoutId={`dialog-subtitle-${uniqueId}`} className={cn('text-xs opacity-60', className)}>
      {children}
    </motion.p>
  );
}

export function MorphingDialogClose({ className }: { className?: string }) {
  const { setIsOpen } = useMorphingDialog();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
      className={cn(
        'absolute top-4 right-4 p-2 rounded-full liquid-control hover:opacity-80 transition',
        className
      )}
    >
      <X className="w-4 h-4" />
    </button>
  );
}
