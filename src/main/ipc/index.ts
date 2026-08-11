import { registerSystemIpcHandlers } from './systemHandler';
import { registerDatabaseIpcHandlers } from './databaseHandler';
import { registerTaskIpcHandlers } from './taskHandler';
import { registerEngagementIpcHandlers } from './engagementHandler';
import { registerDailyExperienceHandlers } from './dailyExperienceHandler';
import { registerAnalyticsIpcHandlers } from './analyticsHandler';
import { registerNotificationIpcHandlers } from './notificationHandler';

export function registerIpcHandlers(): void {
  registerSystemIpcHandlers();
  registerDatabaseIpcHandlers();
  registerTaskIpcHandlers();
  registerEngagementIpcHandlers();
  registerDailyExperienceHandlers();
  registerAnalyticsIpcHandlers();
  registerNotificationIpcHandlers();
}



