export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  _count?: {
    tasks: number;
  };
}

export interface Section {
  id: string;
  name: string;
  position: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  completed: boolean;
  completedAt: string | null;
  dueDate: string | null;
  priority: number; // 1=P1, 2=P2, 3=P3, 4=P4
  projectId: string;
  sectionId: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  labels: TaskLabel[];
  subtasks: Subtask[];
  assignee?: User | null;
  section?: Section | null;
}

export interface TaskLabel {
  id: string;
  taskId: string;
  labelId: string;
  label: Label;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  taskId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  sectionId?: string;
  dueDate?: string | null;
  assigneeId?: string;
  priority?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  position?: number;
  sectionId?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  priority?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

export interface ReorderTaskInput {
  position: number;
  sectionId?: string;
}

export interface AddLabelInput {
  labelId: string;
}

// Section interfaces
export interface Section {
  id: string;
  name: string;
  position: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface CreateSectionInput {
  name: string;
}

export interface UpdateSectionInput {
  name?: string;
  position?: number;
}

export interface ReorderSectionInput {
  position: number;
}

// Task Views API Response
export interface TasksViewResponse {
  tasks: Task[];
  total: number;
}

// Subtask interfaces
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  taskId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtaskInput {
  title: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  completed?: boolean;
  position?: number;
}

export interface ReorderSubtaskInput {
  position: number;
}

// Task Views Search/Filters
export interface TaskSearchParams {
  q?: string;
  completed?: boolean;
  projectId?: string;
  priority?: number;
  labelId?: string;
  overdue?: boolean;
  assigneeId?: string;
  sortField?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'position';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TodayTasksParams {
  includeCompleted?: boolean;
  projectId?: string;
}

export interface UpcomingTasksParams {
  includeCompleted?: boolean;
  projectId?: string;
  limit?: number;
}

export interface CompletedTasksParams {
  projectId?: string;
  limit?: number;
  offset?: number;
}

export interface OverdueTasksParams {
  includeCompleted?: boolean;
  projectId?: string;
}
