import { useState, useEffect } from 'react';
import type { Task } from '@shared/types/task';
import { getTodayString, isValidDateString, isValidTimeString } from '@shared/utils/date';
import { TimePicker } from './TimePicker';

interface TaskFormModalProps {
  isOpen: boolean;
  initialTask?: Task | null;
  selectedDate?: string;
  onClose: () => void;
  onSubmit: (dto: {
    title: string;
    description?: string | null;
    date: string;
    scheduledTime?: string | null;
  }) => Promise<void>;
}

export function TaskFormModal({
  isOpen,
  initialTask,
  selectedDate = getTodayString(),
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [scheduledTime, setScheduledTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setDate(initialTask.date);
        setScheduledTime(initialTask.scheduledTime || '');
      } else {
        setTitle('');
        setDescription('');
        setDate(selectedDate);
        setScheduledTime('');
      }
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, initialTask, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setError('Task title cannot exceed 200 characters.');
      return;
    }

    if (!isValidDateString(date)) {
      setError('Please select a valid date in YYYY-MM-DD format.');
      return;
    }

    const trimmedTime = scheduledTime.trim();
    if (trimmedTime && !isValidTimeString(trimmedTime)) {
      setError('Please provide a valid 24-hour time in HH:mm format.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || null,
        date,
        scheduledTime: trimmedTime || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal animate-card-enter">
      <div
        className="w-full max-w-lg obsidian-card rounded-3xl border border-white/10 p-6 shadow-2xl space-y-5 accent-glow-indigo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 id="modal-title" className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
            <span>{initialTask ? '✏️ Edit Task' : '✨ Create New Task'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review architecture documentation"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-date-input" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                id="task-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="task-time-input" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Scheduled Time (Optional)
              </label>
              <TimePicker
                id="task-time-input"
                value={scheduledTime}
                onChange={setScheduledTime}
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-desc-input" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description / Notes (Optional)
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, links, or notes..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'Saving...' : initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
