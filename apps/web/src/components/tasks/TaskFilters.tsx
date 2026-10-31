'use client';

import React from 'react';
import { Button, Select, Input } from '@todo/ui';
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
      sortField: (field as TaskSearchParams['sortField']) || undefined,
      sortOrder: (order as TaskSearchParams['sortOrder']) || undefined,
    });
  };

  const handleFilterChange = <K extends keyof TaskSearchParams>(
    key: K,
    value: TaskSearchParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      {/* Search */}
      <div className="relative min-w-[200px] max-w-xs flex-1">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
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
          options={[
            { value: 'position:asc', label: 'Manual' },
            { value: 'dueDate:asc', label: 'Due Date (Oldest First)' },
            { value: 'dueDate:desc', label: 'Due Date (Newest First)' },
            { value: 'priority:asc', label: 'Priority (Low to High)' },
            { value: 'priority:desc', label: 'Priority (High to Low)' },
            { value: 'createdAt:asc', label: 'Created (Oldest First)' },
            { value: 'createdAt:desc', label: 'Created (Newest First)' },
            { value: 'title:asc', label: 'Title (A-Z)' },
            { value: 'title:desc', label: 'Title (Z-A)' },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={
            params.completed === true ? 'completed' : params.completed === false ? 'active' : 'all'
          }
          onChange={(e) =>
            handleFilterChange(
              'completed',
              e.target.value === 'all' ? undefined : e.target.value === 'completed'
            )
          }
          className="w-32"
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        {/* Priority Filter */}
        <Select
          value={params.priority?.toString() || 'all'}
          onChange={(e) =>
            handleFilterChange(
              'priority',
              e.target.value === 'all' ? undefined : parseInt(e.target.value)
            )
          }
          className="w-32"
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: '1', label: 'P1' },
            { value: '2', label: 'P2' },
            { value: '3', label: 'P3' },
            { value: '4', label: 'P4' },
          ]}
        />

        {/* Project Filter */}
        {availableProjects.length > 0 && (
          <Select
            value={params.projectId || 'all'}
            onChange={(e) =>
              handleFilterChange('projectId', e.target.value === 'all' ? undefined : e.target.value)
            }
            className="w-40"
            options={[
              { value: 'all', label: 'All Projects' },
              ...availableProjects.map((project) => ({ value: project.id, label: project.name })),
            ]}
          />
        )}

        {/* Label Filter */}
        {availableLabels.length > 0 && (
          <Select
            value={params.labelId || 'all'}
            onChange={(e) =>
              handleFilterChange('labelId', e.target.value === 'all' ? undefined : e.target.value)
            }
            className="w-40"
            options={[
              { value: 'all', label: 'All Labels' },
              ...availableLabels.map((label) => ({ value: label.id, label: label.name })),
            ]}
          />
        )}

        {/* Overdue Filter */}
        <label className="flex items-center gap-1.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={params.overdue === true}
            onChange={(e) => handleFilterChange('overdue', e.target.checked || undefined)}
            className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
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
