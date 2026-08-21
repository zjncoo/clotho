'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  X,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  Smartphone,
  HelpCircle,
  ExternalLink,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPWAGuide: () => void;
  onOpenTutorial: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  onUpdateUserName,
  onExportBackup,
  onImportBackup,
  onOpenPWAGuide,
  onOpenTutorial,
}: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const [tempName, setTempName] = useState(userName);
  const [savedNameNotice, setSavedNameNotice] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tempName.trim() || 'Your';
    onUpdateUserName(finalName);
    localStorage.setItem('clotho_user_name', finalName);
    setSavedNameNotice(true);
    setTimeout(() => setSavedNameNotice(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden touch-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[85vh] max-h-[85dvh] overflow-y-auto overscroll-contain flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl liquid-control flex items-center justify-center text-blue-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Settings & Preferences</h2>
                  <p className="text-[10px] font-mono opacity-50">Personalization & Backups</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 liquid-control rounded-full hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* 1. Name Personalization */}
              <div className="liquid-control rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Your Name</span>
                  </div>
                  {savedNameNotice && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveName} className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name..."
                    className="flex-1 liquid-control rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                  >
                    Save
                  </button>
                </form>
              </div>

              {/* 2. Appearance / Theme */}
              <div className="liquid-control rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-medium text-sm flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>Theme Appearance</span>
                  </span>
                  <p className="text-[10px] opacity-50">
                    Currently in {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 liquid-control rounded-xl text-xs font-semibold hover:opacity-100 transition-all flex items-center gap-1.5"
                >
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              {/* 3. Data & Storage Backup */}
              <div className="liquid-control rounded-2xl p-4 space-y-3">
                <div className="space-y-0.5">
                  <span className="font-medium text-sm">Wardrobe Data & Storage</span>
                  <p className="text-[10px] opacity-50">
                    Export your full catalog as a JSON backup or restore past data.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onExportBackup();
                      onClose();
                    }}
                    className="liquid-control py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-[11px] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <label className="cursor-pointer liquid-control py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-[11px] hover:scale-[1.02] active:scale-95 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        onImportBackup(e);
                        onClose();
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 4. Quick Guides */}
              <div className="liquid-control rounded-2xl p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPWAGuide();
                  }}
                  className="w-full flex items-center justify-between text-left p-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <span>How to Install on iPhone</span>
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </button>

                <div className="w-full h-[1px] bg-black/5 dark:bg-white/5" />

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTutorial();
                  }}
                  className="w-full flex items-center justify-between text-left p-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Replay Interactive App Tour</span>
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </button>
              </div>

              {/* 5. Credits */}
              <div className="text-center pt-2 space-y-1">
                <p className="text-[10px] opacity-40 tracking-wider">CLOTHO CREATIVE STUDIO</p>
                <a
                  href="https://zinco.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                >
                  <span>zinco.cc</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
