import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Column, Task } from '../../stores/db';
import { TaskCard } from '../TaskCard/TaskCard';
import './Column.css';

interface ColumnProps {
  column: Column & { tasks: Task[] };
  onAddTask: (columnId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onTaskClick: (task: Task) => void;
  onUpdateWipLimit?: (columnId: string, wipLimit: number | undefined) => void;
}

export function Column({ column, onAddTask, onDeleteTask, onUpdateTask, onTaskClick, onUpdateWipLimit }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSettingWip, setIsSettingWip] = useState(false);
  const [wipValue, setWipValue] = useState(column.wipLimit?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const wipInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // WIP限制状态
  const taskCount = column.tasks.length;
  const wipLimit = column.wipLimit;
  const isOverWip = wipLimit !== undefined && taskCount > wipLimit;
  const isAtWipLimit = wipLimit !== undefined && taskCount >= wipLimit;

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (isSettingWip && wipInputRef.current) {
      wipInputRef.current.focus();
      wipInputRef.current.select();
    }
  }, [isSettingWip]);

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

  const handleWipSave = () => {
    if (onUpdateWipLimit) {
      const newLimit = wipValue ? parseInt(wipValue, 10) : undefined;
      if (wipValue && (isNaN(newLimit!) || newLimit! < 1)) {
        setWipValue('');
        setIsSettingWip(false);
        return;
      }
      onUpdateWipLimit(column.id, newLimit);
    }
    setIsSettingWip(false);
  };

  const handleWipKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWipSave();
    } else if (e.key === 'Escape') {
      setWipValue(column.wipLimit?.toString() || '');
      setIsSettingWip(false);
    }
  };

  const handleClearWip = () => {
    if (onUpdateWipLimit) {
      onUpdateWipLimit(column.id, undefined);
      setWipValue('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`column ${isOver ? 'drag-over' : ''} ${isOverWip ? 'over-wip' : ''}`}
    >
      <div className="column-header">
        <div className="column-header-left">
          <h3 className="column-title">{column.name}</h3>
          <span className={`task-count ${isOverWip ? 'over-wip' : ''}`}>
            {taskCount}{wipLimit !== undefined && `/${wipLimit}`}
          </span>
        </div>
        <div className="column-header-right">
          {isSettingWip ? (
            <div className="wip-setting">
              <input
                ref={wipInputRef}
                type="number"
                className="wip-input"
                placeholder="限制"
                value={wipValue}
                onChange={(e) => setWipValue(e.target.value)}
                onBlur={handleWipSave}
                onKeyDown={handleWipKeyDown}
                min={1}
              />
              {wipLimit !== undefined && (
                <button className="wip-clear-btn" onClick={handleClearWip} title="清除限制">
                  ×
                </button>
              )}
            </div>
          ) : (
            <button
              className="wip-setting-btn"
              onClick={() => setIsSettingWip(true)}
              title={wipLimit ? `WIP限制: ${wipLimit}` : '设置WIP限制'}
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      {isOverWip && (
        <div className="wip-warning">
          ⚠️ 超出WIP限制 ({taskCount}/{wipLimit})
        </div>
      )}

      <div className="column-content">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            onClick={onTaskClick}
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
      {!isAdding && !isAtWipLimit && (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          + 添加任务
        </button>
      )}
      {!isAdding && isAtWipLimit && (
        <button className="add-task-btn disabled" disabled>
         已达WIP限制
        </button>
      )}
    </div>
  );
}
