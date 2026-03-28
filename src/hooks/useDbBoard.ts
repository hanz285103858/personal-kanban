import { useState, useEffect, useCallback } from 'react';
import { db, type Task, type Column, type Board, type Subtask, type Quadrant } from '../stores/db';

// 生成唯一ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 完整的看板数据结构（用于渲染）
export interface BoardData {
  board: Board;
  columns: (Column & { tasks: Task[] })[];
}

// 默认列模板
const getDefaultColumns = (boardId: string): Column[] => [
  { id: `${boardId}-col-1`, boardId, name: '待办', order: 0 },
  { id: `${boardId}-col-2`, boardId, name: '进行中', order: 1 },
  { id: `${boardId}-col-3`, boardId, name: '已完成', order: 2 },
];

// 默认任务模板
const getDefaultTasks = (boardId: string): Task[] => [
  { id: `${boardId}-task-1`, columnId: `${boardId}-col-1`, title: '学习 React 基础', order: 0, createdAt: new Date() },
  { id: `${boardId}-task-2`, columnId: `${boardId}-col-1`, title: '完成项目文档', order: 1, createdAt: new Date() },
  { id: `${boardId}-task-3`, columnId: `${boardId}-col-2`, title: '开发看板功能', order: 0, createdAt: new Date() },
  { id: `${boardId}-task-4`, columnId: `${boardId}-col-3`, title: '初始化项目', order: 0, createdAt: new Date() },
];

const CURRENT_BOARD_KEY = 'personal-kanban-current-board';

