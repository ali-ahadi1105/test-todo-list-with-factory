'use client';

import React from 'react';
import { Task, Section } from '@/types/api';
import { TaskCard } from './TaskCard';
import { cn } from '@todo/ui';

interface TaskListProps {
  tasks: Task[];
  sections: Section[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder?: (task: Task, newPosition: number, newSectionId?: string) => void;
  onAddSubtask?: (task: Task, title: string) => void;
  onToggleSubtask?: (subtask: { id: string; completed: boolean }) => void;
  onDeleteSubtask?: (subtask: { id: string }) => void;
  draggedTaskId?: string | null;
  _onDragStart?: (e: React.DragEvent, task: Task) => void;
  _onDragOver?: (e: React.DragEvent, sectionId?: string) => void;
  _onDrop?: (e: React.DragEvent, sectionId?: string) => void;
  _onDragEnd?: (e: React.DragEvent) => void;
}

export function TaskList({
  tasks,
  sections,
  onToggleComplete,
  onEdit,
  onDelete,
  onReorder,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  draggedTaskId,
  _onDragStart,
  _onDragOver,
  _onDrop,
  _onDragEnd,
}: TaskListProps) {
  // Group tasks by section
  const tasksBySection = new Map<string | null, Task[]>();

  // Initialize with all sections
  sections.forEach((section) => {
    tasksBySection.set(section.id, []);
  });
  // Add null section for tasks without section
  tasksBySection.set(null, []);

  tasks.forEach((task) => {
    const sectionId = task.sectionId || null;
    const sectionTasks = tasksBySection.get(sectionId) || [];
    sectionTasks.push(task);
    tasksBySection.set(sectionId, sectionTasks);
  });

  // Sort tasks by position within each section
  tasksBySection.forEach((sectionTasks) => {
    sectionTasks.sort((a, b) => a.position - b.position);
  });

  const noSectionTasks = tasksBySection.get(null) || [];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const sectionTasks = tasksBySection.get(section.id) || [];
        return (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{section.name}</h3>
              <span className="text-sm text-neutral-500">{sectionTasks.length} tasks</span>
            </div>
            <div
              className="min-h-[100px] space-y-2"
              onDragOver={(e) => _onDragOver?.(e, section.id)}
              onDrop={(e) => _onDrop?.(e, section.id)}
            >
              {sectionTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReorder={onReorder}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  isDragging={draggedTaskId === task.id}
                />
              ))}
              {sectionTasks.length === 0 && (
                <div
                  className={cn(
                    'rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center',
                    'hover:border-primary-400 hover:bg-primary-50 transition-colors',
                    draggedTaskId && 'border-primary-400 bg-primary-50'
                  )}
                  onDragOver={(e) => _onDragOver?.(e, section.id)}
                  onDrop={(e) => _onDrop?.(e, section.id)}
                >
                  <svg
                    className="mx-auto h-8 w-8 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-neutral-500">
                    {draggedTaskId ? 'Drop task here' : 'No tasks in this section'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Tasks without section */}
      {(noSectionTasks.length > 0 || sections.length === 0) && (
        <div className="space-y-3">
          {sections.length > 0 && (
            <h3 className="text-lg font-semibold text-neutral-900">No Section</h3>
          )}
          <div
            className="min-h-[100px] space-y-2"
            onDragOver={(e) => _onDragOver?.(e, undefined)}
            onDrop={(e) => _onDrop?.(e, undefined)}
          >
            {noSectionTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                isDragging={draggedTaskId === task.id}
              />
            ))}
            {noSectionTasks.length === 0 && (
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center',
                  'hover:border-primary-400 hover:bg-primary-50 transition-colors',
                  draggedTaskId && 'border-primary-400 bg-primary-50'
                )}
                onDragOver={(e) => _onDragOver?.(e, undefined)}
                onDrop={(e) => _onDrop?.(e, undefined)}
              >
                <svg
                  className="mx-auto h-8 w-8 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <p className="mt-2 text-sm text-neutral-500">
                  {draggedTaskId ? 'Drop task here' : 'No tasks'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
