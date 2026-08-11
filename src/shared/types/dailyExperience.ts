import type { Task } from './task';
import type { EngagementStats } from './engagement';

export type PaceStatus = 'ahead' | 'on_track' | 'needs_momentum' | 'completed';

export interface FocusSession {
  id: string;
  taskId: string | null;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  completedAt: string; // ISO timestamp
  createdAt: string;
}

export interface LogFocusSessionDTO {
  taskId?: string | null;
  durationSeconds: number;
  date?: string; // YYYY-MM-DD, defaults to today
}

export interface DailyBriefing {
  date: string; // YYYY-MM-DD
  greeting: string;
  quote: string;
  totalScheduled: number;
  completedCount: number;
  overdueCount: number;
  remainingCount: number;
  primaryFocusTask: Task | null;
  paceStatus: PaceStatus;
  estimatedMinutesRemaining: number;
  potentialXpRemaining: number;
  isPerfectDay: boolean;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  totalScheduled: number;
  completedCount: number;
  totalFocusMinutes: number;
  xpEarned: number;
  isPerfectDay: boolean;
  reflection: string | null;
  isSummaryReviewed: boolean;
  engagement: EngagementStats;
}
