'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { CalendarEntry, StreakData } from '@/types';
import {
  formatLocalDate,
  getCalendarEntries,
  getStreakData,
  deleteCalendarEntry,
  getMostWornPiece,
} from '@/utils/calendarStorage';
import { useTheme } from '@/context/ThemeContext';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoggedDate: null,
    history: [],
  });
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [selectedEmptyDate, setSelectedEmptyDate] = useState<string | null>(null);

  const { accent } = useTheme();
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatLocalDate(today), [today]);
  const todayDay = today.getDate();
  const todayMonthName = today.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const todayYear = today.getFullYear();
  const todayWeekday = today.toLocaleString('en-US', { weekday: 'short' });

  useEffect(() => {
    async function load() {
      const data = await getCalendarEntries();
      setEntries(data);
      const s = await getStreakData();
      setStreak(s);
    }
    load();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const yearMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const isCurrentViewMonth = year === today.getFullYear() && month === today.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow === -1) startDow = 6;
    const totalDays = lastDay.getDate();
    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLast - i;
      days.push({ dateStr: formatLocalDate(new Date(year, month - 1, d)), dayNumber: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d, isCurrentMonth: true });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ dateStr: formatLocalDate(new Date(year, month + 1, i)), dayNumber: i, isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry>();
    for (const e of entries) map.set(e.date, e);
    return map;
  }, [entries]);

  const mostWorn = useMemo(() => getMostWornPiece(yearMonthKey, entries), [yearMonthKey, entries]);
  const totalOutfitsThisMonth = useMemo(
    () => entries.filter((e) => e.date.startsWith(yearMonthKey)).length,
    [yearMonthKey, entries]
  );

  const handleDeleteEntry = async (id: string) => {
    const { entries: updated, streak: updatedStreak } = await deleteCalendarEntry(id);
    setEntries(updated);
    setStreak(updatedStreak);
    setSelectedEntry(null);
  };

  const isTodayLogged = streak.history.includes(todayStr);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-4 pb-28 sm:pb-32">

      {/* ── EDITORIAL DATE HERO ── */}
      <div className="pt-2 pb-6 border-b border-black/8 dark:border-white/8">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-black leading-none tracking-tighter select-none"
              style={{ fontSize: 'clamp(80px, 22vw, 120px)', lineHeight: 0.88 }}
            >
              {isCurrentViewMonth ? todayDay : 1}
            </div>
            <div className="mt-4 space-y-0.5">
              <div className="text-xl sm:text-2xl font-black tracking-widest uppercase">
                {isCurrentViewMonth ? todayMonthName : monthName.toUpperCase()}
              </div>
              <div className="text-sm font-mono opacity-30 tracking-widest">
                {isCurrentViewMonth ? todayYear : year}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3 pt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight opacity-20">
              {isCurrentViewMonth ? todayWeekday : ''}
            </span>
            {streak.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10">
                <Flame className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                <span>{streak.currentStreak}d streak</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          {isTodayLogged ? (
            <div className="w-full py-4 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-sm font-semibold opacity-40">
              <span>✓ Today&apos;s look already logged</span>
            </div>
          ) : (
            <Link
              href="/create"
              style={{ backgroundColor: accent.hex }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-white text-sm font-bold tracking-wide active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span>Add Today&apos;s Look</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── CALENDAR GRID ── */}
      <div className="pt-6 space-y-4">
        {/* Month Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold tracking-tight">
              {monthName} <span className="opacity-30 font-normal">{year}</span>
            </h2>
            {!isCurrentViewMonth && (
              <button
                type="button"
                onClick={goToToday}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Today
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 text-center">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-[11px] font-mono font-bold opacity-25 uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5">
          {calendarDays.map(({ dateStr, dayNumber, isCurrentMonth }) => {
            const entry = entriesByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const hasOutfit = !!entry?.outfitImage;

            // Color logic (like the reference image):
            // - Today → accent color
            // - Has outfit → dark filled (black/dark grey) with image inside
            // - Past days (current month, no outfit) → medium grey
            // - Future days (current month, no outfit) → light grey
            // - Other month → invisible
            let circleBg: string;
            if (!isCurrentMonth) {
              circleBg = 'transparent';
            } else if (isToday) {
              circleBg = accent.hex;
            } else if (hasOutfit) {
              circleBg = '#111111';
            } else if (isPast) {
              circleBg = '#c8c8c8';
            } else {
              circleBg = '#e5e5e5';
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  if (!isCurrentMonth) return;
                  if (entry) setSelectedEntry(entry);
                  else setSelectedEmptyDate(dateStr);
                }}
                disabled={!isCurrentMonth}
                className="flex flex-col items-center gap-1 group"
                style={{ opacity: isCurrentMonth ? 1 : 0 }}
              >
                {/* The circle */}
                <div
                  className="w-full aspect-square rounded-full flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95"
                  style={{ backgroundColor: circleBg }}
                >
                  {hasOutfit ? (
                    <img
                      src={entry!.outfitImage}
                      alt={entry!.title || 'Look'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      className="font-bold font-mono select-none"
                      style={{
                        fontSize: 'clamp(8px, 2.8vw, 14px)',
                        color: isToday ? '#fff' : isPast ? '#777' : '#aaa',
                      }}
                    >
                      {dayNumber}
                    </span>
                  )}

                  {/* Hover overlay for empty clickable days */}
                  {isCurrentMonth && !entry && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: accent.hex + 'dd' }}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Day number label below when circle shows image */}
                {hasOutfit && isCurrentMonth && (
                  <span
                    className="font-mono opacity-35 select-none"
                    style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}
                  >
                    {dayNumber}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MONTHLY INSIGHTS ── */}
      {(mostWorn || totalOutfitsThisMonth > 0) && (
        <div className="mt-8 pt-6 border-t border-black/8 dark:border-white/8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 opacity-30" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-30">{monthName} Insights</span>
            </div>
            <span className="text-xs font-mono opacity-25">{totalOutfitsThisMonth} looks</span>
          </div>

          {mostWorn && (
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-black/8 dark:border-white/8">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                <img src={mostWorn.item.image} alt={mostWorn.item.name} className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-35 font-bold mb-0.5">#1 Most Worn</div>
                <div className="text-sm font-bold truncate">{mostWorn.item.name}</div>
                <div className="text-xs font-mono opacity-40">{mostWorn.daysCount} outfits this month</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DAY DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#18191e] rounded-[2rem] sm:rounded-[2.5rem] max-w-md w-full p-6 space-y-4 border border-black/10 dark:border-white/10 max-h-[88dvh] overflow-y-auto overscroll-contain"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-35">
                    {new Date(selectedEntry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mt-0.5">{selectedEntry.title || 'Daily Look'}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedEntry.outfitImage && (
                <div className="aspect-square rounded-2xl border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/3 flex items-center justify-center overflow-hidden p-4">
                  <img src={selectedEntry.outfitImage} alt="Look" className="max-h-full max-w-full object-contain" />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-35">Pieces</h4>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto overscroll-contain pr-1">
                  {Object.entries(selectedEntry.slotItems || {}).flatMap(([cat, itemsList]) =>
                    (itemsList || []).map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl border border-black/8 dark:border-white/8 flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-9 h-9 object-contain flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-semibold truncate">{item.name}</p>
                          <p className="text-[9px] font-mono opacity-35 uppercase">{cat}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-black/8 dark:border-white/8">
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="p-2.5 text-red-500 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-1.5 text-xs font-mono transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  style={{ backgroundColor: accent.hex }}
                  className="flex-1 py-2.5 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EMPTY DAY MODAL ── */}
      <AnimatePresence>
        {selectedEmptyDate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#18191e] rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full p-6 text-center space-y-4 border border-black/10 dark:border-white/10 flex flex-col items-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black"
                style={{ backgroundColor: accent.hex }}
              >
                {new Date(selectedEmptyDate + 'T00:00:00').getDate()}
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-35">
                  {new Date(selectedEmptyDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </div>
                <h3 className="text-lg font-bold tracking-tight">No look recorded</h3>
                <p className="text-xs font-mono opacity-45">
                  Build an outfit in Studio and save it to this day.
                </p>
              </div>

              <div className="w-full flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedEmptyDate(null)}
                  className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <Link
                  href="/create"
                  style={{ backgroundColor: accent.hex }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
