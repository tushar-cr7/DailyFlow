import type { CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../types/task';
import { isValidDateString, isValidTimeString } from './date';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean';
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSystemInfoRequest(input: unknown): ValidationResult {
  if (input !== undefined && input !== null) {
    if (!isObject(input)) {
      return { valid: false, error: 'Request payload must be an object or undefined' };
    }
    if ('includeEnv' in input && !isOptionalBoolean(input.includeEnv)) {
      return { valid: false, error: 'Property includeEnv must be a boolean if provided' };
    }
  }
  return { valid: true };
}

export function validateCreateTaskInput(input: unknown): { valid: boolean; error?: string; data?: CreateTaskDTO } {
  if (!isObject(input)) {
    return { valid: false, error: 'Create task payload must be a non-null object' };
  }

  if (typeof input.title !== 'string' || input.title.trim().length === 0) {
    return { valid: false, error: 'Task title is required and cannot be empty' };
  }

  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length > 200) {
    return { valid: false, error: 'Task title must not exceed 200 characters' };
  }

  if (typeof input.date !== 'string' || !isValidDateString(input.date)) {
    return { valid: false, error: 'Task date is required and must be formatted as YYYY-MM-DD' };
  }

  let description: string | null = null;
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== 'string') {
      return { valid: false, error: 'Task description must be a string if provided' };
    }
    if (input.description.length > 2000) {
      return { valid: false, error: 'Task description must not exceed 2000 characters' };
    }
    description = input.description;
  }

  let scheduledTime: string | null = null;
  if (input.scheduledTime !== undefined && input.scheduledTime !== null && input.scheduledTime !== '') {
    if (typeof input.scheduledTime !== 'string' || !isValidTimeString(input.scheduledTime)) {
      return { valid: false, error: 'Task scheduled time must be formatted as HH:mm (24-hour)' };
    }
    scheduledTime = input.scheduledTime;
  }

  return {
    valid: true,
    data: {
      title: trimmedTitle,
      description,
      date: input.date,
      scheduledTime,
    },
  };
}

export function validateUpdateTaskInput(input: unknown): { valid: boolean; error?: string; data?: UpdateTaskDTO } {
  if (!isObject(input)) {
    return { valid: false, error: 'Update task payload must be a non-null object' };
  }

  if (typeof input.id !== 'string' || input.id.trim().length === 0) {
    return { valid: false, error: 'Task ID is required for update' };
  }

  const data: UpdateTaskDTO = { id: input.id.trim() };

  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      return { valid: false, error: 'Task title must be a non-empty string if provided' };
    }
    if (input.title.trim().length > 200) {
      return { valid: false, error: 'Task title must not exceed 200 characters' };
    }
    data.title = input.title.trim();
  }

  if (input.description !== undefined) {
    if (input.description !== null && typeof input.description !== 'string') {
      return { valid: false, error: 'Task description must be a string or null' };
    }
    if (typeof input.description === 'string' && input.description.length > 2000) {
      return { valid: false, error: 'Task description must not exceed 2000 characters' };
    }
    data.description = input.description;
  }

  if (input.date !== undefined) {
    if (typeof input.date !== 'string' || !isValidDateString(input.date)) {
      return { valid: false, error: 'Task date must be formatted as YYYY-MM-DD' };
    }
    data.date = input.date;
  }

  if (input.scheduledTime !== undefined) {
    if (input.scheduledTime !== null && input.scheduledTime !== '') {
      if (typeof input.scheduledTime !== 'string' || !isValidTimeString(input.scheduledTime)) {
        return { valid: false, error: 'Task scheduled time must be formatted as HH:mm (24-hour) or null' };
      }
      data.scheduledTime = input.scheduledTime;
    } else {
      data.scheduledTime = null;
    }
  }

  if (input.isCompleted !== undefined) {
    if (typeof input.isCompleted !== 'boolean') {
      return { valid: false, error: 'isCompleted must be a boolean if provided' };
    }
    data.isCompleted = input.isCompleted;
  }

  return { valid: true, data };
}

export function validateDeleteTaskInput(input: unknown): { valid: boolean; error?: string; data?: { id: string } } {
  if (!isObject(input)) {
    return { valid: false, error: 'Delete task payload must be an object' };
  }

  if (typeof input.id !== 'string' || input.id.trim().length === 0) {
    return { valid: false, error: 'Task ID is required for deletion' };
  }

  return { valid: true, data: { id: input.id.trim() } };
}

export function validateTaskFilter(input: unknown): { valid: boolean; error?: string; data?: TaskFilter } {
  if (input === undefined || input === null) {
    return { valid: true, data: {} };
  }

  if (!isObject(input)) {
    return { valid: false, error: 'Task filter must be an object or undefined' };
  }

  const data: TaskFilter = {};

  if (input.date !== undefined && input.date !== null && input.date !== '') {
    if (typeof input.date !== 'string' || !isValidDateString(input.date)) {
      return { valid: false, error: 'Filter date must be formatted as YYYY-MM-DD' };
    }
    data.date = input.date;
  }

  if (input.startDate !== undefined && input.startDate !== null && input.startDate !== '') {
    if (typeof input.startDate !== 'string' || !isValidDateString(input.startDate)) {
      return { valid: false, error: 'Filter startDate must be formatted as YYYY-MM-DD' };
    }
    data.startDate = input.startDate;
  }

  if (input.endDate !== undefined && input.endDate !== null && input.endDate !== '') {
    if (typeof input.endDate !== 'string' || !isValidDateString(input.endDate)) {
      return { valid: false, error: 'Filter endDate must be formatted as YYYY-MM-DD' };
    }
    data.endDate = input.endDate;
  }

  if (input.isCompleted !== undefined && input.isCompleted !== null) {
    if (typeof input.isCompleted !== 'boolean') {
      return { valid: false, error: 'Filter isCompleted must be a boolean' };
    }
    data.isCompleted = input.isCompleted;
  }

  if (input.overdueOnly !== undefined && input.overdueOnly !== null) {
    if (typeof input.overdueOnly !== 'boolean') {
      return { valid: false, error: 'Filter overdueOnly must be a boolean' };
    }
    data.overdueOnly = input.overdueOnly;
  }

  return { valid: true, data };
}
