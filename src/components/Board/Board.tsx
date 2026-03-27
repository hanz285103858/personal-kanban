import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useBoard } from '../../hooks/useBoard';
import { Column } from '../Column/Column';
import type { Task } from '../../types';
import './Board.css';

export function Board() {
  const { board, addTask, deleteTask, updateTask, moveTask } = useBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // 找到被拖拽的任务
    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetColumnId = over.id as string;

    // 检查是否拖到另一列
    const sourceColumn = board.columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    );

    if (sourceColumn && sourceColumn.id !== targetColumnId) {
      moveTask(taskId, targetColumnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <div className="board-header">
          <h1 className="board-title">{board.name}</h1>
        </div>
        <div className="board-columns">
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
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
    </DndContext>
  );
}
