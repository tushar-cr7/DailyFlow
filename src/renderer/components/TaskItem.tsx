import { useState } from 'react';
import type { Task } from '@shared/types/task';
import { classifyTask, getTodayString, getCurrentTimeString, formatDisplayDate } from '@shared/utils/date';

interface TaskItemProps {
  task: Task;
  currentDateStr?: string;
  currentTimeStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  task,
  currentDateStr = getTodayString(),
  currentTimeStr = getCurrentTimeString(),
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const status = classifyTask(task, currentDateStr, currentTimeStr);

  const getStatusBorderClass = () => {
    if (task.isCompleted) return 'border-l-4 border-l-emerald-500 bg-slate-900/40 opacity-70';
    if (status === 'overdue') return 'border-l-4 border-l-rose-500 bg-rose-950/20 border-rose-900/30';
    if (status === 'today') return 'border-l-4 border-l-indigo-500 bg-slate-800/80 border-slate-700/60';
    if (status === 'upcoming') return 'border-l-4 border-l-cyan-500 bg-slate-800/80 border-slate-700/60';
    if (status === 'future') return 'border-l-4 border-l-slate-600 bg-slate-800/60 border-slate-700/50';
    return 'border-l-4 border-l-amber-500/70 bg-slate-800/80 border-slate-700/60';
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md animate-card-enter ${getStatusBorderClass()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Custom Animated Checkbox */}
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              task.isCompleted
                ? 'border-emerald-500 bg-emerald-600 text-white animate-checkmark-pop shadow-sm shadow-emerald-600/30'
                : 'border-slate-600 bg-slate-900/80 text-transparent hover:border-indigo-400'
            }`}
            aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            ✓
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold break-words transition-all ${
                  task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                }`}
              >
                {task.title}
              </span>

              {/* Badges */}
              {status === 'overdue' && (
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-300 border border-rose-500/30 animate-pulse-subtle">
                  Overdue
                </span>
              )}

              {task.scheduledTime && (
                <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                  ⏰ {task.scheduledTime}
                </span>
              )}

              {status === 'upcoming' && (
                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                  {formatDisplayDate(task.date, currentDateStr)}
                </span>
              )}

              {status === 'future' && (
                <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-600/40">
                  {formatDisplayDate(task.date, currentDateStr)}
                </span>
              )}
            </div>

            {task.description && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowNotes((prev) => !prev)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-2"
                >
                  {showNotes ? 'Hide notes ▲' : 'Show notes ▼'}
                </button>
                {showNotes && (
                  <p className="mt-2 rounded-lg bg-slate-900/80 p-3 text-xs text-slate-300 whitespace-pre-wrap border border-slate-800 shadow-inner">
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover Quick Actions */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg border border-slate-700/50 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg border border-rose-900/40 bg-rose-950/40 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900 hover:text-white transition-all active:scale-95"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
