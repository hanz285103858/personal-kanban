// 任务
export interface Task {
  id: string;
  columnId: string;
  title: string;
  createdAt: Date;
}

// 列
export interface Column {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
}

// 看板
export interface Board {
  id: string;
  name: string;
  columns: Column[];
}
