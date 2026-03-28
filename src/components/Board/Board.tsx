import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useDbBoard } from '../../hooks/useDbBoard';
import { Column } from '../Column/Column';
import { TaskDetail } from '../TaskDetail/TaskDetail';
import type { Task } from '../../stores/db';
import './Board.css';

export function Board() {
  const { boardData, loading, addTask, deleteTask, updateTask, moveTask, updateTaskDescription, updateTaskDueDate, updateTaskQuadrant, toggleTaskTag, addSubtask, toggleSubtask, deleteSubtask, updateColumnWipLimit } = useDbBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    const targetColumnId = over.id as string;

    const sourceColumn = boardData.columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    );

    if (sourceColumn && sourceColumn.id !== targetColumnId) {
      moveTask(taskId, targetColumnId);
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <div className="board-header">
          <h1 className="board-title">{boardData.board.name}</h1>
        </div>
        <div className="board-columns">
          {boardData.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              onTaskClick={handleTaskClick}
              onUpdateWipLimit={updateColumnWipLimit}
            />
          ))}
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
    </DndContext>
  );
}
