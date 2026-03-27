import Dexie, { type EntityTable } from 'dexie';

// 任务类型
export interface Task {
  id: string;
  columnId: string;
  title: string;
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
