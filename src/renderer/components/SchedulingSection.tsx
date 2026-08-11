import type { Task } from '@shared/types/task';
import { TaskItem } from './TaskItem';

interface SchedulingSectionProps {
  title: string;
  tasks: Task[];
  currentDateStr?: string;
  currentTimeStr?: string;
  density?: 'comfortable' | 'compact';
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SchedulingSection({
  title,
  tasks,
  currentDateStr,
  currentTimeStr,
  density,
  onToggleComplete,
  onEdit,
  onDelete,
}: SchedulingSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-1">
        <span>{title}</span>
        <span className="rounded-full bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300 font-bold">
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
            density={density}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
