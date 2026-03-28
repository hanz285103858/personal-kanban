import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../stores/db';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, newTitle: string) => void;
  onClick: (task: Task) => void;
}

// 计算剩余天数
function getDaysRemaining(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化剩余时间显示
function formatDaysRemaining(days: number): string {
  if (days < 0) return `过期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天截止';
  if (days === 1) return '明天截止';
  return `${days} 天后截止`;
}

export function TaskCard({ task, onDelete, onUpdate, onClick }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleClick = () => {
    if (!isEditing) {
      onClick(task);
    }
  };

  // 计算截止日期状态
  const daysRemaining = task.dueDate ? getDaysRemaining(task.dueDate) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isDueToday = daysRemaining === 0;

  // 计算子任务进度
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const allSubtasksCompleted = hasSubtasks && completedSubtasks === subtasks.length;

  if (isEditing) {
    return (
      <div className="task-card editing">
        <input
          ref={inputRef}
          type="text"
          className="edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''} ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <div className="task-content">
        <span className="task-title">{task.title}</span>
        <div className="task-badges">
          {daysRemaining !== null && (
            <span className={`due-date-badge ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}`}>
              {formatDaysRemaining(daysRemaining)}
            </span>
          )}
          {hasSubtasks && (
            <span className={`subtask-badge ${allSubtasksCompleted ? 'completed' : ''}`}>
              ☑ {completedSubtasks}/{subtasks.length}
            </span>
          )}
        </div>
      </div>
      <div className="task-icons">
        {task.description && <span className="has-description">☰</span>}
        <button className="delete-btn" onClick={handleDelete} title="删除任务">
          ×
        </button>
      </div>
    </div>
  );
}
