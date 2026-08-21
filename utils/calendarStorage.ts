import { get, set } from 'idb-keyval';
import { CalendarEntry, ClothingItem, StreakData } from '@/types';

export const CALENDAR_STORAGE_KEY = 'clotho_calendar_outfits';
export const STREAK_STORAGE_KEY = 'clotho_outfit_streak';

/**
 * Format Date to local YYYY-MM-DD
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into Date at local midnight
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate Duolingo-style streak from a list of logged dates
 */
export function calculateStreak(dates: string[]): StreakData {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLoggedDate: null, history: [] };
  }

  // Deduplicate and sort dates descending
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let currentStreak = 0;
  let longestStreak = 0;

  // Check if current streak is active (logged today or yesterday)
  const mostRecent = uniqueDates[0];
  const isStreakActive = mostRecent === todayStr || mostRecent === yesterdayStr;

  if (isStreakActive) {
    let checkDate = parseLocalDate(mostRecent);
    for (const dStr of uniqueDates) {
      const d = parseLocalDate(dStr);
      const diffDays = Math.round((checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (diffDays === 1) {
        currentStreak++;
        checkDate = new Date(d);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest historical streak
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Sort ascending for historical count
  const ascDates = [...uniqueDates].sort();
  for (const dStr of ascDates) {
    const d = parseLocalDate(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = d;
  }

  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return {
    currentStreak,
    longestStreak,
    lastLoggedDate: mostRecent || null,
    history: uniqueDates,
  };
}

/**
 * Fetch all calendar outfit records
 */
export async function getCalendarEntries(): Promise<CalendarEntry[]> {
  const entries = await get<CalendarEntry[]>(CALENDAR_STORAGE_KEY);
  return entries || [];
}

/**
 * Fetch current streak data
 */
export async function getStreakData(): Promise<StreakData> {
  const entries = await getCalendarEntries();
  const dates = entries.map((e) => e.date);
  return calculateStreak(dates);
}

/**
 * Save or replace an outfit entry for a date
 */
export async function saveCalendarEntry(entry: CalendarEntry): Promise<{ entries: CalendarEntry[]; streak: StreakData }> {
  const entries = await getCalendarEntries();
  // If an entry already exists for this date, replace it; otherwise prepend
  const filtered = entries.filter((e) => e.date !== entry.date && e.id !== entry.id);
  const updated = [entry, ...filtered];

  await set(CALENDAR_STORAGE_KEY, updated);

  const dates = updated.map((e) => e.date);
  const streak = calculateStreak(dates);
  await set(STREAK_STORAGE_KEY, streak);

  return { entries: updated, streak };
}

/**
 * Delete a calendar outfit entry
 */
export async function deleteCalendarEntry(id: string): Promise<{ entries: CalendarEntry[]; streak: StreakData }> {
  const entries = await getCalendarEntries();
  const updated = entries.filter((e) => e.id !== id);

  await set(CALENDAR_STORAGE_KEY, updated);

  const dates = updated.map((e) => e.date);
  const streak = calculateStreak(dates);
  await set(STREAK_STORAGE_KEY, streak);

  return { entries: updated, streak };
}

/**
 * Compute "Most Worn This Month" piece
 */
export function getMostWornPiece(
  yearMonthStr: string, // YYYY-MM
  entries: CalendarEntry[]
): { item: ClothingItem; daysCount: number } | null {
  const monthEntries = entries.filter((e) => e.date.startsWith(yearMonthStr));
  if (monthEntries.length === 0) return null;

  const itemCounts = new Map<string, { item: ClothingItem; count: number }>();

  for (const entry of monthEntries) {
    if (!entry.slotItems) continue;
    for (const itemsList of Object.values(entry.slotItems)) {
      if (!Array.isArray(itemsList)) continue;
      for (const item of itemsList) {
        if (!item || !item.id) continue;
        const current = itemCounts.get(item.id);
        if (current) {
          current.count += 1;
        } else {
          itemCounts.set(item.id, { item, count: 1 });
        }
      }
    }
  }

  let topPiece: { item: ClothingItem; daysCount: number } | null = null;
  for (const { item, count } of Array.from(itemCounts.values())) {
    if (!topPiece || count > topPiece.daysCount) {
      topPiece = { item, daysCount: count };
    }
  }

  return topPiece;
}
