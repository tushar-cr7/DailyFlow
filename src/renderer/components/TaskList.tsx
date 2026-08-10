import type { Task } from '@shared/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

export function TaskList({
  tasks,
  loading,
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
        <h3 className="text-sm font-medium text-slate-800">No tasks for this date</h3>
        <p className="mt-1 text-xs text-slate-500">Get started by creating a new task.</p>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + Add Task
        </button>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-4">
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
