import { useState } from 'react';
import type { Task } from '../../stores/db';
import './TaskDetail.css';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdateTitle: (taskId: string, newTitle: string) => void;
  onUpdateDescription: (taskId: string, description: string) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | undefined) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskDetail({ task, onClose, onUpdateTitle, onUpdateDescription, onUpdateDueDate, onAddSubtask, onToggleSubtask, onDeleteSubtask }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [newSubtask, setNewSubtask] = useState('');

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdateTitle(task.id, title);
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdateDescription(task.id, description);
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    onUpdateDueDate(task.id, newDate || undefined);
  };

  const handleClearDueDate = () => {
    setDueDate('');
    onUpdateDueDate(task.id, undefined);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask);
      setNewSubtask('');
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // 计算子任务完成进度
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(st => st.completed).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-detail" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="task-detail-header">
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="任务标题"
          />
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="task-detail-section">
          <h3 className="section-title">描述</h3>
          <textarea
            className="description-input"
            placeholder="添加详细描述..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={5}
          />
        </div>

        <div className="task-detail-section">
          <h3 className="section-title">截止日期</h3>
          <div className="due-date-wrapper">
            <input
              type="date"
              className="due-date-input"
              value={dueDate}
              onChange={handleDueDateChange}
            />
            {dueDate && (
              <button className="clear-date-btn" onClick={handleClearDueDate}>
                清除
              </button>
            )}
          </div>
        </div>

        <div className="task-detail-section">
          <div className="section-header">
            <h3 className="section-title">子任务</h3>
            {subtasks.length > 0 && (
              <span className="subtask-progress">{completedCount}/{subtasks.length}</span>
            )}
          </div>

          <div className="subtask-list">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="subtask-item">
                <input
                  type="checkbox"
                  className="subtask-checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                />
                <span className={`subtask-title ${subtask.completed ? 'completed' : ''}`}>
                  {subtask.title}
                </span>
                <button
                  className="subtask-delete-btn"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  title="删除子任务"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-subtask">
            <input
              type="text"
              className="add-subtask-input"
              placeholder="添加子任务..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
            />
            <button
              className="add-subtask-btn"
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
