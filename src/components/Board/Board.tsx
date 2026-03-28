import { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useDbBoard } from '../../hooks/useDbBoard';
import { useTheme } from '../../contexts/ThemeContext';
import { Column } from '../Column/Column';
import { TaskDetail } from '../TaskDetail/TaskDetail';
import { SearchFilter } from '../SearchFilter/SearchFilter';
import { BoardSelector } from '../BoardSelector/BoardSelector';
import { StatisticsPanel } from '../StatisticsPanel/StatisticsPanel';
import { DataExport } from '../DataExport/DataExport';
import type { Task, Quadrant } from '../../stores/db';
import { PRESET_TAGS } from '../../stores/db';
import './Board.css';

export function Board() {
  const {
    boardData,
    allBoards,
    currentBoardId,
    loading,
    switchBoard,
    createBoard,
    deleteBoard,
    renameBoard,
    addTask,
    deleteTask,
    updateTask,
    updateTaskDescription,
    updateTaskDueDate,
    updateTaskQuadrant,
    toggleTaskTag,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateColumnWipLimit,
    renameColumn,
    addColumn,
    reorderTasks,
  } = useDbBoard();
  const { theme, toggleTheme } = useTheme();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const addColumnInputRef = useRef<HTMLInputElement>(null);

  // 添加列输入框聚焦
  useEffect(() => {
    if (isAddingColumn && addColumnInputRef.current) {
      addColumnInputRef.current.focus();
    }
  }, [isAddingColumn]);

  // 添加列处理函数
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName);
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleAddColumnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    } else if (e.key === 'Escape') {
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  // 搜索筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterQuadrant, setFilterQuadrant] = useState<Quadrant | undefined>();
  const [filterDueDate, setFilterDueDate] = useState<'overdue' | 'today' | 'week' | undefined>();

  // 过滤任务
  const filteredBoardData = useMemo(() => {
    if (!boardData) return null;

    // 检查是否有任何筛选条件
    const hasFilters = searchKeyword.trim() || filterTags.length > 0 || filterQuadrant || filterDueDate;
    if (!hasFilters) return boardData;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      ...boardData,
      columns: boardData.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => {
          // 关键词搜索
          if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(keyword);
            const descMatch = task.description?.toLowerCase().includes(keyword);
            if (!titleMatch && !descMatch) return false;
          }

          // 标签筛选
          if (filterTags.length > 0) {
            const taskTags = task.tags || [];
            if (!filterTags.some(tagId => taskTags.includes(tagId))) return false;
          }

          // 象限筛选
          if (filterQuadrant && task.quadrant !== filterQuadrant) {
            return false;
          }

          // 截止日期筛选
          if (filterDueDate && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (filterDueDate === 'overdue' && diffDays >= 0) return false;
            if (filterDueDate === 'today' && diffDays !== 0) return false;
            if (filterDueDate === 'week' && (diffDays < 0 || diffDays > 7)) return false;
          } else if (filterDueDate && !task.dueDate) {
            return false;
          }

          return true;
        }),
      })),
    };
  }, [boardData, searchKeyword, filterTags, filterQuadrant, filterDueDate]);

  const handleClearAllFilters = () => {
    setSearchKeyword('');
    setFilterTags([]);
    setFilterQuadrant(undefined);
    setFilterDueDate(undefined);
  };

  // 获取所有任务用于统计
  const allTasks = useMemo(() => {
    if (!boardData) return [];
    return boardData.columns.flatMap(col => col.tasks);
  }, [boardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!boardData) return;

    const { active } = event;
    const taskId = active.id as string;

    for (const column of boardData.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!boardData) return;

    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // 找到目标任务列和位置
    let targetColumnId: string | null = null;
    let newOrder = 0;

    for (const column of boardData.columns) {
      // 检查是否拖到列容器
      if (column.id === overId) {
        targetColumnId = column.id;
        newOrder = column.tasks.length; // 添加到末尾
        break;
      }
      // 检查是否拖到某个任务上
      const taskIndex = column.tasks.findIndex(t => t.id === overId);
      if (taskIndex !== -1) {
        targetColumnId = column.id;
        newOrder = taskIndex;
        break;
      }
    }

    if (targetColumnId) {
      reorderTasks(taskId, targetColumnId, newOrder);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="board">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="board">
        <div className="loading">数据加载失败</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <div className="board-header">
          <BoardSelector
            boards={allBoards}
            currentBoardId={currentBoardId}
            onSelectBoard={switchBoard}
            onCreateBoard={createBoard}
            onDeleteBoard={deleteBoard}
            onRenameBoard={renameBoard}
          />
          <div className="board-header-actions">
            <DataExport
              board={boardData.board}
              columns={boardData.columns}
              tasks={allTasks}
              tags={PRESET_TAGS}
            />
            <button
              className="stats-btn"
              onClick={() => setShowStats(true)}
              title="查看统计"
            >
              📊
            </button>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <SearchFilter
          onSearch={setSearchKeyword}
          onFilterTags={setFilterTags}
          onFilterQuadrant={setFilterQuadrant}
          onFilterDueDate={setFilterDueDate}
          onClearAll={handleClearAllFilters}
          activeTagFilters={filterTags}
          activeQuadrantFilter={filterQuadrant}
          activeDueDateFilter={filterDueDate}
          searchKeyword={searchKeyword}
        />

        <div className="board-columns">
          {filteredBoardData?.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              onTaskClick={handleTaskClick}
              onUpdateWipLimit={updateColumnWipLimit}
              onRenameColumn={renameColumn}
            />
          ))}
          {/* 添加列按钮 */}
          {isAddingColumn ? (
            <div className="add-column-form">
              <input
                ref={addColumnInputRef}
                type="text"
                className="add-column-input"
                placeholder="输入列名称..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onBlur={handleAddColumn}
                onKeyDown={handleAddColumnKeyDown}
              />
            </div>
          ) : (
            <button
              className="add-column-btn"
              onClick={() => setIsAddingColumn(true)}
            >
              + 添加列
            </button>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="task-card dragging">
            <span className="task-title">{activeTask.title}</span>
          </div>
        ) : null}
      </DragOverlay>
      {selectedTask && boardData && (
        <TaskDetail
          key={selectedTask.id}
          task={boardData.columns.flatMap(col => col.tasks).find(t => t.id === selectedTask.id) || selectedTask}
          onClose={handleCloseDetail}
          onUpdateTitle={updateTask}
          onUpdateDescription={updateTaskDescription}
          onUpdateDueDate={updateTaskDueDate}
          onUpdateQuadrant={updateTaskQuadrant}
          onToggleTag={toggleTaskTag}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
        />
      )}
      {showStats && (
        <StatisticsPanel
          tasks={allTasks}
          onClose={() => setShowStats(false)}
        />
      )}
    </DndContext>
  );
}
