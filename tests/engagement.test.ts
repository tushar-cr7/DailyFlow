import { describe, expect, it } from 'vitest';
import {
  calculateTaskXp,
  calculateDailyMilestoneXp,
  calculatePerfectDayXp,
  calculateLevelInfo,
  calculateStreak,
  evaluateAchievements,
} from '../src/shared/utils/engagement';

describe('Engagement Engine — Pure Calculation Logic (Phase 7)', () => {
  describe('calculateTaskXp', () => {
    it('returns 0 for incomplete tasks', () => {
      expect(calculateTaskXp({ isCompleted: false, scheduledTime: null })).toBe(0);
      expect(calculateTaskXp({ isCompleted: false, scheduledTime: '10:00' })).toBe(0);
    });

    it('returns +10 XP for unscheduled completed tasks', () => {
      expect(calculateTaskXp({ isCompleted: true, scheduledTime: null })).toBe(10);
      expect(calculateTaskXp({ isCompleted: true, scheduledTime: '' })).toBe(10);
    });

    it('returns +15 XP (+10 base + +5 scheduled bonus) for scheduled completed tasks', () => {
      expect(calculateTaskXp({ isCompleted: true, scheduledTime: '09:30' })).toBe(15);
      expect(calculateTaskXp({ isCompleted: true, scheduledTime: '14:00' })).toBe(15);
    });
  });

  describe('calculateDailyMilestoneXp', () => {
    it('returns 0 for 0 completed tasks', () => {
      expect(calculateDailyMilestoneXp(0)).toBe(0);
    });

    it('returns +5 XP bonus for completing 1st task', () => {
      expect(calculateDailyMilestoneXp(1)).toBe(5);
      expect(calculateDailyMilestoneXp(2)).toBe(5);
    });

    it('returns +20 XP bonus (+5 + +15) for completing 3 or 4 tasks', () => {
      expect(calculateDailyMilestoneXp(3)).toBe(20);
      expect(calculateDailyMilestoneXp(4)).toBe(20);
    });

    it('returns +45 XP bonus (+5 + +15 + +25) for completing 5 or more tasks', () => {
      expect(calculateDailyMilestoneXp(5)).toBe(45);
      expect(calculateDailyMilestoneXp(10)).toBe(45);
    });
  });

  describe('calculatePerfectDayXp', () => {
    it('returns isPerfect = false and 0 XP when no tasks are scheduled', () => {
      expect(calculatePerfectDayXp(0, 0)).toEqual({ isPerfect: false, xpBonus: 0 });
    });

    it('returns isPerfect = false when partially completed', () => {
      expect(calculatePerfectDayXp(3, 2)).toEqual({ isPerfect: false, xpBonus: 0 });
    });

    it('returns isPerfect = true and +50 XP bonus when 100% of tasks are completed', () => {
      expect(calculatePerfectDayXp(1, 1)).toEqual({ isPerfect: true, xpBonus: 50 });
      expect(calculatePerfectDayXp(5, 5)).toEqual({ isPerfect: true, xpBonus: 50 });
    });
  });

  describe('calculateLevelInfo', () => {
    it('calculates level 1 for 0 to 49 XP', () => {
      const lvl0 = calculateLevelInfo(0);
      expect(lvl0.level).toBe(1);
      expect(lvl0.xpInLevel).toBe(0);
      expect(lvl0.xpRequiredForNext).toBe(50);
      expect(lvl0.progressPercentage).toBe(0);

      const lvl49 = calculateLevelInfo(49);
      expect(lvl49.level).toBe(1);
      expect(lvl49.xpInLevel).toBe(49);
      expect(lvl49.progressPercentage).toBe(98);
    });

    it('calculates level 2 for 50 to 199 XP', () => {
      const lvl50 = calculateLevelInfo(50);
      expect(lvl50.level).toBe(2);
      expect(lvl50.currentLevelXp).toBe(50);
      expect(lvl50.nextLevelXp).toBe(200);
      expect(lvl50.xpInLevel).toBe(0);
      expect(lvl50.xpRequiredForNext).toBe(150);
      expect(lvl50.progressPercentage).toBe(0);
    });

    it('calculates level 3 for 200 XP', () => {
      const lvl200 = calculateLevelInfo(200);
      expect(lvl200.level).toBe(3);
      expect(lvl200.currentLevelXp).toBe(200);
      expect(lvl200.nextLevelXp).toBe(450);
      expect(lvl200.xpInLevel).toBe(0);
    });
  });

  describe('calculateStreak', () => {
    it('returns 0 streak when activeDates is empty', () => {
      expect(calculateStreak([], '2026-08-10')).toEqual({ currentStreak: 0, lastActiveDate: null });
    });

    it('returns 1 streak when today is the only active date', () => {
      expect(calculateStreak(['2026-08-10'], '2026-08-10')).toEqual({
        currentStreak: 1,
        lastActiveDate: '2026-08-10',
      });
    });

    it('maintains streak from yesterday if today has no completions yet', () => {
      const active = ['2026-08-09', '2026-08-08'];
      expect(calculateStreak(active, '2026-08-10')).toEqual({
        currentStreak: 2,
        lastActiveDate: '2026-08-09',
      });
    });

    it('calculates multi-day consecutive streak including today', () => {
      const active = ['2026-08-10', '2026-08-09', '2026-08-08'];
      expect(calculateStreak(active, '2026-08-10')).toEqual({
        currentStreak: 3,
        lastActiveDate: '2026-08-10',
      });
    });

    it('resets streak to 0 if yesterday was missed and today has no completion yet', () => {
      const active = ['2026-08-08']; // missed 2026-08-09
      expect(calculateStreak(active, '2026-08-10')).toEqual({
        currentStreak: 0,
        lastActiveDate: '2026-08-08',
      });
    });
  });

  describe('evaluateAchievements', () => {
    it('unlocks first_step when completing 1 task', () => {
      const results = evaluateAchievements({
        totalTasksCompleted: 1,
        currentStreak: 1,
        perfectDaysCount: 0,
        existingUnlocked: new Map(),
      });

      const firstStep = results.find((a) => a.id === 'first_step');
      expect(firstStep?.isUnlocked).toBe(true);
      expect(firstStep?.currentValue).toBe(1);

      const task10 = results.find((a) => a.id === 'task_master_10');
      expect(task10?.isUnlocked).toBe(false);
      expect(task10?.currentValue).toBe(1);
    });

    it('unlocks streak_3 when maintaining a 3-day streak', () => {
      const results = evaluateAchievements({
        totalTasksCompleted: 5,
        currentStreak: 3,
        perfectDaysCount: 0,
        existingUnlocked: new Map(),
      });

      const streak3 = results.find((a) => a.id === 'streak_3');
      expect(streak3?.isUnlocked).toBe(true);

      const streak7 = results.find((a) => a.id === 'streak_7');
      expect(streak7?.isUnlocked).toBe(false);
    });
  });
});
