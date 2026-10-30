'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, Project, CreateTaskInput, UpdateTaskInput } from '@/types/api';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button, Input, Modal, Sidebar, cn } from '@todo/ui';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useReorderTask,
  useLabels,
  getPriorityLabel,
  getPriorityColor,
} from '@/hooks/useApi';

const sidebarItems = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'today', label: 'Today', icon: 'calendar' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar-days' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'labels', label: 'Labels', icon: 'tag' },
  { id: 'completed', label: 'Completed', icon: 'check-circle' },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = searchParams.get('projectId');
  const view = searchParams.get('view') || 'projects';

  // State
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState<string | null>(null);

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: labels = [] } = useLabels();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useTasks(projectId || '');
  const { data: currentProject } = useQuery<Project | undefined>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (!projectId) return undefined;
      return api.getProject(projectId);
    },
    enabled: !!projectId,
  });

  // Mutations
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const createTaskMutation = useCreateTask(projectId || '');
  const updateTaskMutation = useUpdateTask(projectId || '');
  const deleteTaskMutation = useDeleteTask(projectId || '');
  const reorderTaskMutation = useReorderTask(projectId || '');

  // Handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    createProjectMutation.mutate(
      { name: newProjectName.trim() },
      {
        onSuccess: (project: Project) => {
          setNewProjectName('');
          setShowCreateProject(false);
          router.push(`/dashboard?projectId=${project.id}`);
        },
      }
    );
  };

  const handleCreateTask = (data: CreateTaskInput | UpdateTaskInput) => {
    createTaskMutation.mutate(data as CreateTaskInput, {
      onSuccess: () => {
        setShowCreateTask(false);
        refetchTasks();
      },
    });
  };

  const handleUpdateTask = (data: UpdateTaskInput) => {
    if (!editingTask) return;
    updateTaskMutation.mutate(
      { id: editingTask.id, data },
      {
        onSuccess: () => {
          setEditingTask(null);
          refetchTasks();
        },
      }
    );
  };

  const handleDeleteTask = (task: Task) => {
    if (confirm(`Delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => refetchTasks(),
      });
    }
  };

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate(
      {
        id: task.id,
        data: { completed: !task.completed },
      },
      {
        onSuccess: () => refetchTasks(),
      }
    );
  };

  const handleReorder = (task: Task, newPosition: number, newSectionId?: string) => {
    reorderTaskMutation.mutate({
      id: task.id,
      data: { position: newPosition, sectionId: newSectionId },
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, _sectionId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Track the drop target task element
    const target = e.target as HTMLElement;
    const taskElement = target.closest('[data-task-id]');
    if (taskElement) {
      const taskId = taskElement.getAttribute('data-task-id');
      if (taskId && taskId !== draggedTaskId) {
        setDropTargetTaskId(taskId);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, sectionId?: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;

    // Calculate new position based on drop target
    const sectionTasks = tasks
      .filter((t) => (t.sectionId || null) === (sectionId || null))
      .sort((a, b) => a.position - b.position);

    let newPosition = sectionTasks.length; // Default: append to end

    // If there's a drop target, insert before it
    if (dropTargetTaskId) {
      const targetIndex = sectionTasks.findIndex((t) => t.id === dropTargetTaskId);
      if (targetIndex !== -1) {
        newPosition = sectionTasks[targetIndex].position;
      }
    }

    handleReorder(task, newPosition, sectionId);
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  // Get sections for current project
  const sections = currentProject?.sections || [];

  // Filter for today/upcoming views
  let filteredTasks = tasks;
  if (view === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  } else if (view === 'upcoming') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today;
    });

    // Sort by due date
    filteredTasks.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  if (projectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        items={sidebarItems}
        activeItem={view}
        onItemClick={(item) => router.push(`/dashboard?view=${item.id}`)}
        projects={projects}
        onProjectClick={(project) => router.push(`/dashboard?projectId=${project.id}`)}
        onCreateProject={() => setShowCreateProject(true)}
      />

      <main className="flex min-h-screen flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              {projectId && currentProject && (
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: currentProject.color }}
                  >
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-neutral-900">{currentProject.name}</h1>
                </div>
              )}
              {!projectId && (
                <h1 className="text-xl font-semibold capitalize text-neutral-900">{view}</h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              {projectId && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
                  onClick={() => setShowCreateTask(true)}
                >
                  Add Task
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                leftIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
                onClick={() => setShowCreateProject(true)}
              >
                New Project
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-6">
          {projectId ? (
            // Project view with sections and tasks
            <div className="space-y-6">
              {/* Quick add task */}
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowCreateTask(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 border-none bg-transparent px-3 py-2 text-left text-neutral-500 hover:text-neutral-700 focus:outline-none"
                    >
                      + Add task
                    </button>
                  </div>
                </form>
              </div>

              {/* Task list */}
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
                  ))}
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  sections={sections}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  onReorder={handleReorder}
                  draggedTaskId={draggedTaskId}
                  _onDragStart={handleDragStart}
                  _onDragOver={handleDragOver}
                  _onDrop={handleDrop}
                  _onDragEnd={handleDragEnd}
                />
              )}
            </div>
          ) : view === 'today' || view === 'upcoming' ? (
            // Today/Upcoming view
            <div className="space-y-6">
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowCreateTask(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 border-none bg-transparent px-3 py-2 text-left text-neutral-500 hover:text-neutral-700 focus:outline-none"
                    >
                      + Add task
                    </button>
                  </div>
                </form>
              </div>

              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
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
                  <p className="mt-4 text-lg text-neutral-500">
                    {view === 'today' ? 'No tasks for today' : 'No upcoming tasks'}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {view === 'today' ? 'Enjoy your day!' : 'All caught up!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:border-neutral-300 hover:shadow-md"
                    >
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={cn(
                          'mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 transition-colors',
                          task.completed
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'hover:border-primary-400 border-neutral-300'
                        )}
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
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            'truncate font-medium',
                            task.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'
                          )}
                        >
                          {task.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
                          {task.projectId && (
                            <span className="flex items-center gap-1">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: currentProject?.color || '#3B82F6' }}
                              />
                              <span>{currentProject?.name}</span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </span>
                          )}
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-xs font-semibold',
                              getPriorityColor(task.priority)
                            )}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="rounded p-1.5 text-neutral-500 opacity-0 transition-colors hover:bg-neutral-100 hover:text-neutral-700 group-hover:opacity-100"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Projects overview / Inbox / Labels / Completed
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold capitalize text-neutral-900">{view}</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
                  onClick={() => setShowCreateProject(true)}
                >
                  New Project
                </Button>
              </div>

              {projects.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="mt-4 text-lg text-neutral-500">No projects yet</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Create your first project to get started
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowCreateProject(true)}
                  >
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/dashboard?projectId=${project.id}`)}
                      className={cn(
                        'rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-md',
                        'group text-left'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: project.color }}
                        >
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-neutral-900">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="mt-1 truncate text-sm text-neutral-500">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
                        <span>{project._count?.tasks || 0} tasks</span>
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProjectMutation.mutate({
                                id: project.id,
                                data: { name: prompt('New name:', project.name) || project.name },
                              });
                            }}
                            className="rounded p-1 hover:bg-neutral-100"
                            aria-label="Edit project"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${project.name}"?`)) {
                                deleteProjectMutation.mutate(project.id);
                              }
                            }}
                            className="text-error-main rounded p-1 hover:bg-neutral-100"
                            aria-label="Delete project"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Project Name <span className="text-error-main">*</span>
            </label>
            <Input
              id="projectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              required
              autoFocus
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowCreateProject(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      <TaskForm
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={handleCreateTask}
        _projectId={projectId || ''}
        sections={sections}
        labels={labels}
        isLoading={createTaskMutation.isPending}
      />

      <TaskForm
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        _projectId={projectId || ''}
        sections={sections}
        labels={labels}
        initialData={editingTask}
        isLoading={updateTaskMutation.isPending}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
