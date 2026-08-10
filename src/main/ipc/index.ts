import { registerSystemIpcHandlers } from './systemHandler';
import { registerDatabaseIpcHandlers } from './databaseHandler';
import { registerTaskIpcHandlers } from './taskHandler';

export function registerIpcHandlers(): void {
  registerSystemIpcHandlers();
  registerDatabaseIpcHandlers();
  registerTaskIpcHandlers();
}
