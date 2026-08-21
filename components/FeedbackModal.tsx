'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus,
  Bug,
  Sparkles,
  ExternalLink,
  X,
  Send,
  Paperclip,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
}

const GOOGLE_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScSW6xMeWlTXyS0oqqmIN3SIVP7UcDFvv-AmVwHWYmN1OkjGQ/viewform';

export default function FeedbackModal({
  isOpen,
  onClose,
  defaultUserName = '',
}: FeedbackModalProps) {
  const { accent } = useTheme();
  const [name, setName] = useState(defaultUserName || '');
  const [type, setType] = useState<'Bug Report' | 'Feature Request'>('Bug Report');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const buildPreFilledUrl = () => {
    const params = new URLSearchParams();
    params.set('usp', 'pp_url');
    if (name.trim()) params.set('entry.1480687685', name.trim());
    params.set('entry.1458165487', type); // "Bug Report" | "Feature Request"
    if (title.trim()) params.set('entry.1914202640', title.trim());
    if (description.trim()) params.set('entry.1667427179', description.trim());
    return `${GOOGLE_FORM_BASE_URL}?${params.toString()}`;
  };

  const handleOpenGoogleForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = buildPreFilledUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden touch-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[88vh] max-h-[88dvh] overflow-y-auto overscroll-contain flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl liquid-control flex items-center justify-center"
                  style={{ color: accent.hex }}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Bug Report & Feedback</h2>
                  <p className="text-[10px] font-mono opacity-50">Send feedback and attach screenshots</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 liquid-control rounded-full hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenGoogleForm} className="space-y-4 text-xs font-mono">
              {/* 1. Name */}
              <div className="space-y-1">
                <label className="opacity-50">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Francesco"
                  className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* 2. Submission Type */}
              <div className="space-y-1.5">
                <label className="opacity-50">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Bug Report')}
                    className={`p-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      type === 'Bug Report'
                        ? 'bg-red-500/15 text-red-400 ring-2 ring-red-500/50 shadow-xs'
                        : 'liquid-control opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Bug Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('Feature Request')}
                    className={`p-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      type === 'Feature Request'
                        ? 'bg-blue-500/15 text-blue-400 ring-2 ring-blue-500/50 shadow-xs'
                        : 'liquid-control opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Feature Request</span>
                  </button>
                </div>
              </div>

              {/* 3. Title */}
              <div className="space-y-1">
                <label className="opacity-50">Title / Subject</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === 'Bug Report'
                      ? 'e.g. Issue uploading jacket picture'
                      : 'e.g. Add weather recommendation widget'
                  }
                  className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* 4. Description */}
              <div className="space-y-1">
                <label className="opacity-50">Details / Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem or your feature suggestion..."
                  className="w-full liquid-control rounded-xl p-3 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              {/* Notice regarding file attachments on Google Form */}
              <div className="liquid-control rounded-xl p-3 flex items-start gap-2 text-[11px] opacity-70">
                <Paperclip className="w-3.5 h-3.5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="leading-snug">
                  Opening the form allows you to attach screenshots/files directly to Google Drive. Your details above will be pre-filled automatically.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2.5 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider liquid-control rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: accent.hex }}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 hover:opacity-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open Form & Submit</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
