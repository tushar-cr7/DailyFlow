import type { ScheduleStatus } from '../types/task';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const parts = parseDateParts(dateStr);
  const date = new Date(parts.year, parts.month - 1, parts.day);
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  );
}
export function normalizeTimeString(timeStr: string): string | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim().toLowerCase();
  if (!trimmed) return null;

  // Check 12-hour format with AM/PM (e.g. "9am", "9:30am", "2:15 pm", "12:00 am")
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch && ampmMatch[1] && ampmMatch[3]) {
    let hr = parseInt(ampmMatch[1], 10);
    const min = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = ampmMatch[3];
    if (hr < 1 || hr > 12 || min < 0 || min > 59) return null;
    if (period === 'pm' && hr < 12) hr += 12;
    if (period === 'am' && hr === 12) hr = 0;
    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  // Check 24-hour format (e.g. "09:30", "9:30", "14:00", "09:30:00")
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (match && match[1] && match[2]) {
    const hours = String(match[1]).padStart(2, '0');
    const minutes = String(match[2]).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Check short digits like "900", "1430"
  const digitsMatch = trimmed.match(/^(\d{3,4})$/);
  if (digitsMatch && digitsMatch[1]) {
    const val = digitsMatch[1].padStart(4, '0');
    const hr = parseInt(val.slice(0, 2), 10);
    const min = parseInt(val.slice(2, 4), 10);
    if (hr >= 0 && hr <= 23 && min >= 0 && min <= 59) {
      return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }

  return null;
}

export function isValidTimeString(timeStr: string): boolean {
  return normalizeTimeString(timeStr) !== null;
}

export function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-').map(Number);
  return {
    year: parts[0] ?? 2026,
    month: parts[1] ?? 1,
    day: parts[2] ?? 1,
  };
}

export function createLocalDate(dateStr: string): Date {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(year, month - 1, day);
}

export function getTodayString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(now: Date = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function shiftDateString(dateStr: string, days: number): string {
  const date = createLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string, todayStr: string = getTodayString()): string {
  if (dateStr === todayStr) {
    return 'Today';
  }
  const tomorrowStr = shiftDateString(todayStr, 1);
  if (dateStr === tomorrowStr) {
    return 'Tomorrow';
  }
  const yesterdayStr = shiftDateString(todayStr, -1);
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Pure, deterministic classification of task schedule status.
 * Receives explicit currentDateStr and currentTimeStr. No hidden Date.now() calls.
 */
export function classifyTask(
  task: { isCompleted: boolean; date: string; scheduledTime: string | null },
  currentDateStr: string,
  currentTimeStr: string,
): ScheduleStatus {
  // 1. Completed Rule
  if (task.isCompleted) {
    return 'completed';
  }

  // 2. Unscheduled Rule (scheduledTime is null/empty)
  if (!task.scheduledTime) {
    return 'unscheduled';
  }

  // 3. Overdue Rule (Incomplete + Scheduled + Past Date/Time)
  const isPastDate = task.date < currentDateStr;
  const isSameDatePastTime = task.date === currentDateStr && task.scheduledTime < currentTimeStr;
  if (isPastDate || isSameDatePastTime) {
    return 'overdue';
  }

  // 4. Today Rule
  if (task.date === currentDateStr) {
    return 'today';
  }

  // 5. Upcoming Rule (+1d through +7d from tomorrow)
  const tomorrowStr = shiftDateString(currentDateStr, 1);
  const sevenDaysEndStr = shiftDateString(currentDateStr, 7);
  if (task.date >= tomorrowStr && task.date <= sevenDaysEndStr) {
    return 'upcoming';
  }

  // 6. Future Rule (+8d and beyond)
  return 'future';
}
