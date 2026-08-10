export interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO 8601 format: YYYY-MM-DD
  scheduledTime: string | null; // 24-hour format: HH:mm
  isCompleted: boolean;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  date: string;
  scheduledTime?: string | null;
}

export interface UpdateTaskDTO {
  id: string;
  title?: string;
  description?: string | null;
  date?: string;
  scheduledTime?: string | null;
  isCompleted?: boolean;
}

export interface TaskFilter {
  date?: string;
  isCompleted?: boolean;
}
