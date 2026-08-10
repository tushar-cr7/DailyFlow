import randomUUID from 'node:crypto';
import { getDatabase } from './connection';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../../shared/types/task';
import type Database from 'better-sqlite3';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  scheduled_time: string | null;
  is_completed: number;
  created_at: string;
  updated_at: string;
}

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    scheduledTime: row.scheduled_time,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllTasks(filter?: TaskFilter, customDb?: Database.Database): Task[] {
  const db = customDb || getDatabase();
  const targetDate = filter?.date || null;

  let query = 'SELECT * FROM tasks';
  const params: unknown[] = [];

  if (targetDate) {
    query += ' WHERE date = ?';
    params.push(targetDate);
  }

  query += ' ORDER BY date ASC, scheduled_time ASC NULLS LAST, created_at ASC';

  const rows = db.prepare(query).all(...params) as TaskRow[];
  return rows.map(mapRowToTask);
}

export function getTaskById(id: string, customDb?: Database.Database): Task | null {
  const db = customDb || getDatabase();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  return row ? mapRowToTask(row) : null;
}

export function createTask(dto: CreateTaskDTO, customDb?: Database.Database): Task {
  const db = customDb || getDatabase();
  const id = randomUUID.randomUUID();
  const description = dto.description !== undefined ? dto.description : null;
  const scheduledTime = dto.scheduledTime !== undefined ? dto.scheduledTime : null;

  db.prepare(`
    INSERT INTO tasks (id, title, description, date, scheduled_time, is_completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
  `).run(id, dto.title, description, dto.date, scheduledTime);

  const created = getTaskById(id, db);
  if (!created) {
    throw new Error('Failed to retrieve task after insertion');
  }
  return created;
}

export function updateTask(dto: UpdateTaskDTO, customDb?: Database.Database): Task {
  const db = customDb || getDatabase();
  const existing = getTaskById(dto.id, db);

  if (!existing) {
    throw new Error(`Task with ID "${dto.id}" not found`);
  }

  const updatedTitle = dto.title !== undefined ? dto.title : existing.title;
  const updatedDescription = dto.description !== undefined ? dto.description : existing.description;
  const updatedDate = dto.date !== undefined ? dto.date : existing.date;
  const updatedScheduledTime = dto.scheduledTime !== undefined ? dto.scheduledTime : existing.scheduledTime;
  const updatedIsCompleted = dto.isCompleted !== undefined ? (dto.isCompleted ? 1 : 0) : (existing.isCompleted ? 1 : 0);

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, date = ?, scheduled_time = ?, is_completed = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    updatedTitle,
    updatedDescription,
    updatedDate,
    updatedScheduledTime,
    updatedIsCompleted,
    dto.id,
  );

  const updated = getTaskById(dto.id, db);
  if (!updated) {
    throw new Error('Failed to retrieve task after update');
  }
  return updated;
}

export function deleteTask(id: string, customDb?: Database.Database): { id: string } {
  const db = customDb || getDatabase();
  const existing = getTaskById(id, db);

  if (!existing) {
    throw new Error(`Task with ID "${id}" not found`);
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return { id };
}
