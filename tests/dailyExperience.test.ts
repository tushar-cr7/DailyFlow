import { describe, it, expect } from 'vitest';
import {
  getGreeting,
  getMotivationalQuote,
  calculatePaceStatus,
  buildDailyBriefing,
  FOCUS_SESSION_XP,
} from '../src/shared/utils/dailyExperience';
import type { Task } from '../src/shared/types/task';

describe('Daily Experience Utils', () => {
  it('returns correct time-of-day greeting', () => {
    expect(getGreeting(9)).toBe('Good morning');
    expect(getGreeting(14)).toBe('Good afternoon');
    expect(getGreeting(19)).toBe('Good evening');
  });

  it('provides motivational quotes based on streak and perfect day status', () => {
    const perfectQuote = getMotivationalQuote(2, true);
    expect(perfectQuote).toContain('Perfect Day');

    const streakQuote = getMotivationalQuote(5, false);
    expect(streakQuote).toContain('5-day streak');

    const standardQuote = getMotivationalQuote(0, false);
    expect(typeof standardQuote).toBe('string');
    expect(standardQuote.length).toBeGreaterThan(5);
  });

  it('calculates pace status correctly', () => {
    expect(calculatePaceStatus(5, 5, 14)).toBe('completed');
    expect(calculatePaceStatus(0, 0, 10)).toBe('on_track');
    expect(calculatePaceStatus(10, 8, 12)).toBe('ahead');
    expect(calculatePaceStatus(10, 1, 18)).toBe('needs_momentum');
  });

  it('builds daily briefing snapshot accurately', () => {
    const sampleTasks: Task[] = [
      {
        id: 't-1',
        title: 'Morning Code Review',
        description: null,
        date: '2026-08-11',
        scheduledTime: '09:00',
        isCompleted: true,
        createdAt: '2026-08-11T09:00:00Z',
        updatedAt: '2026-08-11T09:00:00Z',
      },
      {
        id: 't-2',
        title: 'Feature Planning',
        description: 'Design phase 8',
        date: '2026-08-11',
        scheduledTime: '14:00',
        isCompleted: false,
        createdAt: '2026-08-11T09:00:00Z',
        updatedAt: '2026-08-11T09:00:00Z',
      },
    ];

    const overdueTasks: Task[] = [
      {
        id: 't-old',
        title: 'Unfinished Yesterdays Task',
        description: null,
        date: '2026-08-10',
        scheduledTime: null,
        isCompleted: false,
        createdAt: '2026-08-10T09:00:00Z',
        updatedAt: '2026-08-10T09:00:00Z',
      },
    ];

    const briefing = buildDailyBriefing(
      sampleTasks,
      overdueTasks,
      't-2',
      3,
      false,
      '2026-08-11',
      10,
    );

    expect(briefing.totalScheduled).toBe(2);
    expect(briefing.completedCount).toBe(1);
    expect(briefing.remainingCount).toBe(1);
    expect(briefing.overdueCount).toBe(1);
    expect(briefing.primaryFocusTask?.id).toBe('t-2');
    expect(briefing.estimatedMinutesRemaining).toBe(25);
    expect(briefing.potentialXpRemaining).toBe(15);
  });

  it('defines correct focus session XP reward', () => {
    expect(FOCUS_SESSION_XP).toBe(15);
  });
});
