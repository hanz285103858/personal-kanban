# CLAUDE.md

使用中文。

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

## 开发原则
- 增量式开发，待开发特性拆分成子demo，每开发完一个demo请用户检查正确性。
- 需要debug时，不要直接修改，先想出自验证方法。

## Git 提交规范

每次提交必须详细描述修改点：
- 列出新增/修改/删除的文件
- 说明每个文件的具体改动内容
- 描述新增功能或修复的问题
- 推远端仓库

