# 个人看板工具 - 需求文档

## 一、项目概述

| 项目名称 | Personal Kanban（个人看板工具） |
|---------|-------------------------------|
| 应用形态 | Web应用（本地运行） |
| 技术栈 | React + Vite + TypeScript |
| 数据存储 | IndexedDB（浏览器本地存储） |
| 目标用户 | 个人任务管理 |
| 开发环境 | WSL (Windows Subsystem for Linux) |

---

## 二、功能需求清单

### Phase 1 - MVP核心

#### Demo 1.1 - 项目初始化（最简可运行版本）
- [x] 创建 React + Vite + TypeScript 项目
- [ ] 项目能够成功启动并在浏览器显示
- [ ] 基础项目结构搭建

#### Demo 1.2 - 看板列表展示
- [ ] 显示三列：待办 / 进行中 / 已完成
- [ ] 使用模拟数据（mock data）
- [ ] 基础样式布局

#### Demo 1.3 - 任务卡片
- [ ] 在列中显示任务卡片
- [ ] 支持创建新任务
- [ ] 支持删除任务
- [ ] 仍使用模拟数据

#### Demo 1.4 - 拖拽功能
- [ ] 实现任务在列间拖拽移动
- [ ] 使用 react-beautiful-dnd 或 @dnd-kit
- [ ] 拖拽后数据更新

#### Demo 1.5 - 本地存储
- [ ] 集成 IndexedDB（使用 dexie.js 库）
- [ ] 任务数据持久化
- [ ] 刷新页面数据不丢失

---

### Phase 2 - 任务增强

#### Demo 2.1 - 任务编辑
- [ ] 双击任务卡片进入编辑模式
- [ ] 修改任务标题
- [ ] 任务描述/备注（多行文本）

#### Demo 2.2 - 截止日期
- [ ] 日期选择器
- [ ] 显示剩余天数
- [ ] 过期任务标红提醒

#### Demo 2.3 - 子任务
- [ ] 任务下添加子任务列表
- [ ] 子任务独立勾选完成
- [ ] 显示子任务完成进度

#### Demo 2.4 - 四象限标记
- [ ] 重要紧急
- [ ] 重要不紧急
- [ ] 不重要紧急
- [ ] 不重要不紧急
- [ ] 象限可视化展示

---

### Phase 3 - 管理增强

#### Demo 3.1 - 优先级标签
- [ ] 彩色标签系统
- [ ] 支持自定义颜色
- [ ] 任务卡片显示标签

#### Demo 3.2 - WIP限制
- [ ] 每列可设置最大任务数
- [ ] 超出限制时提示
- [ ] 可开关此功能

#### Demo 3.3 - 搜索筛选
- [ ] 按关键词搜索
- [ ] 按标签筛选
- [ ] 按日期范围筛选
- [ ] 按象限筛选

#### Demo 3.4 - 主题切换
- [ ] 深色/浅色模式
- [ ] 记住用户偏好
- [ ] 平滑切换动画

---

### Phase 4 - 高级功能

#### Demo 4.1 - 多看板
- [ ] 创建多个看板
- [ ] 看板列表切换
- [ ] 看板重命名/删除

#### Demo 4.2 - 统计面板
- [ ] 按周/月统计
- [ ] 任务完成率图表
- [ ] 四象限分布图
- [ ] 任务趋势图

#### Demo 4.3 - 数据导出
- [ ] 导出为 JSON 格式
- [ ] 导出为 CSV 格式
- [ ] 数据导入恢复

---

## 三、数据结构设计

```typescript
// 看板
interface Board {
  id: string;
  name: string;
  createdAt: Date;
  columns: Column[];
}

// 列
interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  wipLimit?: number;
  tasks: Task[];
}

// 任务
interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  quadrant?: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  priority?: 'high' | 'medium' | 'low';
  tags?: Tag[];
  subtasks?: SubTask[];
  createdAt: Date;
  completedAt?: Date;
}

// 子任务
interface SubTask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
}

// 标签
interface Tag {
  id: string;
  name: string;
  color: string;
}
```

---

## 四、技术选型

| 类别 | 技术方案 | 说明 |
|------|---------|------|
| 框架 | React 18 | 主流框架，生态丰富 |
| 构建工具 | Vite | 开发体验好，热更新快 |
| 语言 | TypeScript | 类型安全，减少bug |
| 拖拽 | @dnd-kit/core | 现代、轻量的拖拽库 |
| 本地存储 | Dexie.js | IndexedDB 的封装，API友好 |
| 样式 | CSS Modules / Tailwind | 按需选择 |
| 图表 | Chart.js / Recharts | 统计面板使用 |

---

## 五、开发流程

每个 Demo 版本的验证流程：
1. 开发完成后通知用户
2. 用户运行 `npm run dev` 启动项目
3. 用户在浏览器访问 http://localhost:5173
4. 用户验证功能是否正常
5. 验证通过后进入下一阶段

---

## 六、目录结构（预览）

```
personal-kanban/
├── README.md
├── REQUIREMENTS.md          # 本文档
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Board/
│   │   ├── Column/
│   │   ├── TaskCard/
│   │   └── ...
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── styles/
└── public/
```

---

## 七、更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-27 | v0.1 | 初始需求文档 |
