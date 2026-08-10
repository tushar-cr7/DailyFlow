import { useState } from 'react';
import type { Task } from '@shared/types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`group rounded-xl border p-4 transition-all ${
        task.isCompleted
          ? 'border-slate-200 bg-slate-50 text-slate-500'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:border-indigo-200'
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-medium text-sm leading-snug break-words ${
                  task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {task.title}
              </span>
              {task.scheduledTime && (
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {task.scheduledTime}
                </span>
              )}
            </div>

            {task.description && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showDetails ? 'Hide notes' : 'Show notes'}
                </button>
                {showDetails && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xs font-medium"
            title="Edit task"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 text-xs font-medium"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
