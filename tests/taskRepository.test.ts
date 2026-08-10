import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/database/schema';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from '../src/main/database/taskRepository';

describe('TaskRepository CRUD, Range Queries & Ordering (Phase 5)', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  it('creates a new task with generated UUID', () => {
    const task = createTask(
      {
        title: 'Test Task 1',
        description: 'Test Description',
        date: '2026-08-10',
        scheduledTime: '10:30',
      },
      db,
    );

    expect(task).toBeDefined();
    expect(task.id).toBeTypeOf('string');
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe('Test Task 1');
    expect(task.description).toBe('Test Description');
    expect(task.date).toBe('2026-08-10');
    expect(task.scheduledTime).toBe('10:30');
    expect(task.isCompleted).toBe(false);
  });

  it('fetches tasks for a specific date in deterministic order (date ASC, scheduled_time ASC NULLS LAST, created_at ASC)', () => {
    createTask({ title: 'Task without time', date: '2026-08-10', scheduledTime: null }, db);
    createTask({ title: 'Task at 14:00', date: '2026-08-10', scheduledTime: '14:00' }, db);
    createTask({ title: 'Task at 09:00', date: '2026-08-10', scheduledTime: '09:00' }, db);

    const tasks = getAllTasks({ date: '2026-08-10' }, db);
    expect(tasks).toHaveLength(3);
    expect(tasks[0]?.title).toBe('Task at 09:00');
    expect(tasks[1]?.title).toBe('Task at 14:00');
    expect(tasks[2]?.title).toBe('Task without time');
  });

  it('fetches tasks within a date range (startDate to endDate)', () => {
    createTask({ title: 'Task 1 (Aug 10)', date: '2026-08-10' }, db);
    createTask({ title: 'Task 2 (Aug 11)', date: '2026-08-11' }, db);
    createTask({ title: 'Task 3 (Aug 15)', date: '2026-08-15' }, db);
    createTask({ title: 'Task 4 (Aug 20)', date: '2026-08-20' }, db);

    const rangeTasks = getAllTasks(
      {
        startDate: '2026-08-11',
        endDate: '2026-08-17',
      },
      db,
    );

    expect(rangeTasks).toHaveLength(2);
    expect(rangeTasks[0]?.title).toBe('Task 2 (Aug 11)');
    expect(rangeTasks[1]?.title).toBe('Task 3 (Aug 15)');
  });

  it('updates task properties including completion status via updateTask', () => {
    const created = createTask({ title: 'Original Title', date: '2026-08-10' }, db);
    expect(created.isCompleted).toBe(false);

    const updated = updateTask(
      {
        id: created.id,
        title: 'Updated Title',
        isCompleted: true,
      },
      db,
    );

    expect(updated.title).toBe('Updated Title');
    expect(updated.isCompleted).toBe(true);

    const fetched = getTaskById(created.id, db);
    expect(fetched?.isCompleted).toBe(true);
  });

  it('deletes a task by ID', () => {
    const created = createTask({ title: 'To be deleted', date: '2026-08-10' }, db);
    const deleteResult = deleteTask(created.id, db);

    expect(deleteResult.id).toBe(created.id);
    const fetched = getTaskById(created.id, db);
    expect(fetched).toBeNull();
  });

  it('throws an error when updating or deleting a non-existent task ID', () => {
    expect(() => updateTask({ id: 'non-existent-id', title: 'New' }, db)).toThrow();
    expect(() => deleteTask('non-existent-id', db)).toThrow();
  });
});
