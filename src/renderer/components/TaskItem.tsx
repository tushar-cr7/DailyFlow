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

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-all ${
        task.isCompleted
          ? 'border-slate-200 bg-slate-50/60 opacity-75'
          : status === 'overdue'
          ? 'border-red-200 bg-red-50/30 hover:border-red-300'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => onToggleComplete(task)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-medium break-words ${
                  task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {task.title}
              </span>

              {/* Status Badges */}
              {status === 'overdue' && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Overdue
                </span>
              )}

              {task.scheduledTime && (
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                  ⏰ {task.scheduledTime}
                </span>
              )}

              {status === 'upcoming' && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  {formatDisplayDate(task.date, currentDateStr)}
                </span>
              )}

              {status === 'future' && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                  {formatDisplayDate(task.date, currentDateStr)}
                </span>
              )}
            </div>

            {task.description && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowNotes((prev) => !prev)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                  {showNotes ? 'Hide notes' : 'Show notes'}
                </button>
                {showNotes && (
                  <p className="mt-1.5 rounded-lg bg-slate-100/70 p-2.5 text-xs text-slate-600 whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-xs font-medium"
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 text-xs font-medium"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
