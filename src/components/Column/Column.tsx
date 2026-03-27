import { useState, useRef, useEffect } from 'react';
import type { Column as ColumnType } from '../../types';
import { TaskCard } from '../TaskCard/TaskCard';
import './Column.css';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (columnId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
}

export function Column({ column, onAddTask, onDeleteTask, onUpdateTask }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3 className="column-title">{column.name}</h3>
        <span className="task-count">{column.tasks.length}</span>
      </div>
      <div className="column-content">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
          />
        ))}
        {isAdding && (
          <div className="add-task-form">
            <input
              ref={inputRef}
              type="text"
              className="add-task-input"
              placeholder="输入任务标题..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={handleAddTask}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
      </div>
      {!isAdding && (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          + 添加任务
        </button>
      )}
    </div>
  );
}
