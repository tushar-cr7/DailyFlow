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
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-white">
        <h3 className="text-sm font-medium text-slate-800">
          {viewMode === 'overdue'
            ? 'No overdue tasks!'
            : viewMode === 'upcoming'
            ? 'No upcoming tasks for the next 7 days'
            : 'No tasks for this date'}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {viewMode === 'overdue'
            ? 'All your scheduled tasks are up to date.'
            : 'Get started by creating a new task.'}
        </p>
        {viewMode !== 'overdue' && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            + Add Task
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1 flex items-center justify-between">
                <span>{formatDisplayDate(dateStr, currentDateStr)} ({dateStr})</span>
                <span className="text-slate-400 text-[11px] font-medium">
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
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 border-b border-amber-200 pb-1">
        Overdue Scheduled Tasks ({tasks.length})
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
