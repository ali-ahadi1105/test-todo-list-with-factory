'use client';

import React from 'react';
import { Button, Select, Input, cn } from '@todo/ui';
import { TaskSearchParams } from '@/types/api';

interface TaskFiltersProps {
  params: TaskSearchParams;
  onChange: (params: TaskSearchParams) => void;
  onClear: () => void;
  availableProjects?: { id: string; name: string; color: string }[];
  availableLabels?: { id: string; name: string; color: string }[];
}

export function TaskFilters({
  params,
  onChange,
  onClear,
  availableProjects = [],
  availableLabels = [],
}: TaskFiltersProps) {
  const hasActiveFilters = Object.values(params).some(
    (value) => value !== undefined && value !== '' && value !== false
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...params, q: e.target.value || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split(':');
    onChange({ 
      ...params, 
      sortField: field as TaskSearchParams['sortField'] || undefined,
      sortOrder: order as TaskSearchParams['sortOrder'] || undefined,
    });
  };

  const handleFilterChange = <K extends keyof TaskSearchParams>(
    key: K,
    value: TaskSearchParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          type="text"
          placeholder="Search tasks..."
          value={params.q || ''}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-medium text-neutral-700">
          Sort:
        </label>
        <Select
          id="sort"
          value={`${params.sortField || 'position'}:${params.sortOrder || 'asc'}`}
          onChange={handleSortChange}
          className="w-48"
        >
          <option value="position:asc">Manual</option>
          <option value="dueDate:asc">Due Date (Oldest First)</option>
          <option value="dueDate:desc">Due Date (Newest First)</option>
          <option value="priority:asc">Priority (Low to High)</option>
          <option value="priority:desc">Priority (High to Low)</option>
          <option value="createdAt:asc">Created (Oldest First)</option>
          <option value="createdAt:desc">Created (Newest First)</option>
          <option value="title:asc">Title (A-Z)</option>
          <option value="title:desc">Title (Z-A)</option>
        </Select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {/* Status Filter */}
        <Select
          value={params.completed === true ? 'completed' : params.completed === false ? 'active' : 'all'}
          onChange={(e) => handleFilterChange('completed', e.target.value === 'all' ? undefined : e.target.value === 'completed')}
          className="w-32"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </Select>

        {/* Priority Filter */}
        <Select
          value={params.priority?.toString() || 'all'}
          onChange={(e) => handleFilterChange('priority', e.target.value === 'all' ? undefined : parseInt(e.target.value))}
          className="w-32"
        >
          <option value="all">All Priorities</option>
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
          <option value="4">P4</option>
        </Select>

        {/* Project Filter */}
        {availableProjects.length > 0 && (
          <Select
            value={params.projectId || 'all'}
            onChange={(e) => handleFilterChange('projectId', e.target.value === 'all' ? undefined : e.target.value)}
            className="w-40"
          >
            <option value="all">All Projects</option>
            {availableProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}

        {/* Label Filter */}
        {availableLabels.length > 0 && (
          <Select
            value={params.labelId || 'all'}
            onChange={(e) => handleFilterChange('labelId', e.target.value === 'all' ? undefined : e.target.value)}
            className="w-40"
          >
            <option value="all">All Labels</option>
            {availableLabels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </Select>
        )}

        {/* Overdue Filter */}
        <label className="flex items-center gap-1.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={params.overdue === true}
            onChange={(e) => handleFilterChange('overdue', e.target.checked || undefined)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          Overdue
        </label>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}