import React from 'react';
import type { Task } from '../../shared/types/task';
import { classifyTask, getTodayString, getCurrentTimeString } from '../../shared/utils/date';

interface TodayFlowTimelineProps {
  tasks: Task[];
  currentDateStr?: string;
  currentTimeStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onOpenCreateModal: () => void;
}

export const TodayFlowTimeline: React.FC<TodayFlowTimelineProps> = ({
  tasks,
  currentDateStr = getTodayString(),
  currentTimeStr = getCurrentTimeString(),
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
  onOpenCreateModal,
}) => {
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const scheduledTasks = tasks
    .filter((t) => t.scheduledTime && t.scheduledTime.trim() !== '')
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  const unscheduledTasks = tasks.filter((t) => !t.scheduledTime || t.scheduledTime.trim() === '');

  // Identify next active/pending task in timeline for instant visual emphasis (<1s recognition)
  const nextActiveTaskId = scheduledTasks.find((t) => !t.isCompleted)?.id || pendingTasks[0]?.id;

  if (tasks.length === 0) {
    return (
      <div className="glass-surface p-8 text-center flex flex-col items-center justify-center animate-card-enter max-w-md mx-auto my-4 border-white/20">
        <span className="text-3xl mb-2">🌿</span>
        <h3 className="text-base font-black text-white">Your canvas is clear</h3>
        <p className="mt-1 text-xs text-slate-200 font-medium">
          What would make today feel successful?
        </p>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-all border border-white/25 active:scale-95 backdrop-blur-md"
        >
          <span>+ Capture Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-card-enter">
      {/* 1. Scheduled Today Flow Timeline */}
      {scheduledTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>⏰ TODAY'S TIMELINE FLOW</span>
            </h3>
            <span className="text-[11px] font-bold text-indigo-300">
              {scheduledTasks.filter((t) => t.isCompleted).length} / {scheduledTasks.length} Done
            </span>
          </div>

          <div className="space-y-4 relative pl-2">
            {scheduledTasks.map((task, index) => {
              const isNext = task.id === nextActiveTaskId;
              const isCompleted = task.isCompleted;
              const isOverdue = !isCompleted && classifyTask(task, currentDateStr, currentTimeStr) === 'overdue';

              return (
                <div key={task.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Vertical Stem */}
                  {index < scheduledTasks.length - 1 && <div className="timeline-stem" />}

                  {/* Marker Node */}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[9px] font-extrabold">
                        ✓
                      </span>
                    ) : isNext ? (
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-slate-950" />
                      </span>
                    ) : isOverdue ? (
                      <span className="h-3.5 w-3.5 rounded-full bg-rose-500" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full bg-slate-700 border border-slate-500" />
                    )}
                  </div>

                  {/* Task Timeline Card */}
                  <div
                    className={`flex-1 glass-surface p-4 transition-all duration-200 ${
                      isNext
                        ? 'border-indigo-400/60 bg-indigo-950/40 accent-glow-indigo shadow-lg'
                        : isCompleted
                        ? 'opacity-65 bg-slate-950/40'
                        : 'glass-surface-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Tactile Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-90 ${
                            isCompleted
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950 animate-checkmark-pop'
                              : 'border-slate-500 bg-slate-950/60 text-transparent hover:border-indigo-400'
                          }`}
                        >
                          ✓
                        </button>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold font-mono text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-400/30">
                              {task.scheduledTime}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                isCompleted ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            {isNext && (
                              <span className="rounded-full bg-indigo-500/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-200 border border-indigo-400/40">
                                Next Up
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-300 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => onStartFocus(task)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all border border-white/10"
                            title="Focus on this task"
                          >
                            Focus
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-white/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          className="px-2.5 py-1 bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Unscheduled Backlog Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              📋 UNSCHEDULED BACKLOG ({unscheduledTasks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unscheduledTasks.map((task) => {
              const isCompleted = task.isCompleted;
              return (
                <div
                  key={task.id}
                  className={`glass-surface p-3.5 transition-all group ${
                    isCompleted ? 'opacity-65 bg-slate-950/40' : 'glass-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task)}
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all active:scale-90 ${
                          isCompleted
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950 text-[10px]'
                            : 'border-slate-500 bg-slate-950/60 text-transparent hover:border-indigo-400'
                        }`}
                      >
                        ✓
                      </button>
                      <span
                        className={`text-xs font-bold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
