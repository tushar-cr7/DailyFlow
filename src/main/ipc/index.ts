import { registerSystemIpcHandlers } from './systemHandler';
import { registerDatabaseIpcHandlers } from './databaseHandler';
import { registerTaskIpcHandlers } from './taskHandler';
import { registerEngagementIpcHandlers } from './engagementHandler';
import { registerDailyExperienceHandlers } from './dailyExperienceHandler';

export function registerIpcHandlers(): void {
  registerSystemIpcHandlers();
  registerDatabaseIpcHandlers();
  registerTaskIpcHandlers();
  registerEngagementIpcHandlers();
  registerDailyExperienceHandlers();
}

