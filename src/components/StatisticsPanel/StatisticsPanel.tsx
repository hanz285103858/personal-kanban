import { useState, useMemo } from 'react';
import type { Task, Quadrant } from '../../stores/db';
import './StatisticsPanel.css';

interface StatisticsPanelProps {
  tasks: Task[];
  onClose: () => void;
}

type TimeRange = 'week' | 'month';

// 四象限配置
const QUADRANT_CONFIG: Record<Quadrant, { name: string; color: string; icon: string }> = {
  'urgent-important': { name: '重要紧急', color: '#e74c3c', icon: '🔥' },
  'not-urgent-important': { name: '重要不紧急', color: '#3498db', icon: '📌' },
  'urgent-not-important': { name: '不重要紧急', color: '#f39c12', icon: '⚡' },
  'not-urgent-not-important': { name: '不重要不紧急', color: '#95a5a6', icon: '📋' },
};

export function StatisticsPanel({ tasks, onClose }: StatisticsPanelProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // 根据时间范围过滤任务
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= now;
    });
  }, [tasks, timeRange]);

  // 统计数据
  const stats = useMemo(() => {
    const total = filteredTasks.length;

    // 按象限分布
    const quadrantCount: Record<Quadrant, number> = {
      'urgent-important': 0,
      'not-urgent-important': 0,
      'urgent-not-important': 0,
      'not-urgent-not-important': 0,
    };

    // 子任务完成统计
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    // 截止日期统计
    let overdueTasks = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredTasks.forEach(task => {
      // 象限统计
      if (task.quadrant) {
        quadrantCount[task.quadrant]++;
      }

      // 子任务统计
      if (task.subtasks && task.subtasks.length > 0) {
        totalSubtasks += task.subtasks.length;
        completedSubtasks += task.subtasks.filter(st => st.completed).length;
      }

      // 过期任务统计
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdueTasks++;
        }
      }
    });

    // 按标签统计
    const tagCount: Record<string, number> = {};
    filteredTasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tagId => {
          tagCount[tagId] = (tagCount[tagId] || 0) + 1;
        });
      }
    });

    // 按日期统计（用于趋势图）
    const dailyStats: { date: string; count: number }[] = [];
    const days = timeRange === 'week' ? 7 : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;
      dailyStats.push({ date: dateStr, count });
    }

    return {
      total,
      quadrantCount,
      totalSubtasks,
      completedSubtasks,
      overdueTasks,
      tagCount,
      dailyStats,
    };
  }, [filteredTasks, timeRange]);

  // 计算子任务完成率
  const subtaskCompletionRate = stats.totalSubtasks > 0
    ? Math.round((stats.completedSubtasks / stats.totalSubtasks) * 100)
    : 0;

  // 最大日任务数（用于图表缩放）
  const maxDailyCount = Math.max(...stats.dailyStats.map(d => d.count), 1);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={e => e.stopPropagation()}>
        <div className="stats-header">
          <h2>📊 统计面板</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-time-range">
          <button
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            近一周
          </button>
          <button
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            近一月
          </button>
        </div>

        <div className="stats-content">
          {/* 概览卡片 */}
          <div className="stats-overview">
            <div className="overview-card">
              <div className="overview-icon">📝</div>
              <div className="overview-info">
                <span className="overview-value">{stats.total}</span>
                <span className="overview-label">任务总数</span>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">⚠️</div>
              <div className="overview-info">
                <span className="overview-value">{stats.overdueTasks}</span>
                <span className="overview-label">过期任务</span>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">✅</div>
              <div className="overview-info">
                <span className="overview-value">{subtaskCompletionRate}%</span>
                <span className="overview-label">子任务完成率</span>
              </div>
            </div>
          </div>

          {/* 任务趋势图 */}
          <div className="stats-section">
            <h3>📈 任务创建趋势</h3>
            <div className="trend-chart">
              {stats.dailyStats.map((day, index) => (
                <div key={day.date} className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{ height: `${(day.count / maxDailyCount) * 100}%` }}
                    title={`${day.date}: ${day.count} 个任务`}
                  >
                    {day.count > 0 && <span className="bar-value">{day.count}</span>}
                  </div>
                  {index % (timeRange === 'week' ? 1 : 5) === 0 && (
                    <span className="bar-label">
                      {new Date(day.date).getDate()}日
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 四象限分布 */}
          <div className="stats-section">
            <h3>🎯 四象限分布</h3>
            <div className="quadrant-chart">
              {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map(quadrant => {
                const config = QUADRANT_CONFIG[quadrant];
                const count = stats.quadrantCount[quadrant];
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={quadrant} className="quadrant-item">
                    <div className="quadrant-header">
                      <span className="quadrant-icon">{config.icon}</span>
                      <span className="quadrant-name">{config.name}</span>
                    </div>
                    <div className="quadrant-bar-bg">
                      <div
                        className="quadrant-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                    <div className="quadrant-stats">
                      <span className="quadrant-count">{count} 个</span>
                      <span className="quadrant-percent">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 标签统计 */}
          {Object.keys(stats.tagCount).length > 0 && (
            <div className="stats-section">
              <h3>🏷️ 标签分布</h3>
              <div className="tag-chart">
                {Object.entries(stats.tagCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([tagId, count]) => {
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={tagId} className="tag-stat-item">
                        <span className="tag-stat-name">{tagId.replace('tag-', '')}</span>
                        <div className="tag-stat-bar-bg">
                          <div
                            className="tag-stat-bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="tag-stat-count">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 子任务完成情况 */}
          {stats.totalSubtasks > 0 && (
            <div className="stats-section">
              <h3>📋 子任务完成情况</h3>
              <div className="subtask-stats">
                <div className="subtask-progress-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="progress-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="progress-fill"
                      strokeDasharray={`${subtaskCompletionRate}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="progress-text">{subtaskCompletionRate}%</span>
                </div>
                <div className="subtask-details">
                  <div className="subtask-detail-item">
                    <span className="detail-label">总子任务</span>
                    <span className="detail-value">{stats.totalSubtasks}</span>
                  </div>
                  <div className="subtask-detail-item completed">
                    <span className="detail-label">已完成</span>
                    <span className="detail-value">{stats.completedSubtasks}</span>
                  </div>
                  <div className="subtask-detail-item pending">
                    <span className="detail-label">待完成</span>
                    <span className="detail-value">{stats.totalSubtasks - stats.completedSubtasks}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
