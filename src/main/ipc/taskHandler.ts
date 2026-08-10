import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  validateDeleteTaskInput,
  validateTaskFilter,
} from '../../shared/utils/validation';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../database/taskRepository';
import type { Task } from '../../shared/types/task';
import type { IpcResult } from '../../shared/types/ipc';

export function registerTaskIpcHandlers(): void {
  // GET_ALL
  ipcMain.handle(
    IPC_CHANNELS.TASK.GET_ALL,
    async (_event, filterPayload: unknown): Promise<IpcResult<Task[]>> => {
      try {
        const validation = validateTaskFilter(filterPayload);
        if (!validation.valid || !validation.data) {
          return { success: false, error: validation.error || 'Invalid filter payload' };
        }
        const tasks = getAllTasks(validation.data);
        return { success: true, data: tasks };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to fetch tasks',
        };
      }
    },
  );

  // CREATE
  ipcMain.handle(
    IPC_CHANNELS.TASK.CREATE,
    async (_event, createPayload: unknown): Promise<IpcResult<Task>> => {
      try {
        const validation = validateCreateTaskInput(createPayload);
        if (!validation.valid || !validation.data) {
          return { success: false, error: validation.error || 'Invalid create task payload' };
        }
        const task = createTask(validation.data);
        return { success: true, data: task };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create task',
        };
      }
    },
  );

  // UPDATE (handles completion toggle as well)
  ipcMain.handle(
    IPC_CHANNELS.TASK.UPDATE,
    async (_event, updatePayload: unknown): Promise<IpcResult<Task>> => {
      try {
        const validation = validateUpdateTaskInput(updatePayload);
        if (!validation.valid || !validation.data) {
          return { success: false, error: validation.error || 'Invalid update task payload' };
        }
        const task = updateTask(validation.data);
        return { success: true, data: task };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update task',
        };
      }
    },
  );

  // DELETE
  ipcMain.handle(
    IPC_CHANNELS.TASK.DELETE,
    async (_event, deletePayload: unknown): Promise<IpcResult<{ id: string }>> => {
      try {
        const validation = validateDeleteTaskInput(deletePayload);
        if (!validation.valid || !validation.data) {
          return { success: false, error: validation.error || 'Invalid delete task payload' };
        }
        const result = deleteTask(validation.data.id);
        return { success: true, data: result };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete task',
        };
      }
    },
  );
}
