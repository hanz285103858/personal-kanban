import { useState, useEffect } from 'react';
import type { Task } from '../../stores/db';
import './TaskDetail.css';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdateTitle: (taskId: string, newTitle: string) => void;
  onUpdateDescription: (taskId: string, description: string) => void;
}

export function TaskDetail({ task, onClose, onUpdateTitle, onUpdateDescription }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

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
      </div>
    </div>
  );
}
