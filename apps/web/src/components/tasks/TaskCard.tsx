'use client';

import React from 'react';
import { Task, Subtask } from '@/types/api';
import { Button, cn } from '@todo/ui';
import {
  getPriorityLabel,
  getPriorityColor,
  formatDueDate,
  isOverdue,
  isDueToday,
} from '@/hooks/useApi';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder?: (task: Task, newPosition: number, newSectionId?: string) => void;
  onAddSubtask?: (task: Task, title: string) => void;
  onToggleSubtask?: (subtask: Subtask) => void;
  onDeleteSubtask?: (subtask: Subtask) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  isDragging,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() && onAddSubtask) {
      onAddSubtask(task, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.completed) || [];

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-neutral-200 bg-white p-4 shadow-sm',
        'transition-shadow hover:border-neutral-300 hover:shadow-md',
        'flex flex-col gap-3',
        isDragging && 'ring-primary-500 opacity-50 ring-2'
      )}
    >
      {/* Main task row */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={cn(
            'mt-1 h-5 w-5 flex-shrink-0 rounded border-2 transition-colors',
            'focus:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
            task.completed
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'hover:border-primary-400 border-neutral-300'
          )}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          aria-pressed={task.completed}
        >
          {task.completed && (
            <svg
              className="mx-auto my-0.5 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Task content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Title and priority */}
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'flex-1 truncate text-sm font-medium',
                task.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                'flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold',
                getPriorityColor(task.priority)
              )}
              aria-label={`Priority ${getPriorityLabel(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className={cn(
                'truncate text-sm',
                task.completed ? 'text-neutral-400 line-through' : 'text-neutral-500'
              )}
            >
              {task.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {task.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isOverdue(task.dueDate) && !task.completed && 'text-error-main',
                  isDueToday(task.dueDate) && !task.completed && 'text-primary-600'
                )}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDueDate(task.dueDate)}
                {isOverdue(task.dueDate) && !task.completed && ' (overdue)'}
                {isDueToday(task.dueDate) && !task.completed && ' (today)'}
              </span>
            )}

            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {task.labels.slice(0, 3).map((tl) => (
                  <span
                    key={tl.label.id}
                    className="rounded-full border px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${tl.label.color}20`,
                      borderColor: tl.label.color,
                      color: tl.label.color,
                    }}
                  >
                    {tl.label.name}
                  </span>
                ))}
                {task.labels.length > 3 && (
                  <span className="px-1.5 py-0.5 text-xs text-neutral-500">
                    +{task.labels.length - 3}
                  </span>
                )}
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                {completedSubtasks.length}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Edit task"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="hover:text-error-main rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
            aria-label="Delete task"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtasks */}
      <div className="ml-9 border-l-2 border-neutral-200 pl-3">
        <button
          onClick={() => setShowSubtasks(!showSubtasks)}
          className="flex items-center gap-2 py-1 text-sm text-neutral-500 hover:text-neutral-700"
          aria-expanded={showSubtasks}
        >
          <svg
            className={cn('h-4 w-4 transition-transform', showSubtasks && 'rotate-90')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>
            Subtasks ({completedSubtasks.length}/{task.subtasks?.length || 0})
          </span>
        </button>

        {showSubtasks && (
          <div className="space-y-2 pt-2">
            {task.subtasks?.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <button
                  onClick={() => onToggleSubtask?.(subtask)}
                  className={cn(
                    'mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 transition-colors',
                    'focus:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    subtask.completed
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'hover:border-primary-400 border-neutral-300'
                  )}
                  aria-label={
                    subtask.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'
                  }
                >
                  {subtask.completed && (
                    <svg
                      className="mx-auto my-0.5 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    subtask.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask?.(subtask)}
                  className="hover:text-error-main rounded p-1 text-neutral-400 opacity-0 transition-colors hover:bg-neutral-100 group-hover:opacity-100"
                  aria-label="Delete subtask"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add subtask form */}
            <form onSubmit={handleSubtaskSubmit} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="focus:ring-primary-500 flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                aria-label="New subtask title"
              />
              <Button type="submit" size="sm" variant="primary" disabled={!newSubtaskTitle.trim()}>
                Add
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
