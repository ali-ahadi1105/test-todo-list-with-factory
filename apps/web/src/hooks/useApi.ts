'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Label,
  CreateLabelInput,
  UpdateLabelInput,
  ReorderTaskInput,
  AddLabelInput,
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionInput,
  Subtask,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  ReorderSubtaskInput,
} from '@/types/api';

// Project hooks
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, CreateProjectInput>({
    mutationFn: (data: CreateProjectInput) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: string; data: UpdateProjectInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      api.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Task hooks
export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
    enabled: !!projectId,
  });
}

export function useTask(projectId: string, id: string) {
  return useQuery<Task>({
    queryKey: ['tasks', projectId, id],
    queryFn: () => api.getTask(projectId, id),
    enabled: !!projectId && !!id,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: (data: CreateTaskInput) => api.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: string; data: UpdateTaskInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      api.updateTask(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, id] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteTask(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useReorderTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; data: ReorderTaskInput }>({
    mutationFn: ({ id, data }: { id: string; data: ReorderTaskInput }) =>
      api.reorderTask(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useAddLabelToTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: string; data: AddLabelInput }>({
    mutationFn: ({ id, data }: { id: string; data: AddLabelInput }) =>
      api.addLabelToTask(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, id] });
    },
  });
}

export function useRemoveLabelFromTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; labelId: string }>({
    mutationFn: ({ id, labelId }: { id: string; labelId: string }) =>
      api.removeLabelFromTask(projectId, id, labelId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, id] });
    },
  });
}

// Label hooks
export function useLabels() {
  return useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: () => api.getLabels(),
  });
}

export function useLabel(id: string) {
  return useQuery<Label>({
    queryKey: ['labels', id],
    queryFn: () => api.getLabel(id),
    enabled: !!id,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation<Label, Error, CreateLabelInput>({
    mutationFn: (data: CreateLabelInput) => api.createLabel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation<Label, Error, { id: string; data: UpdateLabelInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateLabelInput }) => api.updateLabel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['labels', id] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// Section hooks
export function useSections(projectId: string) {
  return useQuery<Section[]>({
    queryKey: ['sections', projectId],
    queryFn: () => api.getSections(projectId),
    enabled: !!projectId,
  });
}

export function useSection(projectId: string, id: string) {
  return useQuery<Section>({
    queryKey: ['sections', projectId, id],
    queryFn: () => api.getSection(projectId, id),
    enabled: !!projectId && !!id,
  });
}

export function useCreateSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Section, Error, CreateSectionInput>({
    mutationFn: (data: CreateSectionInput) => api.createSection(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Section, Error, { id: string; data: UpdateSectionInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateSectionInput }) =>
      api.updateSection(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sections', projectId, id] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useReorderSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; data: ReorderSectionInput }>({
    mutationFn: ({ id, data }: { id: string; data: ReorderSectionInput }) =>
      api.reorderSection(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useDeleteSection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteSection(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

// Subtask hooks
export function useSubtasks(projectId: string, taskId: string) {
  return useQuery<Subtask[]>({
    queryKey: ['subtasks', projectId, taskId],
    queryFn: () => api.getSubtasks(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
}

export function useSubtask(projectId: string, taskId: string, id: string) {
  return useQuery<Subtask>({
    queryKey: ['subtasks', projectId, taskId, id],
    queryFn: () => api.getSubtask(projectId, taskId, id),
    enabled: !!projectId && !!taskId && !!id,
  });
}

export function useCreateSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<Subtask, Error, CreateSubtaskInput>({
    mutationFn: (data: CreateSubtaskInput) => api.createSubtask(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, taskId] });
    },
  });
}

export function useUpdateSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<Subtask, Error, { id: string; data: UpdateSubtaskInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubtaskInput }) =>
      api.updateSubtask(projectId, taskId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId, id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, taskId] });
    },
  });
}

export function useToggleSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<Subtask, Error, { id: string; completed: boolean }>({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.toggleSubtask(projectId, taskId, id, completed),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId, id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, taskId] });
    },
  });
}

export function useReorderSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; data: ReorderSubtaskInput }>({
    mutationFn: ({ id, data }: { id: string; data: ReorderSubtaskInput }) =>
      api.reorderSubtask(projectId, taskId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, taskId] });
    },
  });
}

export function useDeleteSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteSubtask(projectId, taskId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, taskId] });
    },
  });
}

// Helper functions
export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return 'P1';
    case 2:
      return 'P2';
    case 3:
      return 'P3';
    case 4:
      return 'P4';
    default:
      return 'P4';
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1:
      return 'bg-error-main text-white';
    case 2:
      return 'bg-orange-500 text-white';
    case 3:
      return 'bg-amber-500 text-white';
    case 4:
      return 'bg-neutral-400 text-white';
    default:
      return 'bg-neutral-400 text-white';
  }
}

export function formatDueDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function isDueToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
}
