# CLAUDE.md

本文件为 Claude Code 提供项目指导。

## 常用命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:5173)
npm run build    # TypeScript检查 + 生产构建
npm run lint     # ESLint检查
```

## 技术栈

- React 19 + Vite 8 + TypeScript
- IndexedDB (Dexie.js) - 本地数据持久化
- @dnd-kit - 拖拽功能 (core + sortable)

## 目录结构

```
src/
├── components/     # UI组件
│   ├── Board/      # 看板主组件
│   ├── Column/     # 列组件
│   ├── TaskCard/   # 任务卡片
│   ├── TaskDetail/ # 任务详情弹窗
│   ├── SearchFilter/ # 搜索筛选
│   ├── StatisticsPanel/ # 统计面板
│   └── ...
├── hooks/          # 自定义hooks
│   └── useDbBoard.ts # 数据库操作hook
├── stores/         # 数据存储
│   └── db.ts       # Dexie数据库定义
├── contexts/       # React Context
│   └── ThemeContext.tsx # 主题上下文
└── utils/          # 工具函数
```

## 关键文档

- **[REQUIREMENTS.md](REQUIREMENTS.md)** - 完整需求文档、数据模型、技术选型

## 开发进度管理

使用 **planning-with-files skill** 管理开发进展：

- `/plan` - 启动规划会话，创建 task_plan.md、findings.md、progress.md
- `/status` - 查看当前开发状态

## 已完成功能

| Phase | Demo | 功能 | 状态 |
|-------|------|------|------|
| 1 | 1.1-1.5 | MVP核心（项目初始化、看板展示、任务CRUD、拖拽、本地存储） | ✅ |
| 2 | 2.1-2.4 | 任务增强（描述、截止日期、子任务、四象限） | ✅ |
| 3 | 3.1-3.4 | 管理增强（标签、WIP限制、搜索筛选、主题切换） | ✅ |
| 4 | 4.1-4.3 | 高级功能（多看板、统计面板、数据导出） | ✅ |
| 4 | 4.4 | 列管理增强（列名编辑、添加列、任务排序） | ✅ |

## Git 提交规范

每次提交必须详细描述修改点：
- 列出新增/修改/删除的文件
- 说明每个文件的具体改动内容
- 描述新增功能或修复的问题
- 推远端仓库


## 数据库版本

当前版本: v3

| 版本 | 变更 |
|------|------|
| v1 | 初始schema |
| v2 | 添加多看板支持 (Board.order, Column.boardId) |
| v3 | 添加任务排序支持 (Task.order) |
