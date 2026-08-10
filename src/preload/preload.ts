import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc';
import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../shared/types/task';

/**
 * Preload API for Phase 4 Core Task Management Architecture.
 * Exposes specific, type-safe IPC methods via contextBridge.
 * ipcRenderer is NEVER exposed directly to the renderer.
 */
contextBridge.exposeInMainWorld('dailyflow', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  isSecureContext: true,
  getSystemInfo: async (
    request?: SystemInfoRequest,
  ): Promise<IpcResult<SystemInfoResponse>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.GET_INFO, request);
  },
  getDatabaseStatus: async (): Promise<IpcResult<DatabaseStatus>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DATABASE.GET_STATUS);
  },
  // Phase 4 Task Management API
  getTasks: async (filter?: TaskFilter): Promise<IpcResult<Task[]>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.GET_ALL, filter);
  },
  createTask: async (dto: CreateTaskDTO): Promise<IpcResult<Task>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.CREATE, dto);
  },
  updateTask: async (dto: UpdateTaskDTO): Promise<IpcResult<Task>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.UPDATE, dto);
  },
  deleteTask: async (id: string): Promise<IpcResult<{ id: string }>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.DELETE, { id });
  },
});
