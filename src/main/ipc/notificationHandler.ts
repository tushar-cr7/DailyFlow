import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import type { IpcResult } from '../../shared/types/ipc';
import type {
  NotificationSettings,
  UpdateNotificationSettingsDTO,
} from '../../shared/types/notifications';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../database/notificationRepository';
import { notificationScheduler } from '../services/notificationScheduler';

export function registerNotificationIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION.GET_SETTINGS,
    async (): Promise<IpcResult<NotificationSettings>> => {
      try {
        const settings = getNotificationSettings();
        return { success: true, data: settings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch notification settings.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION.UPDATE_SETTINGS,
    async (
      _event,
      dto: UpdateNotificationSettingsDTO,
    ): Promise<IpcResult<NotificationSettings>> => {
      try {
        const settings = updateNotificationSettings(dto);
        notificationScheduler.rescheduleAll();
        return { success: true, data: settings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update notification settings.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION.TEST_NOTIFICATION,
    async (): Promise<IpcResult<{ sent: boolean }>> => {
      try {
        const testId = `test-${Date.now()}`;
        const sent = notificationScheduler.sendNotification(
          'DailyFlow Test Notification',
          'Desktop notifications are enabled and functioning properly!',
          'task_reminder',
          testId,
        );
        return { success: true, data: { sent } };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to send test notification.',
        };
      }
    },
  );
}
