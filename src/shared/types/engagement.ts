export type AchievementCategory = 'streak' | 'completion' | 'perfect_day' | 'scheduling';

export interface UserEngagementState {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  perfectDaysCount: number;
  updatedAt: string;
}

export interface DailyEngagementLog {
  date: string; // YYYY-MM-DD
  tasksScheduled: number;
  tasksCompleted: number;
  isPerfectDay: boolean;
  xpEarned: number;
  updatedAt: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpBonus: number;
  targetValue: number;
}

export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpBonus: number;
  targetValue: number;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInLevel: number;
  xpRequiredForNext: number;
  progressPercentage: number;
}

export interface EngagementStats {
  state: UserEngagementState;
  levelInfo: LevelInfo;
  todayLog: DailyEngagementLog;
  achievements: AchievementProgress[];
}