export function useDbBoard() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载所有看板列表
  const loadAllBoards = useCallback(async () => {
    const boards = await db.boards.orderBy('order').toArray();
    setAllBoards(boards);
    return boards;
  }, []);

  // 加载当前看板数据
  const loadBoardData = useCallback(async (boardId: string) => {
    try {
      const board = await db.boards.get(boardId);
      if (!board) return null;

      const columns = await db.columns.where('boardId').equals(boardId).sortBy('order');
      const columnIds = columns.map(c => c.id);
      const tasks = columnIds.length > 0
        ? await db.tasks.where('columnId').anyOf(columnIds).sortBy('order')
        : [];

      const data: BoardData = {
        board,
        columns: columns.map((col) => ({
          ...col,
          tasks: tasks.filter((t: Task) => t.columnId === col.id),
        })),
      };

      setBoardData(data);
      return data;
    } catch (error) {
      console.error('Failed to load board data:', error);
      return null;
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      try {
        // 尝试获取所有看板
        let boards = await db.boards.toArray();

        // 如果没有看板，创建默认看板
        if (boards.length === 0) {
          const defaultBoard: Board = {
            id: 'board-1',
            name: '我的看板',
            order: 0,
            createdAt: new Date(),
          };
          await db.boards.add(defaultBoard);
          await db.columns.bulkAdd(getDefaultColumns(defaultBoard.id));
          await db.tasks.bulkAdd(getDefaultTasks(defaultBoard.id));
          boards = [defaultBoard];
        }

        // 获取当前看板ID
        const savedBoardId = localStorage.getItem(CURRENT_BOARD_KEY);
        const targetBoardId = savedBoardId && boards.some(b => b.id === savedBoardId)
          ? savedBoardId
          : boards[0].id;

        setCurrentBoardId(targetBoardId);
        await loadBoardData(targetBoardId);
        setAllBoards(boards);
      } catch (error) {
        console.error('Failed to initialize:', error);
        // 如果初始化失败，尝试重置数据库
        try {
          await db.delete();
          await db.open();
          const defaultBoard: Board = {
            id: 'board-1',
            name: '我的看板',
            order: 0,
            createdAt: new Date(),
          };
          await db.boards.add(defaultBoard);
          await db.columns.bulkAdd(getDefaultColumns(defaultBoard.id));
          await db.tasks.bulkAdd(getDefaultTasks(defaultBoard.id));
          setCurrentBoardId(defaultBoard.id);
          await loadBoardData(defaultBoard.id);
          setAllBoards([defaultBoard]);
        } catch (resetError) {
          console.error('Failed to reset database:', resetError);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadBoardData]);

  // 切换看板
  const switchBoard = useCallback(async (boardId: string) => {
    setCurrentBoardId(boardId);
    localStorage.setItem(CURRENT_BOARD_KEY, boardId);
    await loadBoardData(boardId);
  }, [loadBoardData]);

  // 创建新看板
  const createBoard = useCallback(async (name: string) => {
    if (!name.trim()) return null;

    const newBoard: Board = {
      id: generateId(),
      name: name.trim(),
      order: allBoards.length,
      createdAt: new Date(),
    };

    await db.boards.add(newBoard);
    await db.columns.bulkAdd(getDefaultColumns(newBoard.id));

    await loadAllBoards();
    await switchBoard(newBoard.id);

    return newBoard;
  }, [allBoards.length, loadAllBoards, switchBoard]);

  // 删除看板
  const deleteBoard = useCallback(async (boardId: string) => {
    if (allBoards.length <= 1) {
      alert('至少保留一个看板');
      return false;
    }

    // 删除看板及其所有数据
    const columns = await db.columns.where('boardId').equals(boardId).toArray();
    const columnIds = columns.map(c => c.id);

    if (columnIds.length > 0) {
      await db.tasks.where('columnId').anyOf(columnIds).delete();
    }
    await db.columns.where('boardId').equals(boardId).delete();
    await db.boards.delete(boardId);

    // 如果删除的是当前看板，切换到第一个看板
    if (currentBoardId === boardId) {
      const remainingBoards = allBoards.filter(b => b.id !== boardId);
      await switchBoard(remainingBoards[0].id);
    }

    await loadAllBoards();
    return true;
  }, [allBoards, currentBoardId, loadAllBoards, switchBoard]);

  // 重命名看板
  const renameBoard = useCallback(async (boardId: string, name: string) => {
    if (!name.trim()) return;

    await db.boards.update(boardId, { name: name.trim() });
    await loadAllBoards();
    if (currentBoardId === boardId) {
      await loadBoardData(boardId);
    }
  }, [currentBoardId, loadAllBoards, loadBoardData]);

  // 添加任务
  const addTask = useCallback(async (columnId: string, title: string) => {
    if (!title.trim()) return;

    // 获取当前列的任务数量，用于计算 order
    const columnTasks = await db.tasks
      .where('columnId')
      .equals(columnId)
      .toArray();

    const maxOrder = columnTasks.length > 0
      ? Math.max(...columnTasks.map(t => t.order ?? 0))
      : -1;

    const newTask: Task = {
      id: generateId(),
      columnId,
      title: title.trim(),
      order: maxOrder + 1,
      createdAt: new Date(),
    };

    await db.tasks.add(newTask);
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 删除任务
  const deleteTask = useCallback(async (taskId: string) => {
    await db.tasks.delete(taskId);
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新任务标题
  const updateTask = useCallback(async (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    await db.tasks.update(taskId, { title: newTitle.trim() });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 移动任务
  const moveTask = useCallback(async (taskId: string, targetColumnId: string) => {
    await db.tasks.update(taskId, { columnId: targetColumnId });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 重排序任务（支持同列排序和跨列移动）
  const reorderTasks = useCallback(async (
    taskId: string,
    targetColumnId: string,
    newOrder: number
  ) => {
    if (!currentBoardId) return;

    const movingTask = await db.tasks.get(taskId);
    if (!movingTask) return;

    const oldColumnId = movingTask.columnId;
    const isSameColumn = oldColumnId === targetColumnId;

    if (isSameColumn) {
      // 同列内重排序
      const columnTasks = await db.tasks
        .where('columnId')
        .equals(targetColumnId)
        .sortBy('order');

      const otherTasks = columnTasks.filter(t => t.id !== taskId);
      const reorderedTasks = [
        ...otherTasks.slice(0, newOrder),
        movingTask,
        ...otherTasks.slice(newOrder)
      ];

      // 批量更新 order
      for (let i = 0; i < reorderedTasks.length; i++) {
        await db.tasks.update(reorderedTasks[i].id, { order: i });
      }
    } else {
      // 跨列移动
      // 1. 从原列移除，更新原列其他任务的 order
      const oldColumnTasks = await db.tasks
        .where('columnId')
        .equals(oldColumnId)
        .sortBy('order');

      const remainingTasks = oldColumnTasks.filter(t => t.id !== taskId);
      for (let i = 0; i < remainingTasks.length; i++) {
        await db.tasks.update(remainingTasks[i].id, { order: i });
      }

      // 2. 插入到新列的指定位置
      const newColumnTasks = await db.tasks
        .where('columnId')
        .equals(targetColumnId)
        .sortBy('order');

      const reorderedTasks = [
        ...newColumnTasks.slice(0, newOrder),
        { ...movingTask, columnId: targetColumnId },
        ...newColumnTasks.slice(newOrder)
      ];

      for (let i = 0; i < reorderedTasks.length; i++) {
        await db.tasks.update(reorderedTasks[i].id, {
          order: i,
          columnId: targetColumnId
        });
      }
    }

    await loadBoardData(currentBoardId);
  }, [currentBoardId, loadBoardData]);

  // 更新任务描述
  const updateTaskDescription = useCallback(async (taskId: string, description: string) => {
    await db.tasks.update(taskId, { description });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新任务截止日期
  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: string | undefined) => {
    await db.tasks.update(taskId, { dueDate });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

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
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 切换子任务完成状态
  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await db.tasks.update(taskId, { subtasks });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 删除子任务
  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    await db.tasks.update(taskId, { subtasks });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新子任务标题
  const updateSubtaskTitle = useCallback(async (taskId: string, subtaskId: string, title: string) => {
    const task = await db.tasks.get(taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, title: title.trim() } : st
    );
    await db.tasks.update(taskId, { subtasks });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新任务象限
  const updateTaskQuadrant = useCallback(async (taskId: string, quadrant: Quadrant | undefined) => {
    await db.tasks.update(taskId, { quadrant });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新任务标签
  const updateTaskTags = useCallback(async (taskId: string, tags: string[]) => {
    await db.tasks.update(taskId, { tags });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 切换任务标签
  const toggleTaskTag = useCallback(async (taskId: string, tagId: string) => {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const currentTags = task.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];

    await db.tasks.update(taskId, { tags: newTags });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 更新列WIP限制
  const updateColumnWipLimit = useCallback(async (columnId: string, wipLimit: number | undefined) => {
    await db.columns.update(columnId, { wipLimit });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 重命名列
  const renameColumn = useCallback(async (columnId: string, name: string) => {
    if (!name.trim()) return;

    await db.columns.update(columnId, { name: name.trim() });
    if (currentBoardId) {
      await loadBoardData(currentBoardId);
    }
  }, [currentBoardId, loadBoardData]);

  // 添加新列
  const addColumn = useCallback(async (name: string) => {
    if (!currentBoardId || !name.trim()) return null;

    // 获取当前看板的列数量，用于计算 order
    const existingColumns = await db.columns
      .where('boardId')
      .equals(currentBoardId)
      .toArray();

    const maxOrder = existingColumns.length > 0
      ? Math.max(...existingColumns.map(c => c.order))
      : -1;

    const newColumn: Column = {
      id: generateId(),
      boardId: currentBoardId,
      name: name.trim(),
      order: maxOrder + 1,
    };

    await db.columns.add(newColumn);
    await loadBoardData(currentBoardId);

    return newColumn;
  }, [currentBoardId, loadBoardData]);

  // 重排序列
  const reorderColumns = useCallback(async (
    sourceId: string,
    targetId: string
  ) => {
    if (!currentBoardId) return;

    const columns = await db.columns
      .where('boardId')
      .equals(currentBoardId)
      .sortBy('order');

    const sourceIndex = columns.findIndex(c => c.id === sourceId);
    const targetIndex = columns.findIndex(c => c.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // 移动元素
    const [removed] = columns.splice(sourceIndex, 1);
    columns.splice(targetIndex, 0, removed);

    // 批量更新 order
    for (let i = 0; i < columns.length; i++) {
      await db.columns.update(columns[i].id, { order: i });
    }

    await loadBoardData(currentBoardId);
  }, [currentBoardId, loadBoardData]);

  return {
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
    renameColumn,
    addColumn,
    reorderColumns,
    reorderTasks,
  };
}
