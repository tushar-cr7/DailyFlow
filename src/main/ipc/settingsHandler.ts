import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import type { IpcResult } from '../../shared/types/ipc';
import type { UserSettings, UpdateUserSettingsDTO } from '../../shared/types/settings';
import { getUserSettings, updateUserSettings } from '../database/settingsRepository';
import {
  exportUserDataToFile,
  importUserDataFromFile,
  resetApplicationData,
} from '../services/dataManagementService';

export function registerSettingsHandlers(): void {
  // GET settings
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.GET,
    async (): Promise<IpcResult<UserSettings>> => {
      try {
        const settings = getUserSettings();
        return { success: true, data: settings };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to fetch settings',
        };
      }
    },
  );

  // UPDATE settings
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.UPDATE,
    async (_event, dto: UpdateUserSettingsDTO): Promise<IpcResult<UserSettings>> => {
      try {
        const settings = updateUserSettings(dto);
        return { success: true, data: settings };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update settings',
        };
      }
    },
  );

  // EXPORT user data
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.EXPORT,
    async (): Promise<IpcResult<{ exported: boolean; filePath?: string }>> => {
      try {
        const res = await exportUserDataToFile();
        return { success: true, data: res };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to export backup data',
        };
      }
    },
  );

  // IMPORT user data
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.IMPORT,
    async (): Promise<IpcResult<{ imported: boolean; taskCount: number }>> => {
      try {
        const res = await importUserDataFromFile();
        return { success: true, data: res };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to import backup data',
        };
      }
    },
  );

  // RESET app data
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.RESET,
    async (_event, confirmation: string): Promise<IpcResult<{ reset: boolean }>> => {
      try {
        const res = resetApplicationData(confirmation);
        return { success: true, data: res };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to reset application data',
        };
      }
    },
  );
}
