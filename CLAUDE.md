# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Kanban - A web-based personal task management tool using Kanban methodology. Runs locally in the browser with IndexedDB storage.

## Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # TypeScript check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

**Tech Stack:** React 19 + Vite 8 + TypeScript

**Planned Structure:**
- `src/components/Board/` - Kanban board container
- `src/components/Column/` - Individual columns (Todo/In Progress/Done)
- `src/components/TaskCard/` - Task cards with drag support
- `src/types/` - TypeScript interfaces (Board, Column, Task, SubTask, Tag)
- `src/stores/` - State management
- `src/hooks/` - Custom React hooks

**Data Model:** See REQUIREMENTS.md for full interface definitions

**Key Libraries to Add:**
- `@dnd-kit/core` - Drag and drop
- `dexie` - IndexedDB wrapper for persistence

## Development Approach

This project follows an incremental demo-based development process. Each feature is developed as a standalone demo for user validation before proceeding. See REQUIREMENTS.md for the full development roadmap and current progress.
