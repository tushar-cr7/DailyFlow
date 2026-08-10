import { registerSystemIpcHandlers } from './systemHandler';
import { registerDatabaseIpcHandlers } from './databaseHandler';

export function registerIpcHandlers(): void {
  registerSystemIpcHandlers();
  registerDatabaseIpcHandlers();
}
