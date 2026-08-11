import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../shared/types/task';
import type { EngagementStats, AchievementProgress } from '../shared/types/engagement';
import type {
  DailyBriefing,
  DailySummary,
  FocusSession,
  LogFocusSessionDTO,
} from '../shared/types/dailyExperience';
import type { AnalyticsQueryDTO, AnalyticsReport } from '../shared/types/analytics';
import type {
  NotificationSettings,
  UpdateNotificationSettingsDTO,
} from '../shared/types/notifications';

export interface DailyFlowAPI {
  platform: string;
  versions: {
    electron: string;
    chrome: string;
    node: string;
  };
  isSecureContext: boolean;
  getSystemInfo: (request?: SystemInfoRequest) => Promise<IpcResult<SystemInfoResponse>>;
  getDatabaseStatus: () => Promise<IpcResult<DatabaseStatus>>;
  getTasks: (filter?: TaskFilter) => Promise<IpcResult<Task[]>>;
  createTask: (dto: CreateTaskDTO) => Promise<IpcResult<Task>>;
  updateTask: (dto: UpdateTaskDTO) => Promise<IpcResult<Task>>;
  deleteTask: (id: string) => Promise<IpcResult<{ id: string }>>;
  getEngagementStats: (date?: string) => Promise<IpcResult<EngagementStats>>;
  getAchievements: () => Promise<IpcResult<AchievementProgress[]>>;
  recalculateEngagement: (date?: string) => Promise<IpcResult<EngagementStats>>;
  // Phase 8 Daily Experience API
  getDailyBriefing: (date?: string) => Promise<IpcResult<DailyBriefing>>;
  setPrimaryFocus: (taskId: string | null, date?: string) => Promise<IpcResult<DailyBriefing>>;
  logFocusSession: (dto: LogFocusSessionDTO) => Promise<IpcResult<FocusSession>>;
  saveDailyReflection: (reflection: string, date?: string) => Promise<IpcResult<DailySummary>>;
  getDailySummary: (date?: string) => Promise<IpcResult<DailySummary>>;
  // Phase 9 Analytics & Insights API
  getAnalyticsData: (query?: AnalyticsQueryDTO) => Promise<IpcResult<AnalyticsReport>>;
  // Phase 10 Notifications & Automation API
  getNotificationSettings: () => Promise<IpcResult<NotificationSettings>>;
  updateNotificationSettings: (
    dto: UpdateNotificationSettingsDTO,
  ) => Promise<IpcResult<NotificationSettings>>;
  testNotification: () => Promise<IpcResult<{ sent: boolean }>>;
}




declare global {
  interface Window {
    dailyflow: DailyFlowAPI;
  }
}

export {};
