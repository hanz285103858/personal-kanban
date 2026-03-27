import { useState, useCallback } from 'react';
import type { Board, Task } from '../types';
import { mockBoard } from '../stores/mockData';

// 生成唯一ID
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useBoard() {
  const [board, setBoard] = useState<Board>(mockBoard);

  // 添加任务
  const addTask = useCallback((columnId: string, title: string) => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: generateId(),
      columnId,
      title: title.trim(),
      createdAt: new Date(),
    };

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      ),
    }));
  }, []);

  // 删除任务
  const deleteTask = useCallback((taskId: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    }));
  }, []);

  // 更新任务标题
  const updateTask = useCallback((taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId ? { ...task, title: newTitle.trim() } : task
        ),
      })),
    }));
  }, []);

  // 移动任务到另一列
  const moveTask = useCallback((taskId: string, targetColumnId: string) => {
    setBoard((prev) => {
      let movedTask: Task | null = null;

      // 找到并移除任务
      const columnsWithoutTask = prev.columns.map((col) => {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) {
          movedTask = { ...task, columnId: targetColumnId };
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        return col;
      });

      if (!movedTask) return prev;

      // 添加到目标列
      return {
        ...prev,
        columns: columnsWithoutTask.map((col) =>
          col.id === targetColumnId
            ? { ...col, tasks: [...col.tasks, movedTask!] }
            : col
        ),
      };
    });
  }, []);

  return {
    board,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
  };
}
