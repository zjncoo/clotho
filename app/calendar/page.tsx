'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
  X,
  Sparkles,
  Shirt,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import { CalendarEntry, ClothingItem, StreakData } from '@/types';
import {
  formatLocalDate,
  getCalendarEntries,
  getStreakData,
  deleteCalendarEntry,
  getMostWornPiece,
} from '@/utils/calendarStorage';
import { useTheme } from '@/context/ThemeContext';

const WEEKDAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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

  // Load calendar entries & streak data
  useEffect(() => {
    async function loadData() {
      const data = await getCalendarEntries();
      setEntries(data);
      const streakData = await getStreakData();
      setStreak(streakData);
    }
    loadData();
  }, []);

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const selectedDateStr = useMemo(() => formatLocalDate(selectedDate), [selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const monthNameUpper = currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const selectedDayNumber = selectedDate.getDate();
  const selectedWeekdayShort = selectedDate.toLocaleString('en-US', { weekday: 'short' });
  const yearMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Active day index in Mon-Sun (0 - 6)
  const activeDayOfWeek = useMemo(() => {
    let day = selectedDate.getDay() - 1;
    if (day === -1) day = 6;
    return day;
  }, [selectedDate]);

  // Build calendar matrix (Monday start)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days: { date: Date; dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        date: prevDate,
        dateStr: formatLocalDate(prevDate),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: thisDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month filler days to complete 7-column grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        dateStr: formatLocalDate(nextDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Map entries by dateStr for fast O(1) lookup
  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry>();
    for (const entry of entries) {
      map.set(entry.date, entry);
    }
    return map;
  }, [entries]);

  // "Most Worn This Month" analysis
  const mostWorn = useMemo(() => {
    return getMostWornPiece(yearMonthKey, entries);
  }, [yearMonthKey, entries]);

  const totalOutfitsThisMonth = useMemo(() => {
    return entries.filter((e) => e.date.startsWith(yearMonthKey)).length;
  }, [yearMonthKey, entries]);

  // Delete outfit
  const handleDeleteEntry = async (id: string) => {
    const { entries: updated, streak: updatedStreak } = await deleteCalendarEntry(id);
    setEntries(updated);
    setStreak(updatedStreak);
    setSelectedEntry(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 sm:pb-32 space-y-6">
      {/* --------------------------------------------------------------------------
          Top Primary Action: Prominent Theme Accent Button for Today's Look
          -------------------------------------------------------------------------- */}
      <div className="flex items-center gap-2">
        <Link
          href="/create"
          style={{ backgroundColor: accent.hex }}
          className="flex-1 py-3.5 px-6 rounded-2xl text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today's Look</span>
        </Link>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#18191e] border border-black/10 dark:border-white/10 rounded-2xl p-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          High-Impact Editorial Calendar (Exact Replica of Reference Design)
          -------------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-[#18191e] rounded-[2.5rem] p-6 sm:p-7 border border-black/10 dark:border-white/10 space-y-6">
        {/* Giant Day Number Header */}
        <div className="space-y-1">
          <div className="text-7xl sm:text-8xl font-black tracking-tighter leading-none select-none font-sans">
            {selectedDayNumber}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <div className="text-xl sm:text-2xl font-black tracking-tight font-sans uppercase">
              {monthNameUpper} <span className="opacity-40 font-normal">{year}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-sans text-neutral-500 dark:text-neutral-400">
              {selectedWeekdayShort}
            </div>
          </div>
        </div>

        {/* 7-Column Weekday Headers (M T W T F S S) */}
        <div className="grid grid-cols-7 gap-2 text-center font-mono text-xs font-bold pt-2">
          {WEEKDAYS_SHORT.map((w, idx) => {
            const isActive = idx === activeDayOfWeek;
            return (
              <div
                key={idx}
                style={isActive ? { color: accent.hex } : {}}
                className={`transition-colors ${isActive ? 'font-black scale-110' : 'opacity-40'}`}
              >
                {w}
              </div>
            );
          })}
        </div>

        {/* Large Circle Discs Grid (Preview Circles) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 pt-1">
          {calendarDays.map(({ date, dateStr, dayNumber, isCurrentMonth }) => {
            const entry = entriesByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  if (entry) {
                    setSelectedEntry(entry);
                  } else {
                    setSelectedEmptyDate(dateStr);
                  }
                }}
                className="aspect-square w-full rounded-full flex items-center justify-center relative overflow-hidden transition-all active:scale-90 group focus:outline-none"
              >
                {/* 1. If Outfit Logged: Show circular preview image */}
                {entry && entry.outfitImage ? (
                  <div
                    className={`w-full h-full rounded-full bg-[#1c1d22] border flex items-center justify-center p-1 relative overflow-hidden ${
                      isSelected
                        ? 'border-3 ring-2 ring-black dark:ring-white scale-105'
                        : 'border-black/20 dark:border-white/20'
                    }`}
                  >
                    <img
                      src={entry.outfitImage}
                      alt={entry.title || 'Look'}
                      className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform"
                    />
                  </div>
                ) : isToday || isSelected ? (
                  /* 2. Active Selected / Today Dot: Solid Accent Color Circle */
                  <div
                    style={
                      isSelected
                        ? { backgroundColor: accent.hex, color: '#ffffff' }
                        : { backgroundColor: '#1c1d22', color: '#ffffff' }
                    }
                    className="w-full h-full rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm shadow-sm scale-105"
                  >
                    {dayNumber}
                  </div>
                ) : (
                  /* 3. Empty Discs: Clean Soft Circular Pill */
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center font-mono text-[11px] sm:text-xs transition-all ${
                      isCurrentMonth
                        ? 'bg-[#e5e3dc] dark:bg-[#252830] text-neutral-600 dark:text-neutral-300 hover:bg-[#d8d6ce] dark:hover:bg-[#2e323c]'
                        : 'bg-[#eeece5] dark:bg-[#1a1c22] text-neutral-400 dark:text-neutral-600 opacity-40'
                    }`}
                  >
                    {dayNumber}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          Streak Banner (🔥) & Monthly Insights Card
          -------------------------------------------------------------------------- */}
      <div className="rounded-3xl p-5 border border-[#fbd4bc] dark:border-[#522b1e] bg-[#fef3ec] dark:bg-[#251712] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white shadow-none flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#c2410c] dark:text-[#fb923c] font-mono">
                {streak.currentStreak} Day Streak
              </h2>
              {streak.currentStreak > 0 && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#ea580c] text-white font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-[#9a3412] dark:text-[#fdba74]">
              {streak.currentStreak === 0
                ? 'Log today’s outfit from Studio to start your style streak!'
                : `You're on fire! Best streak: ${streak.longestStreak} days.`}
            </p>
          </div>
        </div>

        {streak.history.includes(todayStr) ? (
          <span className="text-[9px] font-mono text-[#15803d] dark:text-[#86efac] font-bold bg-[#dcfce7] dark:bg-[#14532d] px-2.5 py-1 rounded-full border border-[#86efac]/40">
            ✓ Logged Today
          </span>
        ) : (
          <Link
            href="/create"
            className="py-2 px-3.5 rounded-xl text-xs font-mono font-bold bg-[#ea580c] text-white hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
          >
            <span>Log</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Monthly Insights: Most Worn This Month */}
      <div className="rounded-3xl p-5 border border-[#d3e0ce] dark:border-[#2a382b] bg-[#f2f6f0] dark:bg-[#1a231b] space-y-3">
        <div className="flex items-center justify-between border-b border-[#c2d4bc] dark:border-[#2d3e2e] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3b7a3e] dark:text-[#86efac]" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#2d5f30] dark:text-[#86efac]">
              {monthNameUpper} Insights
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#3b7a3e] dark:text-[#a7f3d0]">
            {totalOutfitsThisMonth} looks recorded
          </span>
        </div>

        {mostWorn ? (
          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#243025] border border-[#c2d4bc] dark:border-[#354836] flex items-center justify-center p-2 flex-shrink-0">
              <img
                src={mostWorn.item.image}
                alt={mostWorn.item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-0.5 overflow-hidden">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#2d5f30] dark:text-[#86efac] font-bold">
                #1 MOST WORN PIECE
              </span>
              <h4 className="text-xs font-bold truncate text-[#1a381c] dark:text-white">{mostWorn.item.name}</h4>
              <p className="text-[11px] font-mono text-[#3b7a3e] dark:text-[#a7f3d0]">
                Worn in <span className="font-bold">{mostWorn.daysCount}</span> looks this month
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-[#3b7a3e] dark:text-[#86efac] py-1 text-center">
            Log outfits to unlock your most-worn pieces and styling stats!
          </p>
        )}
      </div>

      {/* --------------------------------------------------------------------------
          Day Look Detail Modal
          -------------------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#18191e] rounded-[2.5rem] max-w-md w-full p-6 space-y-4 shadow-2xl border border-black/10 dark:border-white/10 max-h-[88vh] max-h-[88dvh] overflow-y-auto overscroll-contain flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-3">
                <div>
                  <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                    {new Date(selectedEntry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <h3 className="text-lg font-black tracking-tight">{selectedEntry.title || 'Daily Look'}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 rounded-full border border-black/10 dark:border-white/10 hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Outfit Image */}
              {selectedEntry.outfitImage && (
                <div className="aspect-square max-h-64 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-center p-4 bg-black/5 dark:bg-white/[0.02] overflow-hidden">
                  <img
                    src={selectedEntry.outfitImage}
                    alt="Look preview"
                    className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                  />
                </div>
              )}

              {/* Pieces Breakdown */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-mono uppercase tracking-wider opacity-50">Pieces in this look</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto overscroll-contain pr-1">
                  {Object.entries(selectedEntry.slotItems || {}).flatMap(([cat, itemsList]) =>
                    (itemsList || []).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl border border-black/10 dark:border-white/10 flex items-center gap-2 bg-[#f4f3ec] dark:bg-[#20222a]"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-contain flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold truncate">{item.name}</p>
                          <p className="text-[9px] font-mono opacity-50 uppercase">{cat}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="p-3 text-red-500 hover:text-red-400 border border-red-500/20 rounded-xl flex items-center gap-1 text-xs font-mono transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  style={{ backgroundColor: accent.hex }}
                  className="py-2.5 px-6 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------
          Empty Day Prompt Modal
          -------------------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedEmptyDate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#18191e] rounded-[2.5rem] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-black/10 dark:border-white/10 flex flex-col items-center"
            >
              <div
                style={{ backgroundColor: `${accent.hex}18`, color: accent.hex }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <Shirt className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono opacity-60 uppercase tracking-wider font-semibold">
                  {new Date(selectedEmptyDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <h3 className="text-xl font-black tracking-tight">No Look Recorded</h3>
                <p className="text-xs font-mono opacity-60">
                  Ready to style? Head over to Studio and assemble a signature look.
                </p>
              </div>

              <div className="w-full flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmptyDate(null)}
                  className="flex-1 py-2.5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono font-semibold"
                >
                  Cancel
                </button>
                <Link
                  href="/create"
                  style={{ backgroundColor: accent.hex }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
