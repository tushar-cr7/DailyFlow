import { describe, expect, it } from 'vitest';
import {
  isValidDateString,
  isValidTimeString,
  parseDateParts,
  createLocalDate,
  shiftDateString,
  getTodayString,
  getCurrentTimeString,
  classifyTask,
} from '../src/shared/utils/date';

describe('Date & Time Utilities & Deterministic Scheduling Classification (Phase 5)', () => {
  describe('isValidDateString & isValidTimeString', () => {
    it('validates correct YYYY-MM-DD date strings', () => {
      expect(isValidDateString('2026-08-10')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
      expect(isValidDateString('2026-02-29')).toBe(false); // Invalid leap date
      expect(isValidDateString('10-08-2026')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
    });

    it('validates 24-hour HH:mm time strings', () => {
      expect(isValidTimeString('00:00')).toBe(true);
      expect(isValidTimeString('14:30')).toBe(true);
      expect(isValidTimeString('23:59')).toBe(true);
      expect(isValidTimeString('24:00')).toBe(false);
      expect(isValidTimeString('9:30')).toBe(false);
    });
  });

  describe('parseDateParts & createLocalDate & shiftDateString', () => {
    it('parses year, month, and day correctly', () => {
      expect(parseDateParts('2026-08-10')).toEqual({ year: 2026, month: 8, day: 10 });
    });

    it('creates local Date object without UTC timezone offset shift', () => {
      const date = createLocalDate('2026-08-10');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(7); // 0-indexed month
      expect(date.getDate()).toBe(10);
    });

    it('shifts date strings across months and leap years in local time', () => {
      expect(shiftDateString('2026-08-10', 1)).toBe('2026-08-11');
      expect(shiftDateString('2026-08-10', -1)).toBe('2026-08-09');
      expect(shiftDateString('2026-08-31', 1)).toBe('2026-09-01');
      expect(shiftDateString('2024-02-28', 1)).toBe('2024-02-29'); // Leap year
    });
  });

  describe('getTodayString & getCurrentTimeString', () => {
    it('returns YYYY-MM-DD for getTodayString', () => {
      const mockDate = new Date(2026, 7, 10, 14, 30);
      expect(getTodayString(mockDate)).toBe('2026-08-10');
    });

    it('returns HH:mm for getCurrentTimeString', () => {
      const mockDate = new Date(2026, 7, 10, 9, 5);
      expect(getCurrentTimeString(mockDate)).toBe('09:05');
    });
  });

  describe('classifyTask Precedence & Scheduling Rules', () => {
    const current = '2026-08-10';
    const currentTime = '12:00';

    it('1. classifies completed tasks as "completed" regardless of date or time', () => {
      expect(
        classifyTask({ isCompleted: true, date: '2026-08-01', scheduledTime: '10:00' }, current, currentTime),
      ).toBe('completed');

      expect(
        classifyTask({ isCompleted: true, date: '2026-08-10', scheduledTime: null }, current, currentTime),
      ).toBe('completed');
    });

    it('2. classifies tasks with null scheduledTime as "unscheduled"', () => {
      // Unscheduled on past date (NEVER overdue)
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-01', scheduledTime: null }, current, currentTime),
      ).toBe('unscheduled');

      // Unscheduled today
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-10', scheduledTime: null }, current, currentTime),
      ).toBe('unscheduled');

      // Unscheduled in future (NEVER upcoming/future based solely on date)
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-20', scheduledTime: null }, current, currentTime),
      ).toBe('unscheduled');
    });

    it('3. classifies incomplete scheduled tasks past date/time as "overdue"', () => {
      // Past date with scheduled time
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-09', scheduledTime: '15:00' }, current, currentTime),
      ).toBe('overdue');

      // Today with past scheduled time (11:59 < 12:00)
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-10', scheduledTime: '11:59' }, current, currentTime),
      ).toBe('overdue');
    });

    it('4. classifies incomplete scheduled tasks today with future/exact time as "today"', () => {
      // Exact current time is not overdue
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-10', scheduledTime: '12:00' }, current, currentTime),
      ).toBe('today');

      // Future time today (14:30 > 12:00)
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-10', scheduledTime: '14:30' }, current, currentTime),
      ).toBe('today');
    });

    it('5. classifies incomplete scheduled tasks from +1d to +7d as "upcoming"', () => {
      // Tomorrow (+1d)
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-11', scheduledTime: '09:00' }, current, currentTime),
      ).toBe('upcoming');

      // +7 days
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-17', scheduledTime: '09:00' }, current, currentTime),
      ).toBe('upcoming');
    });

    it('6. classifies incomplete scheduled tasks from +8d and beyond as "future"', () => {
      // +8 days
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-18', scheduledTime: '09:00' }, current, currentTime),
      ).toBe('future');

      // Scheduled task in distant future must NEVER be unscheduled
      expect(
        classifyTask({ isCompleted: false, date: '2026-12-25', scheduledTime: '10:00' }, current, currentTime),
      ).toBe('future');
    });

    it('handles midnight boundary transitions', () => {
      // Evaluating a 23:59 task at 00:00 next day
      expect(
        classifyTask({ isCompleted: false, date: '2026-08-10', scheduledTime: '23:59' }, '2026-08-11', '00:00'),
      ).toBe('overdue');
    });
  });
});
