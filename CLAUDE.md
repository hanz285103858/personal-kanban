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

增量式 Demo 驱动开发，每完成一个 Demo 需用户验证后再继续。
