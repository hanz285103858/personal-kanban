import type { Column as ColumnType } from '../../types';
import { TaskCard } from '../TaskCard/TaskCard';
import './Column.css';

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  return (
    <div className="column">
      <div className="column-header">
        <h3 className="column-title">{column.name}</h3>
        <span className="task-count">{column.tasks.length}</span>
      </div>
      <div className="column-content">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
