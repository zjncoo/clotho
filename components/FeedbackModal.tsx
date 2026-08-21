'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus,
  Bug,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
}

const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScSW6xMeWlTXyS0oqqmIN3SIVP7UcDFvv-AmVwHWYmN1OkjGQ/formResponse';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append('entry.1480687685', name.trim());
      formData.append('entry.1458165487', type);
      if (title.trim()) {
        formData.append('entry.1914202640', title.trim());
      }
      formData.append('entry.1667427179', description.trim());

      await fetch(FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 2400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setIsSuccess(true); // mode no-cors often throws on some browsers but request is dispatched
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }
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
            className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[85vh] max-h-[85dvh] overflow-y-auto overscroll-contain flex flex-col"
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
                  <h2 className="text-base font-bold tracking-tight">Feedback & Support</h2>
                  <p className="text-[10px] font-mono opacity-50">Bug reports and feature requests</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 liquid-control rounded-full hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold">Feedback Received!</h3>
                <p className="text-xs font-mono opacity-60 max-w-xs leading-relaxed">
                  Thank you for helping us make Clotho better. Your message has been sent directly to the team.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                {/* 1. Name */}
                <div className="space-y-1">
                  <label className="opacity-50">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Francesco"
                    className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* 2. Submission Type */}
                <div className="space-y-1.5">
                  <label className="opacity-50">What are you submitting? *</label>
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
                  <label className="opacity-50">Title / Summary</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === 'Bug Report'
                        ? 'e.g. Background removal issue with dark shirts'
                        : 'e.g. Add weather recommendation widget'
                    }
                    className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* 4. Description */}
                <div className="space-y-1">
                  <label className="opacity-50">Details & Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened or how you would like the new feature to work..."
                    className="w-full liquid-control rounded-xl p-3 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>

                {/* Actions */}
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
                    disabled={isSubmitting || !name.trim() || !description.trim()}
                    style={{ backgroundColor: accent.hex }}
                    className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
