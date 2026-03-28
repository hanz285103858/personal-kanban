import { useState } from 'react';
import type { Quadrant } from '../../stores/db';
import { PRESET_TAGS } from '../../stores/db';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (keyword: string) => void;
  onFilterTags: (tagIds: string[]) => void;
  onFilterQuadrant: (quadrant: Quadrant | undefined) => void;
  onFilterDueDate: (range: 'overdue' | 'today' | 'week' | undefined) => void;
  onClearAll: () => void;
  activeTagFilters: string[];
  activeQuadrantFilter: Quadrant | undefined;
  activeDueDateFilter: 'overdue' | 'today' | 'week' | undefined;
  searchKeyword: string;
}

const quadrantOptions: { value: Quadrant; label: string; icon: string }[] = [
  { value: 'urgent-important', label: '重要紧急', icon: '🔥' },
  { value: 'not-urgent-important', label: '重要不紧急', icon: '📌' },
  { value: 'urgent-not-important', label: '紧急不重要', icon: '⚡' },
  { value: 'not-urgent-not-important', label: '不重要不紧急', icon: '📝' },
];

const dueDateOptions: { value: 'overdue' | 'today' | 'week'; label: string }[] = [
  { value: 'overdue', label: '已过期' },
  { value: 'today', label: '今天截止' },
  { value: 'week', label: '本周截止' },
];

export function SearchFilter({
  onSearch,
  onFilterTags,
  onFilterQuadrant,
  onFilterDueDate,
  onClearAll,
  activeTagFilters,
  activeQuadrantFilter,
  activeDueDateFilter,
  searchKeyword,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    activeTagFilters.length > 0 ||
    activeQuadrantFilter !== undefined ||
    activeDueDateFilter !== undefined ||
    searchKeyword.trim() !== '';

  const handleTagClick = (tagId: string) => {
    if (activeTagFilters.includes(tagId)) {
      onFilterTags(activeTagFilters.filter(id => id !== tagId));
    } else {
      onFilterTags([...activeTagFilters, tagId]);
    }
  };

  const handleQuadrantClick = (quadrant: Quadrant) => {
    onFilterQuadrant(activeQuadrantFilter === quadrant ? undefined : quadrant);
  };

  const handleDueDateClick = (range: 'overdue' | 'today' | 'week') => {
    onFilterDueDate(activeDueDateFilter === range ? undefined : range);
  };

  return (
    <div className="search-filter">
      <div className="search-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索任务..."
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchKeyword && (
            <button
              className="clear-search-btn"
              onClick={() => onSearch('')}
            >
              ×
            </button>
          )}
        </div>
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          🎛️ 筛选
          {hasActiveFilters && <span className="filter-badge" />}
        </button>
        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={onClearAll}>
            清除全部
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4 className="filter-section-title">标签</h4>
            <div className="filter-tags">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  className={`filter-tag-btn ${activeTagFilters.includes(tag.id) ? 'active' : ''}`}
                  onClick={() => handleTagClick(tag.id)}
                  style={{
                    borderColor: activeTagFilters.includes(tag.id) ? tag.color : '#dfe1e6',
                    backgroundColor: activeTagFilters.includes(tag.id) ? `${tag.color}20` : 'white',
                    color: activeTagFilters.includes(tag.id) ? tag.color : '#666',
                  }}
                >
                  <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">四象限</h4>
            <div className="filter-quadrants">
              {quadrantOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-quadrant-btn ${activeQuadrantFilter === option.value ? 'active' : ''}`}
                  onClick={() => handleQuadrantClick(option.value)}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">截止日期</h4>
            <div className="filter-due-dates">
              {dueDateOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-due-date-btn ${activeDueDateFilter === option.value ? 'active' : ''}`}
                  onClick={() => handleDueDateClick(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
