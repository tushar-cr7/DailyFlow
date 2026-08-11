import React from 'react';
import type { DailyBriefing as DailyBriefingType, PaceStatus } from '../../shared/types/dailyExperience';
import type { Task } from '../../shared/types/task';

interface DailyBriefingProps {
  briefing: DailyBriefingType | null;
  allTodayTasks: Task[];
  onStartFocus: (task: Task) => void;
  onSetPrimaryFocus: (taskId: string | null) => void;
  onOpenSummary: () => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  briefing,
  allTodayTasks,
  onStartFocus,
  onSetPrimaryFocus,
  onOpenSummary,
}) => {
  if (!briefing) return null;

  const incompleteTasks = allTodayTasks.filter((t) => !t.isCompleted);

  const getPaceBadge = (status: PaceStatus) => {
    switch (status) {
      case 'completed':
        return { text: '🎉 Day Complete', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'ahead':
        return { text: '🚀 Ahead of Schedule', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'on_track':
        return { text: '⚡ On Track', className: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'needs_momentum':
        return { text: '💪 Build Momentum', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  const paceBadge = getPaceBadge(briefing.paceStatus);
  const percentage =
    briefing.totalScheduled > 0
      ? Math.round((briefing.completedCount / briefing.totalScheduled) * 100)
      : 0;

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 mb-6 shadow-lg backdrop-blur-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{briefing.greeting}!</h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${paceBadge.className}`}
            >
              {paceBadge.text}
            </span>
          </div>
          <p className="text-sm text-slate-300 italic">{briefing.quote}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSummary}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600 flex items-center gap-1.5"
          >
            <span>📝</span> Review Day
          </button>
        </div>
      </div>

      {/* Progress Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 bg-slate-900/50 rounded-lg border border-slate-700/40 mb-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Tasks Progress</div>
          <div className="text-lg font-bold text-white">
            {briefing.completedCount} / {briefing.totalScheduled}{' '}
            <span className="text-xs font-normal text-slate-400">({percentage}%)</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Est. Focus Left</div>
          <div className="text-lg font-bold text-sky-400">
            {briefing.estimatedMinutesRemaining} mins
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Potential Task XP</div>
          <div className="text-lg font-bold text-amber-400">+{briefing.potentialXpRemaining} XP</div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Overdue Items</div>
          <div
            className={`text-lg font-bold ${
              briefing.overdueCount > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {briefing.overdueCount}
          </div>
        </div>
      </div>

      {/* Primary Focus Card */}
      <div className="bg-slate-900/80 rounded-lg p-4 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">⭐</span>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Primary Focus Task
            </span>
          </div>
          {briefing.primaryFocusTask && (
            <button
              onClick={() => onSetPrimaryFocus(null)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear Focus
            </button>
          )}
        </div>

        {briefing.primaryFocusTask ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div
                className={`text-base font-semibold ${
                  briefing.primaryFocusTask.isCompleted
                    ? 'text-slate-400 line-through'
                    : 'text-white'
                }`}
              >
                {briefing.primaryFocusTask.title}
              </div>
              {briefing.primaryFocusTask.description && (
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {briefing.primaryFocusTask.description}
                </div>
              )}
            </div>

            {!briefing.primaryFocusTask.isCompleted && (
              <button
                onClick={() => onStartFocus(briefing.primaryFocusTask!)}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow transition-all flex items-center justify-center gap-1.5"
              >
                <span>⏱️</span> Enter Focus Mode
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onSetPrimaryFocus(e.target.value);
                }
              }}
              className="flex-1 bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>
                Select today's primary focus task...
              </option>
              {incompleteTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.scheduledTime ? `(${task.scheduledTime})` : ''}
                </option>
              ))}
            </select>
            {incompleteTasks.length === 0 && (
              <span className="text-xs text-slate-400 italic">No open tasks for today</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
