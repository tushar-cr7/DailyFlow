import React from 'react';
import type { Task } from '../../shared/types/task';

interface NorthStarCardProps {
  primaryFocusTask: Task | null;
  incompleteTasks: Task[];
  onStartFocus: (task: Task) => void;
  onSetPrimaryFocus: (taskId: string | null) => void;
}

export const NorthStarCard: React.FC<NorthStarCardProps> = ({
  primaryFocusTask,
  incompleteTasks,
  onStartFocus,
  onSetPrimaryFocus,
}) => {
  return (
    <div className="glass-surface p-5 border-indigo-400/30 accent-glow-indigo relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-300 text-sm">✦</span>
          <span className="text-xs font-black tracking-widest uppercase text-indigo-300">
            NORTH STAR FOCUS
          </span>
        </div>
        {primaryFocusTask && (
          <button
            type="button"
            onClick={() => onSetPrimaryFocus(null)}
            className="text-xs text-slate-300 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {primaryFocusTask ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3
              className={`text-lg font-extrabold tracking-tight ${
                primaryFocusTask.isCompleted ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {primaryFocusTask.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
              <span>{primaryFocusTask.scheduledTime ? `⏰ ${primaryFocusTask.scheduledTime}` : 'All Day Focus'}</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">High Priority</span>
            </div>
          </div>

          {!primaryFocusTask.isCompleted && (
            <button
              type="button"
              onClick={() => onStartFocus(primaryFocusTask)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 border border-white/20"
            >
              <span>ENTER FOCUS</span>
              <span>→</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-200 font-semibold">
            Choose the single task that would define today's direction and success.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onSetPrimaryFocus(e.target.value);
                }
              }}
              className="flex-1 bg-slate-950/70 text-slate-200 text-xs font-semibold rounded-xl px-4 py-2.5 border border-white/15 focus:outline-none focus:border-indigo-400"
            >
              <option value="" disabled className="bg-slate-900 text-slate-300">
                Select your North Star for today...
              </option>
              {incompleteTasks.map((task) => (
                <option key={task.id} value={task.id} className="bg-slate-900 text-slate-200">
                  {task.title} {task.scheduledTime ? `(${task.scheduledTime})` : ''}
                </option>
              ))}
            </select>
            {incompleteTasks.length === 0 && (
              <span className="text-xs text-slate-400 italic">No open tasks for today</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
