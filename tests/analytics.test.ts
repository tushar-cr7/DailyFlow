import { describe, it, expect } from 'vitest';
import {
  resolveDateRange,
  generateAnalyticsReport,
  getDayOfWeekName,
  getFullDayOfWeekName,
  type FocusSessionRaw,
} from '../src/shared/utils/analytics';
import type { Task } from '../src/shared/types/task';
import type { UserEngagementState, DailyEngagementLog } from '../src/shared/types/engagement';

describe('Analytics Utility & Pure Calculation Engine', () => {
  const mockUserEngagement: UserEngagementState = {
    totalXp: 120,
    currentLevel: 2,
    currentStreak: 4,
    longestStreak: 5,
    lastActiveDate: '2026-08-11',
    perfectDaysCount: 2,
    updatedAt: '2026-08-11T12:00:00Z',
  };

  it('resolves date ranges deterministically without hidden Date.now()', () => {
    const range7d = resolveDateRange('7d', '2026-08-11');
    expect(range7d.startDate).toBe('2026-08-05');
    expect(range7d.endDate).toBe('2026-08-11');
    expect(range7d.dates.length).toBe(7);

    const range30d = resolveDateRange('30d', '2026-08-11');
    expect(range30d.startDate).toBe('2026-07-13');
    expect(range30d.endDate).toBe('2026-08-11');
    expect(range30d.dates.length).toBe(30);

    const rangeMonth = resolveDateRange('month', '2026-08-11');
    expect(rangeMonth.startDate).toBe('2026-08-01');
    expect(rangeMonth.endDate).toBe('2026-08-11');
    expect(rangeMonth.dates.length).toBe(11);
  });

  it('formats day names accurately', () => {
    expect(getDayOfWeekName('2026-08-11')).toBe('Tue');
    expect(getFullDayOfWeekName('2026-08-11')).toBe('Tuesday');
  });

  it('handles zero tasks and empty data gracefully', () => {
    const report = generateAnalyticsReport(
      [],
      [],
      [],
      mockUserEngagement,
      '7d',
      '2026-08-11',
    );

    expect(report.overview.tasksCreated).toBe(0);
    expect(report.overview.tasksCompleted).toBe(0);
    expect(report.overview.completionRate).toBe(0);
    expect(report.overview.totalFocusMinutes).toBe(0);
    expect(report.patterns.mostProductiveDayOfWeek).toBeNull();
    expect(report.patterns.peakFocusHour).toBeNull();
    expect(report.insights.length).toBeGreaterThan(0);
    expect(report.insights[0].id).toBe('ins-empty');
  });

  it('calculates overview metrics and daily series points accurately', () => {
    const sampleTasks: Task[] = [
      {
        id: 't1',
        title: 'Task One',
        description: null,
        date: '2026-08-10',
        scheduledTime: '09:00',
        isCompleted: true,
        createdAt: '2026-08-10T09:00:00Z',
        updatedAt: '2026-08-10T09:00:00Z',
      },
      {
        id: 't2',
        title: 'Task Two',
        description: null,
        date: '2026-08-11',
        scheduledTime: '14:00',
        isCompleted: true,
        createdAt: '2026-08-11T09:00:00Z',
        updatedAt: '2026-08-11T09:00:00Z',
      },
      {
        id: 't3',
        title: 'Task Three',
        description: null,
        date: '2026-08-11',
        scheduledTime: null,
        isCompleted: false,
        createdAt: '2026-08-11T09:00:00Z',
        updatedAt: '2026-08-11T09:00:00Z',
      },
    ];

    const sampleLogs: DailyEngagementLog[] = [
      {
        date: '2026-08-10',
        tasksScheduled: 1,
        tasksCompleted: 1,
        isPerfectDay: true,
        xpEarned: 30,
        updatedAt: '2026-08-10T20:00:00Z',
      },
      {
        date: '2026-08-11',
        tasksScheduled: 2,
        tasksCompleted: 1,
        isPerfectDay: false,
        xpEarned: 25,
        updatedAt: '2026-08-11T20:00:00Z',
      },
    ];

    const sampleFocus: FocusSessionRaw[] = [
      {
        id: 'f1',
        taskId: 't1',
        date: '2026-08-10',
        durationSeconds: 1500, // 25 mins
        completedAt: '2026-08-10T10:00:00Z',
      },
      {
        id: 'f2',
        taskId: 't2',
        date: '2026-08-11',
        durationSeconds: 3000, // 50 mins
        completedAt: '2026-08-11T15:00:00Z',
      },
      {
        id: 'f3',
        taskId: null,
        date: '2026-08-11',
        durationSeconds: 1500, // 25 mins
        completedAt: '2026-08-11T16:00:00Z',
      },
    ];

    const report = generateAnalyticsReport(
      sampleTasks,
      sampleLogs,
      sampleFocus,
      mockUserEngagement,
      '7d',
      '2026-08-11',
    );

    expect(report.overview.tasksCreated).toBe(3);
    expect(report.overview.tasksCompleted).toBe(2);
    expect(report.overview.completionRate).toBe(67); // 2/3 = 66.6% -> 67%
    expect(report.overview.totalFocusMinutes).toBe(100); // 25 + 50 + 25
    expect(report.overview.xpEarned).toBe(55); // 30 + 25

    expect(report.dailySeries.length).toBe(7);
  });

  it('enforces safeguard 9: peak focus hour is reported ONLY when focusSession count >= 3', () => {
    const insufficientSessions: FocusSessionRaw[] = [
      { id: 'f1', taskId: null, date: '2026-08-10', durationSeconds: 1500, completedAt: '2026-08-10T10:00:00' },
      { id: 'f2', taskId: null, date: '2026-08-11', durationSeconds: 1500, completedAt: '2026-08-11T10:00:00' },
    ];

    const reportInsufficient = generateAnalyticsReport(
      [],
      [],
      insufficientSessions,
      mockUserEngagement,
      '7d',
      '2026-08-11',
    );

    expect(reportInsufficient.patterns.peakFocusHour).toBeNull();

    const sufficientSessions: FocusSessionRaw[] = [
      ...insufficientSessions,
      { id: 'f3', taskId: null, date: '2026-08-11', durationSeconds: 1500, completedAt: '2026-08-11T10:30:00' },
    ];


    const reportSufficient = generateAnalyticsReport(
      [],
      [],
      sufficientSessions,
      mockUserEngagement,
      '7d',
      '2026-08-11',
    );

    expect(reportSufficient.patterns.peakFocusHour).not.toBeNull();
    expect(reportSufficient.patterns.peakFocusHour?.hour).toBe(10);
    expect(reportSufficient.patterns.peakFocusHour?.formattedHour).toBe('10:00 AM');
  });
});
