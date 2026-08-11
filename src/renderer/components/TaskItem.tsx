import { useState } from 'react';
import type { Task } from '@shared/types/task';
import { classifyTask, getTodayString, getCurrentTimeString, formatDisplayDate } from '@shared/utils/date';

interface TaskItemProps {
  task: Task;
  currentDateStr?: string;
  currentTimeStr?: string;
  density?: 'comfortable' | 'compact';
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  task,
  currentDateStr = getTodayString(),
  currentTimeStr = getCurrentTimeString(),
  density = 'comfortable',
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const status = classifyTask(task, currentDateStr, currentTimeStr);

  const handleCheckboxClick = () => {
    if (!task.isCompleted) {
      setShowXpFloat(true);
      setTimeout(() => setShowXpFloat(false), 1200);
    }
    onToggleComplete(task);
  };

  const getStatusBorderClass = () => {
    if (task.isCompleted) return 'border-l-4 border-l-emerald-500 bg-slate-950/40 opacity-75';
    if (status === 'overdue') return 'border-l-4 border-l-rose-500 bg-rose-950/20 border-rose-900/30';
    if (status === 'today') return 'border-l-4 border-l-indigo-500 obsidian-card obsidian-card-hover';
    if (status === 'upcoming') return 'border-l-4 border-l-cyan-500 obsidian-card obsidian-card-hover';
    if (status === 'future') return 'border-l-4 border-l-slate-600 obsidian-card obsidian-card-hover';
    return 'border-l-4 border-l-amber-500/70 obsidian-card obsidian-card-hover';
  };

  const paddingClass = density === 'compact' ? 'p-3' : 'p-4';

  return (
    <div
      className={`group relative rounded-2xl border ${paddingClass} shadow-md transition-all duration-200 animate-card-enter ${getStatusBorderClass()}`}
    >
      {/* Floating XP Gain Feedback Toast */}
      {showXpFloat && (
        <div className="absolute right-6 -top-4 pointer-events-none z-20 flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-black text-slate-950 shadow-lg animate-xp-float">
          <span>✨</span>
          <span>+15 XP</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3.5">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Custom Tactile Checkbox */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-90 ${
              task.isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-slate-950 animate-checkmark-pop shadow-md shadow-emerald-500/30'
                : 'border-slate-600 bg-slate-950/80 text-transparent hover:border-indigo-400 hover:bg-indigo-500/10'
            }`}
            aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
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

              {/* Status Badges */}
              {status === 'overdue' && (
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-300 border border-rose-500/30 animate-pulse-subtle">
                  Overdue
                </span>
              )}

              {task.scheduledTime && (
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                  ⏰ {task.scheduledTime}
                </span>
              )}

              {status === 'upcoming' && (
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                  {formatDisplayDate(task.date, currentDateStr)}
                </span>
              )}

              {status === 'future' && (
                <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
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
                  <p className="mt-2 rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300 whitespace-pre-wrap border border-white/5 shadow-inner">
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-xl border border-white/10 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900 hover:text-white transition-all active:scale-95 shadow-sm"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
