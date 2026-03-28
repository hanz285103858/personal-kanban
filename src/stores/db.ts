import Dexie, { type EntityTable } from 'dexie';

// 子任务类型
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// 四象限类型
export type Quadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';

// 任务类型
export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;  // 任务描述/备注
  dueDate?: string;  // 截止日期 (YYYY-MM-DD 格式)
  subtasks?: Subtask[];  // 子任务列表
  quadrant?: Quadrant;  // 四象限标记
  createdAt: Date;
}

// 列类型
export interface Column {
  id: string;
  name: string;
  order: number;
}

// 看板类型
export interface Board {
  id: string;
  name: string;
}

// 数据库定义
const db = new Dexie('PersonalKanbanDB') as Dexie & {
  boards: EntityTable<Board, 'id'>;
  columns: EntityTable<Column, 'id'>;
  tasks: EntityTable<Task, 'id'>;
};

db.version(1).stores({
  boards: 'id, name',
  columns: 'id, order',
  tasks: 'id, columnId',
});

export { db };
