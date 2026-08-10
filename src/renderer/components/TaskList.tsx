import type { Task } from '@shared/types/task';
import { SchedulingSection } from './SchedulingSection';
import { TaskItem } from './TaskItem';
import { formatDisplayDate, getTodayString, getCurrentTimeString } from '@shared/utils/date';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  viewMode?: 'single-date' | 'upcoming' | 'overdue';
  currentDateStr?: string;
  currentTimeStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

export function TaskList({
  tasks,
  loading,
  viewMode = 'single-date',
  currentDateStr = getTodayString(),
  currentTimeStr = getCurrentTimeString(),
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenCreateModal,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse-subtle flex items-center justify-between"
          >
            <div className="flex items-center gap-3 w-2/3">
              <div className="h-5 w-5 rounded bg-slate-800 shrink-0" />
              <div className="h-4 w-full rounded bg-slate-800" />
            </div>
            <div className="h-6 w-16 rounded bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center animate-card-enter">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 text-xl mb-3 border border-indigo-500/20">
          {viewMode === 'overdue' ? '✨' : viewMode === 'upcoming' ? '🗓️' : '📋'}
        </div>
        <h3 className="text-sm font-bold text-slate-200">
          {viewMode === 'overdue'
            ? 'All Scheduled Tasks Are Up To Date!'
            : viewMode === 'upcoming'
            ? 'No Upcoming Tasks Scheduled'
            : 'No Tasks Scheduled For This Date'}
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          {viewMode === 'overdue'
            ? 'You have zero overdue tasks pending attention. Great job!'
            : 'Keep your productivity flow steady by capturing your next action items.'}
        </p>
        {viewMode !== 'overdue' && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <span>+ Create Task</span>
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'single-date') {
    const pendingTasks = tasks.filter((t) => !t.isCompleted);
    const scheduledPending = pendingTasks.filter((t) => t.scheduledTime !== null);
    const unscheduledPending = pendingTasks.filter((t) => t.scheduledTime === null);
    const completedTasks = tasks.filter((t) => t.isCompleted);

    return (
      <div className="space-y-6">
        <SchedulingSection
          title="Scheduled Tasks"
          tasks={scheduledPending}
          currentDateStr={currentDateStr}
          currentTimeStr={currentTimeStr}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <SchedulingSection
          title="Unscheduled Tasks"
          tasks={unscheduledPending}
          currentDateStr={currentDateStr}
          currentTimeStr={currentTimeStr}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <SchedulingSection
          title={`Completed (${completedTasks.length})`}
          tasks={completedTasks}
          currentDateStr={currentDateStr}
          currentTimeStr={currentTimeStr}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    );
  }

  if (viewMode === 'upcoming') {
    // Group tasks by date string
    const dateGroups = tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const existing = acc[task.date] ?? [];
      existing.push(task);
      acc[task.date] = existing;
      return acc;
    }, {});

    const sortedDates = Object.keys(dateGroups).sort();

    return (
      <div className="space-y-6">
        {sortedDates.map((dateStr) => {
          const dateTasks = dateGroups[dateStr] ?? [];
          return (
            <div key={dateStr} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>{formatDisplayDate(dateStr, currentDateStr)} ({dateStr})</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-bold">
                  {dateTasks.length} task{dateTasks.length > 1 ? 's' : ''}
                </span>
              </h3>
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    currentDateStr={currentDateStr}
                    currentTimeStr={currentTimeStr}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // viewMode === 'overdue'
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-rose-900/40 pb-1.5 flex items-center justify-between">
        <span>Overdue Scheduled Tasks</span>
        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 font-bold border border-rose-500/30">
          {tasks.length}
        </span>
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            currentDateStr={currentDateStr}
            currentTimeStr={currentTimeStr}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
