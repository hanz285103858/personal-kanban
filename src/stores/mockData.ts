import type { Board } from '../types';

export const mockBoard: Board = {
  id: 'board-1',
  name: '我的看板',
  columns: [
    {
      id: 'col-1',
      name: '待办',
      order: 0,
      tasks: [
        { id: 'task-1', columnId: 'col-1', title: '学习 React 基础', createdAt: new Date() },
        { id: 'task-2', columnId: 'col-1', title: '完成项目文档', createdAt: new Date() },
      ],
    },
    {
      id: 'col-2',
      name: '进行中',
      order: 1,
      tasks: [
        { id: 'task-3', columnId: 'col-2', title: '开发看板功能', createdAt: new Date() },
      ],
    },
    {
      id: 'col-3',
      name: '已完成',
      order: 2,
      tasks: [
        { id: 'task-4', columnId: 'col-3', title: '初始化项目', createdAt: new Date() },
      ],
    },
  ],
};
