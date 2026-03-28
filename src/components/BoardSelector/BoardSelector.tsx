import { useState } from 'react';
import type { Board } from '../../stores/db';
import './BoardSelector.css';

interface BoardSelectorProps {
  boards: Board[];
  currentBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, name: string) => void;
}

export function BoardSelector({
  boards,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
}: BoardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const currentBoard = boards.find(b => b.id === currentBoardId);

  const handleCreate = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName);
      setNewBoardName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleRename = (boardId: string) => {
    if (editingName.trim()) {
      onRenameBoard(boardId, editingName);
      setEditingBoardId(null);
      setEditingName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setEditingBoardId(null);
      setNewBoardName('');
      setEditingName('');
    }
  };

  return (
    <div className="board-selector">
      <button
        className="board-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="board-name">{currentBoard?.name || '选择看板'}</span>
        <span className="dropdown-icon">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="board-dropdown">
          <div className="board-list">
            {boards.map((board) => (
              <div
                key={board.id}
                className={`board-item ${board.id === currentBoardId ? 'active' : ''}`}
                onClick={() => {
                  onSelectBoard(board.id);
                  setIsOpen(false);
                }}
              >
                {editingBoardId === board.id ? (
                  <input
                    type="text"
                    className="rename-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(board.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleRename(board.id))}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="board-item-name">{board.name}</span>
                    <div className="board-item-actions">
                      <button
                        className="board-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBoardId(board.id);
                          setEditingName(board.name);
                        }}
                        title="重命名"
                      >
                        ✏️
                      </button>
                      {boards.length > 1 && (
                        <button
                          className="board-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定删除看板 "${board.name}" 吗？`)) {
                              onDeleteBoard(board.id);
                            }
                          }}
                          title="删除"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="board-dropdown-footer">
            {isCreating ? (
              <div className="create-board-form">
                <input
                  type="text"
                  className="create-board-input"
                  placeholder="看板名称..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onBlur={handleCreate}
                  onKeyDown={(e) => handleKeyDown(e, handleCreate)}
                  autoFocus
                />
              </div>
            ) : (
              <button
                className="create-board-btn"
                onClick={() => setIsCreating(true)}
              >
                + 新建看板
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
