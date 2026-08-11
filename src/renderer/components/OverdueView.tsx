import React from 'react';
import type { Task } from '../../shared/types/task';
import { formatDisplayDate, getTodayString } from '../../shared/utils/date';

interface OverdueViewProps {
  tasks: Task[];
  currentDateStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  tasks,
  currentDateStr = getTodayString(),
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="glass-surface p-12 text-center flex flex-col items-center justify-center animate-card-enter border-emerald-400/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl mb-4 border border-emerald-400/30">
          ✨
        </div>
        <h3 className="text-base font-extrabold text-white">All scheduled tasks are up to date!</h3>
        <p className="mt-1 text-xs text-slate-300 max-w-sm">
          You have zero overdue tasks pending attention. Excellent execution!
        </p>
      </div>
    );
  }

  const primaryOverdue = tasks[0];
  const remainingOverdue = tasks.slice(1);

  return (
    <div className="space-y-6 animate-card-enter">
      <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
        <div>
          <h2 className="text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
            <span>⚠️ NEEDS ATTENTION</span>
          </h2>
          <p className="text-xs text-slate-300">
            {tasks.length} overdue task{tasks.length > 1 ? 's' : ''} require recovery or rescheduling
          </p>
        </div>
        <span className="rounded-full bg-rose-500/25 px-3 py-1 text-xs font-extrabold text-rose-200 border border-rose-400/40">
          {tasks.length} Pending Recovery
        </span>
      </div>

      {primaryOverdue && (
        <div className="glass-surface p-6 border-rose-500/40 accent-glow-amber space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-rose-400 uppercase tracking-wider">
              Highest Priority Recovery Item
            </span>
            <span className="font-mono text-rose-200 font-bold">
              Scheduled for {formatDisplayDate(primaryOverdue.date, currentDateStr)}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">{primaryOverdue.title}</h3>
            {primaryOverdue.description && (
              <p className="text-xs text-slate-300 leading-relaxed">{primaryOverdue.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onToggleComplete(primaryOverdue)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 border border-white/20"
            >
              <span>✓</span> Complete Now
            </button>
            <button
              type="button"
              onClick={() => onEdit(primaryOverdue)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-white/20"
            >
              Reschedule Date
            </button>
            <button
              type="button"
              onClick={() => onDelete(primaryOverdue.id)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {remainingOverdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Other Overdue Items ({remainingOverdue.length})
          </h3>
          <div className="space-y-2">
            {remainingOverdue.map((task) => (
              <div
                key={task.id}
                className="glass-surface p-4 border-rose-500/20 flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{task.title}</span>
                    <span className="text-[10px] font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-400/30">
                      {formatDisplayDate(task.date, currentDateStr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
