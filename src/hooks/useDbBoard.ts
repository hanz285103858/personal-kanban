import { useState, useEffect, useCallback } from 'react';
import { db, type Task, type Column, type Board, type Subtask, type Quadrant } from '../stores/db';

// 生成唯一ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 完整的看板数据结构（用于渲染）
export interface BoardData {
  board: Board;
  columns: (Column & { tasks: Task[] })[];
}

// 默认数据
const defaultBoard: Board = { id: 'board-1', name: '我的看板' };
const defaultColumns: Column[] = [
  { id: 'col-1', name: '待办', order: 0 },
  { id: 'col-2', name: '进行中', order: 1 },
  { id: 'col-3', name: '已完成', order: 2 },
];
const defaultTasks: Task[] = [
  { id: 'task-1', columnId: 'col-1', title: '学习 React 基础', createdAt: new Date() },
  { id: 'task-2', columnId: 'col-1', title: '完成项目文档', createdAt: new Date() },
  { id: 'task-3', columnId: 'col-2', title: '开发看板功能', createdAt: new Date() },
  { id: 'task-4', columnId: 'col-3', title: '初始化项目', createdAt: new Date() },
];

export function useDbBoard() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      // 检查是否已有数据
      let board = await db.boards.get('board-1');
      let columns = await db.columns.toArray();
      let tasks = await db.tasks.toArray();

      // 如果没有数据，初始化默认数据
      if (!board) {
        await db.boards.add(defaultBoard);
        await db.columns.bulkAdd(defaultColumns);
        await db.tasks.bulkAdd(defaultTasks);
        board = defaultBoard;
        columns = defaultColumns;
        tasks = defaultTasks;
      }

      // 组装数据
      const sortedColumns = columns.sort((a, b) => a.order - b.order);
      const data: BoardData = {
        board,
        columns: sortedColumns.map((col) => ({
          ...col,
          tasks: tasks.filter((t) => t.columnId === col.id),
        })),
      };

      setBoardData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 添加任务
  const addTask = useCallback(async (columnId: string, title: string) => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: generateId(),
      columnId,
      title: title.trim(),
      createdAt: new Date(),
    };

    await db.tasks.add(newTask);
    await loadData();
  }, [loadData]);

  // 删除任务
  const deleteTask = useCallback(async (taskId: string) => {
    await db.tasks.delete(taskId);
    await loadData();
  }, [loadData]);

  // 更新任务
  const updateTask = useCallback(async (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    await db.tasks.update(taskId, { title: newTitle.trim() });
    await loadData();
  }, [loadData]);

  // 移动任务
  const moveTask = useCallback(async (taskId: string, targetColumnId: string) => {
    await db.tasks.update(taskId, { columnId: targetColumnId });
    await loadData();
  }, [loadData]);

  // 更新任务描述
  const updateTaskDescription = useCallback(async (taskId: string, description: string) => {
    await db.tasks.update(taskId, { description });
    await loadData();
  }, [loadData]);

  // 更新任务截止日期
  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: string | undefined) => {
    await db.tasks.update(taskId, { dueDate });
    await loadData();
  }, [loadData]);

  // 添加子任务
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: generateId(),
      title: title.trim(),
      completed: false,
    };

    const subtasks = [...(task.subtasks || []), newSubtask];
    await db.tasks.update(taskId, { subtasks });
    await loadData();
  }, [loadData]);

  // 切换子任务完成状态
  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await db.tasks.update(taskId, { subtasks });
    await loadData();
  }, [loadData]);

  // 删除子任务
  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    await db.tasks.update(taskId, { subtasks });
    await loadData();
  }, [loadData]);

  // 更新子任务标题
  const updateSubtaskTitle = useCallback(async (taskId: string, subtaskId: string, title: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, title: title.trim() } : st
    );
    await db.tasks.update(taskId, { subtasks });
    await loadData();
  }, [loadData]);

  // 更新任务象限
  const updateTaskQuadrant = useCallback(async (taskId: string, quadrant: Quadrant | undefined) => {
    await db.tasks.update(taskId, { quadrant });
    await loadData();
  }, [loadData]);

  // 更新任务标签
  const updateTaskTags = useCallback(async (taskId: string, tags: string[]) => {
    await db.tasks.update(taskId, { tags });
    await loadData();
  }, [loadData]);

  // 切换任务标签
  const toggleTaskTag = useCallback(async (taskId: string, tagId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const currentTags = task.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];

    await db.tasks.update(taskId, { tags: newTags });
    await loadData();
  }, [loadData]);

  // 更新列WIP限制
  const updateColumnWipLimit = useCallback(async (columnId: string, wipLimit: number | undefined) => {
    await db.columns.update(columnId, { wipLimit });
    await loadData();
  }, [loadData]);

  return {
    boardData,
    loading,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
    updateTaskDescription,
    updateTaskDueDate,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateSubtaskTitle,
    updateTaskQuadrant,
    updateTaskTags,
    toggleTaskTag,
    updateColumnWipLimit,
  };
}
