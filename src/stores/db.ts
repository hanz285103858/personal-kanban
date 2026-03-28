import Dexie, { type EntityTable } from 'dexie';

// 子任务类型
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// 四象限类型
export type Quadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';

// 标签类型
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// 预设标签
export const PRESET_TAGS: Tag[] = [
  { id: 'tag-work', name: '工作', color: '#3498db' },
  { id: 'tag-personal', name: '个人', color: '#9b59b6' },
  { id: 'tag-study', name: '学习', color: '#2ecc71' },
  { id: 'tag-health', name: '健康', color: '#e74c3c' },
  { id: 'tag-finance', name: '财务', color: '#f39c12' },
  { id: 'tag-family', name: '家庭', color: '#1abc9c' },
  { id: 'tag-project', name: '项目', color: '#e91e63' },
  { id: 'tag-idea', name: '想法', color: '#00bcd4' },
];

// 任务类型
export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;  // 任务描述/备注
  dueDate?: string;  // 截止日期 (YYYY-MM-DD 格式)
  subtasks?: Subtask[];  // 子任务列表
  quadrant?: Quadrant;  // 四象限标记
  tags?: string[];  // 标签ID列表
  createdAt: Date;
}

// 列类型
export interface Column {
  id: string;
  boardId: string;  // 所属看板ID
  name: string;
  order: number;
  wipLimit?: number;  // WIP限制（最大任务数）
}

// 看板类型
export interface Board {
  id: string;
  name: string;
  order: number;  // 看板排序
  createdAt: Date;
}

// 数据库定义
const db = new Dexie('PersonalKanbanDB') as Dexie & {
  boards: EntityTable<Board, 'id'>;
  columns: EntityTable<Column, 'id'>;
  tasks: EntityTable<Task, 'id'>;
};

db.version(2).stores({
  boards: 'id, name, order',
  columns: 'id, boardId, order',
  tasks: 'id, columnId',
}).upgrade(async (tx) => {
  // 迁移现有数据，为列添加 boardId
  const columns = await tx.table('columns').toArray();
  for (const col of columns) {
    if (!col.boardId) {
      await tx.table('columns').update(col.id, { boardId: 'board-1' });
    }
  }
});

export { db };
