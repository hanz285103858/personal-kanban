# CLAUDE.md

本文件为 Claude Code 提供项目指导。

## 常用命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:5173)
npm run build    # TypeScript检查 + 生产构建
npm run lint     # ESLint检查
```

## 技术栈

React 19 + Vite 8 + TypeScript

## 目录结构

```
src/
├── components/    # 组件 (Board/Column/TaskCard)
├── hooks/         # 自定义hooks (useBoard)
├── types/         # TypeScript类型定义
└── stores/        # 模拟数据
```

## 关键文档

- **[REQUIREMENTS.md](REQUIREMENTS.md)** - 完整需求文档、数据模型、技术选型
- **[TODOLIST.md](TODOLIST.md)** - 开发进度追踪

## 开发方式

增量式 Demo 驱动开发，每完成一个 Demo 需用户验证后再继续。每完成一个Demo，git提交代码，刷新**[TODOLIST.md](TODOLIST.md)**

## Git 提交规范

每次提交必须详细描述修改点：
- 列出新增/修改/删除的文件
- 说明每个文件的具体改动内容
- 描述新增功能或修复的问题

示例：
```
feat: 任务描述功能 - Demo 2.1

新增功能:
- 点击任务卡片打开详情弹窗
- 支持编辑任务标题和描述

新增文件:
- src/components/TaskDetail/TaskDetail.tsx: 任务详情弹窗组件
- src/components/TaskDetail/TaskDetail.css: 弹窗样式

修改文件:
- src/stores/db.ts: Task接口添加description字段
- src/hooks/useDbBoard.ts: 新增updateTaskDescription方法
```
