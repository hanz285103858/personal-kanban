import type { Task, Column, Board, PRESET_TAGS } from '../../stores/db';
import './DataExport.css';

interface DataExportProps {
  board: Board;
  columns: Column[];
  tasks: Task[];
  tags?: typeof PRESET_TAGS;
}

// 获取列名
function getColumnName(columnId: string, columns: Column[]): string {
  return columns.find(c => c.id === columnId)?.name || columnId;
}

// 获取标签名
function getTagNames(tagIds: string[] | undefined, tags: typeof PRESET_TAGS): string {
  if (!tagIds || tagIds.length === 0) return '';
  return tagIds
    .map(tagId => tags.find(t => t.id === tagId)?.name || tagId)
    .join('; ');
}

// 象限名称映射
const QUADRANT_NAMES: Record<string, string> = {
  'urgent-important': '重要紧急',
  'not-urgent-important': '重要不紧急',
  'urgent-not-important': '不重要紧急',
  'not-urgent-not-important': '不重要不紧急',
};

// 导出为 JSON
function exportToJSON(board: Board, columns: Column[], tasks: Task[]): void {
  const exportData = {
    exportDate: new Date().toISOString(),
    board: {
      id: board.id,
      name: board.name,
    },
    columns: columns.map(col => ({
      id: col.id,
      name: col.name,
      order: col.order,
      wipLimit: col.wipLimit,
    })),
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      column: getColumnName(task.columnId, columns),
      dueDate: task.dueDate || '',
      quadrant: task.quadrant ? QUADRANT_NAMES[task.quadrant] : '',
      tags: task.tags || [],
      subtasks: task.subtasks || [],
      createdAt: task.createdAt,
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `kanban-${board.name}-${getDateString()}.json`, 'application/json');
}

// 导出为 CSV
function exportToCSV(board: Board, columns: Column[], tasks: Task[], tags: typeof PRESET_TAGS): void {
  const headers = [
    '标题',
    '描述',
    '列',
    '截止日期',
    '象限',
    '标签',
    '子任务总数',
    '已完成子任务',
    '创建时间',
  ];

  const rows = tasks.map(task => {
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.completed).length;

    return [
      escapeCSV(task.title),
      escapeCSV(task.description || ''),
      escapeCSV(getColumnName(task.columnId, columns)),
      escapeCSV(task.dueDate || ''),
      escapeCSV(task.quadrant ? QUADRANT_NAMES[task.quadrant] : ''),
      escapeCSV(getTagNames(task.tags, tags)),
      subtasks.length.toString(),
      completedSubtasks.toString(),
      escapeCSV(formatDate(task.createdAt)),
    ];
  });

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  // 添加 BOM 以支持中文
  const bom = '\uFEFF';
  downloadFile(bom + csv, `kanban-${board.name}-${getDateString()}.csv`, 'text/csv;charset=utf-8');
}

// CSV 特殊字符转义
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// 格式化日期
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 获取日期字符串用于文件名
function getDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

// 下载文件
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DataExport({ board, columns, tasks, tags = [] }: DataExportProps) {
  const handleExportJSON = () => {
    exportToJSON(board, columns, tasks);
  };

  const handleExportCSV = () => {
    exportToCSV(board, columns, tasks, tags);
  };

  return (
    <div className="data-export">
      <button
        className="export-btn json-btn"
        onClick={handleExportJSON}
        title="导出为 JSON 格式"
      >
        📄 JSON
      </button>
      <button
        className="export-btn csv-btn"
        onClick={handleExportCSV}
        title="导出为 CSV 格式"
      >
        📊 CSV
      </button>
    </div>
  );
}
