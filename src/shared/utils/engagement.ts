import type {
  LevelInfo,
  AchievementDefinition,
  AchievementProgress,
} from '../types/engagement';
import { INITIAL_ACHIEVEMENTS } from '../constants/achievements';
import { shiftDateString } from './date';

/**
 * Calculates XP earned for completing an individual task.
 * - Base completion = +10 XP
 * - Scheduled time bonus = +5 XP (+15 XP total if scheduled)
 */
export function calculateTaskXp(task: { isCompleted: boolean; scheduledTime: string | null }): number {
  if (!task.isCompleted) return 0;
  const base = 10;
  const scheduledBonus = task.scheduledTime && task.scheduledTime.trim().length > 0 ? 5 : 0;
  return base + scheduledBonus;
}

/**
 * Calculates daily milestone bonus XP based on total tasks completed on a date.
 * - 1st task: +5 XP
 * - 3rd task: +15 XP
 * - 5th task: +25 XP
 */
export function calculateDailyMilestoneXp(completedCountForDay: number): number {
  let bonus = 0;
  if (completedCountForDay >= 1) bonus += 5;
  if (completedCountForDay >= 3) bonus += 15;
  if (completedCountForDay >= 5) bonus += 25;
  return bonus;
}

/**
 * Determines if a day is a Perfect Day and returns bonus XP.
 * A Perfect Day requires at least 1 scheduled task, and 100% of tasks for that date completed.
 */
export function calculatePerfectDayXp(
  tasksScheduled: number,
  tasksCompleted: number,
): { isPerfect: boolean; xpBonus: number } {
  if (tasksScheduled > 0 && tasksCompleted === tasksScheduled) {
    return { isPerfect: true, xpBonus: 50 };
  }
  return { isPerfect: false, xpBonus: 0 };
}

/**
 * Calculates level details from total accumulated XP using quadratic progression:
 * Level Threshold = 50 * (Level - 1)^2
 * Level 1: 0 - 49 XP
 * Level 2: 50 - 199 XP
 * Level 3: 200 - 449 XP
 * Level 4: 450 - 799 XP
 * Level 5: 800+ XP
 */
export function calculateLevelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, totalXp);
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const currentLevelXp = 50 * Math.pow(level - 1, 2);
  const nextLevelXp = 50 * Math.pow(level, 2);
  const xpInLevel = xp - currentLevelXp;
  const xpRequiredForNext = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.min(
    100,
    Math.floor((xpInLevel / xpRequiredForNext) * 100),
  );

  return {
    level,
    totalXp: xp,
    currentLevelXp,
    nextLevelXp,
    xpInLevel,
    xpRequiredForNext,
    progressPercentage,
  };
}

/**
 * Calculates current streak given a list of dates with completions (active dates)
 * and today's date string (YYYY-MM-DD).
 */
export function calculateStreak(
  activeDates: string[],
  todayDateStr: string,
): { currentStreak: number; lastActiveDate: string | null } {
  const sortedUniqueDates = Array.from(new Set(activeDates)).sort((a, b) => (a > b ? -1 : 1));

  if (sortedUniqueDates.length === 0) {
    return { currentStreak: 0, lastActiveDate: null };
  }

  const lastActiveDate = sortedUniqueDates[0] ?? null;
  const yesterdayStr = shiftDateString(todayDateStr, -1);

  // Check where the streak anchor date is (today or yesterday)
  let checkDate: string | null = null;

  if (sortedUniqueDates.includes(todayDateStr)) {
    checkDate = todayDateStr;
  } else if (sortedUniqueDates.includes(yesterdayStr)) {
    checkDate = yesterdayStr;
  } else {
    // Neither today nor yesterday had completions -> streak is broken (0)
    return { currentStreak: 0, lastActiveDate };
  }

  let streak = 0;
  while (checkDate && sortedUniqueDates.includes(checkDate)) {
    streak++;
    checkDate = shiftDateString(checkDate, -1);
  }

  return { currentStreak: streak, lastActiveDate };
}

/**
 * Evaluates achievement progress based on user stats and existing unlock records.
 */
export function evaluateAchievements(params: {
  totalTasksCompleted: number;
  currentStreak: number;
  perfectDaysCount: number;
  existingUnlocked: Map<string, { isUnlocked: boolean; unlockedAt: string | null }>;
  definitions?: AchievementDefinition[];
}): AchievementProgress[] {
  const definitions = params.definitions || INITIAL_ACHIEVEMENTS;

  return definitions.map((def) => {
    const existing = params.existingUnlocked.get(def.id);
    let currentValue = 0;

    switch (def.category) {
      case 'completion':
        currentValue = params.totalTasksCompleted;
        break;
      case 'streak':
        currentValue = params.currentStreak;
        break;
      case 'perfect_day':
        currentValue = params.perfectDaysCount;
        break;
      default:
        currentValue = 0;
    }

    const isUnlocked = existing?.isUnlocked || currentValue >= def.targetValue;
    const unlockedAt = existing?.unlockedAt || (isUnlocked ? new Date().toISOString() : null);

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      xpBonus: def.xpBonus,
      targetValue: def.targetValue,
      currentValue: Math.min(currentValue, def.targetValue),
      isUnlocked,
      unlockedAt,
    };
  });
}
