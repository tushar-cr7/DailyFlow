import type { Task } from '@shared/types/task';
import { TaskItem } from './TaskItem';

interface SchedulingSectionProps {
  title: string;
  tasks: Task[];
  currentDateStr?: string;
  currentTimeStr?: string;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SchedulingSection({
  title,
  tasks,
  currentDateStr,
  currentTimeStr,
  onToggleComplete,
  onEdit,
  onDelete,
}: SchedulingSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
        <span>{title}</span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-bold">
          {tasks.length}
        </span>
      </h4>
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
