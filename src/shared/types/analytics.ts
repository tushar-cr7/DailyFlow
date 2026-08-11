export type AnalyticsTimeRange = '7d' | '30d' | 'month';

export interface AnalyticsQueryDTO {
  range: AnalyticsTimeRange;
  referenceDate?: string; // YYYY-MM-DD
}

export interface ProductivityOverview {
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number; // 0 - 100
  scheduledCount: number;
  unscheduledCount: number;
  overdueCount: number;
  totalFocusMinutes: number;
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
}

export interface DailyAnalyticsPoint {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. "Mon"
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number; // 0 - 100
  focusMinutes: number;
  xpEarned: number;
  isPerfectDay: boolean;
}

export interface ProductivityPatterns {
  mostProductiveDayOfWeek: { day: string; count: number } | null;
  peakFocusHour: { hour: number; formattedHour: string } | null;
  scheduledCompletionRate: number;
  unscheduledCompletionRate: number;
  overdueRate: number;
}

export interface ProductivityInsight {
  id: string;
  category: 'completion' | 'focus' | 'streak' | 'scheduling' | 'pattern';
  title: string;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

export interface AnalyticsReport {
  timeRange: AnalyticsTimeRange;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  overview: ProductivityOverview;
  dailySeries: DailyAnalyticsPoint[];
  patterns: ProductivityPatterns;
  insights: ProductivityInsight[];
}
