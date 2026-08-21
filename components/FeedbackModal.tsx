'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Bug, Sparkles, X, Send, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  defaultUserName = '',
}: FeedbackModalProps) {
  const { accent } = useTheme();
  const [name, setName] = useState(defaultUserName || '');
  const [type, setType] = useState<'Bug Report' | 'Feature Request'>('Bug Report');
  const [severity, setSeverity] = useState('Minor Issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setType('Bug Report');
    setSeverity('Minor Issue');
    setSent(false);
  };

  // Auto-update severity default when switching type
  const handleTypeChange = (newType: 'Bug Report' | 'Feature Request') => {
    setType(newType);
    setSeverity(newType === 'Feature Request' ? 'Not applicable (Feature Request)' : 'Minor Issue');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSending(true);

    try {
      const FORM_URL =
        'https://docs.google.com/forms/d/e/1FAIpQLScSW6xMeWlTXyS0oqqmIN3SIVP7UcDFvv-AmVwHWYmN1OkjGQ/formResponse';

      const formData = new FormData();
      formData.append('entry.1480687685', name.trim() || 'Anonymous');
      formData.append('entry.1458165487', type);
      formData.append('entry.1914202640', title.trim());
      formData.append('entry.1667427179', description.trim());
      formData.append('entry.1802992486', severity);

      // no-cors is required to avoid CORS errors with Google Forms.
      // The request still reaches Google even though we can't read the response.
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      setSent(true);
      setIsSending(false);
    } catch {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden touch-none">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white dark:bg-[#18191e] rounded-[2rem] sm:rounded-[2.5rem] p-6 space-y-5 shadow-xl border border-black/10 dark:border-white/10 max-h-[90dvh] overflow-y-auto overscroll-contain"
          >
            {sent ? (
              /* ── SUCCESS STATE ── */
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accent.hex + '22' }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: accent.hex }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Thank you!</h2>
                  <p className="text-xs font-mono opacity-50 mt-1 leading-relaxed">
                    Your {type.toLowerCase()} has been sent.<br />
                    We'll review it in the next update.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ backgroundColor: accent.hex }}
                  className="mt-2 py-3 px-8 rounded-2xl text-white text-sm font-bold active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* ── HEADER ── */}
                <div className="flex justify-between items-center border-b border-black/8 dark:border-white/8 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: accent.hex + '22', color: accent.hex }}
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold tracking-tight">Send Feedback</h2>
                      <p className="text-[10px] font-mono opacity-40">Bug reports &amp; feature requests</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                  {/* Your name */}
                  <div className="space-y-1.5">
                    <label className="opacity-40 uppercase tracking-wider text-[10px] font-bold">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Francesco"
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs font-sans bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': accent.hex } as React.CSSProperties}
                    />
                  </div>

                  {/* Type selector */}
                  <div className="space-y-1.5">
                    <label className="opacity-40 uppercase tracking-wider text-[10px] font-bold">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleTypeChange('Bug Report')}
                        className={`p-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                          type === 'Bug Report'
                            ? 'bg-red-50 dark:bg-red-950 text-red-500 border-red-300 dark:border-red-800'
                            : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5" />
                        <span>Bug Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('Feature Request')}
                        className={`p-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                          type === 'Feature Request'
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-500 border-blue-300 dark:border-blue-800'
                            : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Feature Request</span>
                      </button>
                    </div>
                  </div>

                  {/* Severity selector */}
                  <div className="space-y-1.5">
                    <label className="opacity-40 uppercase tracking-wider text-[10px] font-bold">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs font-sans bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 focus:outline-none"
                    >
                      <option>Not applicable (Feature Request)</option>
                      <option>Minor Issue</option>
                      <option>Major Issue</option>
                      <option>Critical (App is unusable)</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="opacity-40 uppercase tracking-wider text-[10px] font-bold">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        type === 'Bug Report'
                          ? 'e.g. Image not loading on camera roll'
                          : 'e.g. Show weather forecast in calendar'
                      }
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs font-sans bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="opacity-40 uppercase tracking-wider text-[10px] font-bold">
                      Details <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        type === 'Bug Report'
                          ? 'Steps to reproduce, what you expected vs what happened...'
                          : 'Describe the feature and how it would improve your experience...'
                      }
                      className="w-full rounded-xl p-3.5 text-xs font-sans bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 focus:outline-none focus:ring-2 focus:border-transparent resize-none leading-relaxed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-1 border-t border-black/8 dark:border-white/8">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="py-3 px-5 text-xs font-semibold rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || !title.trim() || !description.trim()}
                      style={{ backgroundColor: accent.hex }}
                      className="flex-1 py-3 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                      {isSending ? (
                        <span className="animate-pulse">Sending…</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
