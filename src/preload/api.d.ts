import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../shared/types/task';

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
}

declare global {
  interface Window {
    dailyflow: DailyFlowAPI;
  }
}

export {};
