import React from 'react';
import type { Task } from '../../shared/types/task';
import { formatDisplayDate, getTodayString } from '../../shared/utils/date';

interface UpcomingViewProps {
  tasks: Task[];
  currentDateStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  currentDateStr = getTodayString(),
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenCreateModal,
}) => {
  const dateGroups = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const existing = acc[task.date] ?? [];
    existing.push(task);
    acc[task.date] = existing;
    return acc;
  }, {});

  const sortedDates = Object.keys(dateGroups).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="glass-surface p-12 text-center flex flex-col items-center justify-center animate-card-enter">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl mb-4 border border-indigo-400/30">
          🗓️
        </div>
        <h3 className="text-base font-extrabold text-white">Nothing scheduled for the upcoming 7 days</h3>
        <p className="mt-1 text-xs text-slate-300 max-w-sm">
          Plan ahead to maintain a steady productivity flow.
        </p>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all border border-white/20"
        >
          <span>+ Schedule Upcoming Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-card-enter">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">🗓️ Upcoming Workload Sequence</h2>
          <p className="text-xs text-slate-300">7-Day Forward Planning & Task Distribution</p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 border border-white/20"
        >
          + Schedule Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDates.map((dateStr) => {
          const dateTasks = dateGroups[dateStr] ?? [];
          return (
            <div key={dateStr} className="glass-surface p-4 space-y-3 glass-surface-hover">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {formatDisplayDate(dateStr, currentDateStr)}
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-300">{dateStr}</span>
                </div>
                <span className="rounded-full bg-indigo-500/25 px-2.5 py-0.5 text-[10px] text-indigo-200 font-extrabold border border-indigo-400/30">
                  {dateTasks.length} {dateTasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-950/50 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task)}
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-all ${
                          task.isCompleted
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                            : 'border-slate-500 bg-slate-950/60 text-transparent hover:border-indigo-400'
                        }`}
                      >
                        ✓
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.scheduledTime && (
                          <span className="text-[10px] text-indigo-300 font-mono">⏰ {task.scheduledTime}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-white/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-rose-950/40 text-rose-300 rounded border border-rose-500/30"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
