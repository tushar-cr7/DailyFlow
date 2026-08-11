import { describe, expect, it } from 'vitest';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  validateDeleteTaskInput,
  validateTaskFilter,
} from '../src/shared/utils/validation';

describe('Task Input Boundary Validation (Phase 5)', () => {
  describe('validateCreateTaskInput', () => {
    it('accepts valid createTask payload', () => {
      const res = validateCreateTaskInput({
        title: '  Valid Task Title  ',
        description: 'Optional description',
        date: '2026-08-10',
        scheduledTime: '14:30',
      });

      expect(res.valid).toBe(true);
      expect(res.data?.title).toBe('Valid Task Title');
      expect(res.data?.date).toBe('2026-08-10');
      expect(res.data?.scheduledTime).toBe('14:30');
    });

    it('rejects missing or empty title', () => {
      const res1 = validateCreateTaskInput({ title: '   ', date: '2026-08-10' });
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain('title');

      const res2 = validateCreateTaskInput({ date: '2026-08-10' });
      expect(res2.valid).toBe(false);
    });

    it('rejects invalid date format', () => {
      const res = validateCreateTaskInput({ title: 'Task', date: '10/08/2026' });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('YYYY-MM-DD');
    });

    it('normalizes various valid time formats correctly', () => {
      const times = [
        { in: '00:00', out: '00:00' },
        { in: '09:30', out: '09:30' },
        { in: '9:30', out: '09:30' },
        { in: '12:00', out: '12:00' },
        { in: '23:59', out: '23:59' },
        { in: '09:30:00', out: '09:30' },
        { in: '', out: null },
      ];

      for (const t of times) {
        const res = validateCreateTaskInput({
          title: 'Task',
          date: '2026-08-10',
          scheduledTime: t.in,
        });
        expect(res.valid).toBe(true);
        expect(res.data?.scheduledTime).toBe(t.out);
      }
    });

    it('rejects invalid time format', () => {
      const res = validateCreateTaskInput({
        title: 'Task',
        date: '2026-08-10',
        scheduledTime: '25:99',
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('HH:mm');
    });
  });

  describe('validateUpdateTaskInput', () => {
    it('accepts valid update payload with completion flag', () => {
      const res = validateUpdateTaskInput({
        id: 'some-uuid-123',
        isCompleted: true,
      });

      expect(res.valid).toBe(true);
      expect(res.data?.id).toBe('some-uuid-123');
      expect(res.data?.isCompleted).toBe(true);
    });

    it('rejects update without task ID', () => {
      const res = validateUpdateTaskInput({ title: 'Updated Title' });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Task ID');
    });
  });

  describe('validateDeleteTaskInput', () => {
    it('accepts valid delete payload', () => {
      const res = validateDeleteTaskInput({ id: 'valid-id' });
      expect(res.valid).toBe(true);
      expect(res.data?.id).toBe('valid-id');
    });

    it('rejects delete payload missing ID', () => {
      const res = validateDeleteTaskInput({});
      expect(res.valid).toBe(false);
    });
  });

  describe('validateTaskFilter', () => {
    it('accepts valid task filter with date ranges', () => {
      const res = validateTaskFilter({
        startDate: '2026-08-11',
        endDate: '2026-08-17',
        isCompleted: false,
      });
      expect(res.valid).toBe(true);
      expect(res.data?.startDate).toBe('2026-08-11');
      expect(res.data?.endDate).toBe('2026-08-17');
      expect(res.data?.isCompleted).toBe(false);
    });

    it('rejects invalid startDate or endDate', () => {
      const res = validateTaskFilter({ startDate: 'invalid-date' });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('YYYY-MM-DD');
    });

    it('accepts undefined filter', () => {
      const res = validateTaskFilter(undefined);
      expect(res.valid).toBe(true);
      expect(res.data).toEqual({});
    });
  });
});
