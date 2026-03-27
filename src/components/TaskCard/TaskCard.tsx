import type { Task } from '../../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="task-card">
      <span className="task-title">{task.title}</span>
    </div>
  );
}
