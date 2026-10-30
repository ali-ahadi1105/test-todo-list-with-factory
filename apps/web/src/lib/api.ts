import {
  Tokens,
  CreateTaskInput,
  UpdateTaskInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateLabelInput,
  UpdateLabelInput,
  ReorderTaskInput,
  AddLabelInput,
  Project,
  Task,
  Label,
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionInput,
  Subtask,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  ReorderSubtaskInput,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(tokens: Tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Retry with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
        return this.handleResponse<T>(retryResponse);
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = data.error || { message: 'An error occurred', code: 'ERROR' };
      throw new Error(error.message || 'An error occurred');
    }

    return data.data ?? data;
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data || data);
        return true;
      }
    } catch {
      // Ignore refresh errors
    }

    this.clearTokens();
    return false;
  }

  // Auth
  async register(email: string, password: string, name?: string): Promise<Tokens> {
    const tokens = await this.request<Tokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setTokens(tokens);
    return tokens;
  }

  async login(email: string, password: string): Promise<Tokens> {
    const tokens = await this.request<Tokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(tokens);
    return tokens;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectInput): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Tasks
  async getTasks(projectId: string): Promise<Task[]> {
    return this.request<Task[]>(`/projects/${projectId}/tasks`);
  }

  async getTask(projectId: string, id: string): Promise<Task> {
    return this.request<Task>(`/projects/${projectId}/tasks/${id}`);
  }

  async createTask(projectId: string, data: CreateTaskInput): Promise<Task> {
    return this.request<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(projectId: string, id: string, data: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/projects/${projectId}/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(projectId: string, id: string): Promise<void> {
    return this.request<void>(`/projects/${projectId}/tasks/${id}`, { method: 'DELETE' });
  }

  async reorderTask(projectId: string, id: string, data: ReorderTaskInput): Promise<void> {
    return this.request<void>(`/projects/${projectId}/tasks/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addLabelToTask(projectId: string, id: string, data: AddLabelInput): Promise<Task> {
    return this.request<Task>(`/projects/${projectId}/tasks/${id}/labels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeLabelFromTask(projectId: string, id: string, labelId: string): Promise<void> {
    return this.request<void>(`/projects/${projectId}/tasks/${id}/labels/${labelId}`, {
      method: 'DELETE',
    });
  }

  // Labels
  async getLabels(): Promise<Label[]> {
    return this.request<Label[]>('/labels');
  }

  async getLabel(id: string): Promise<Label> {
    return this.request<Label>(`/labels/${id}`);
  }

  async createLabel(data: CreateLabelInput): Promise<Label> {
    return this.request<Label>('/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabel(id: string, data: UpdateLabelInput): Promise<Label> {
    return this.request<Label>(`/labels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLabel(id: string): Promise<void> {
    return this.request<void>(`/labels/${id}`, { method: 'DELETE' });
  }

  // Sections
  async getSections(projectId: string): Promise<Section[]> {
    return this.request<Section[]>(`/projects/${projectId}/sections`);
  }

  async getSection(projectId: string, id: string): Promise<Section> {
    return this.request<Section>(`/projects/${projectId}/sections/${id}`);
  }

  async createSection(projectId: string, data: CreateSectionInput): Promise<Section> {
    return this.request<Section>(`/projects/${projectId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSection(projectId: string, id: string, data: UpdateSectionInput): Promise<Section> {
    return this.request<Section>(`/projects/${projectId}/sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async reorderSection(projectId: string, id: string, data: ReorderSectionInput): Promise<void> {
    return this.request<void>(`/projects/${projectId}/sections/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSection(projectId: string, id: string): Promise<void> {
    return this.request<void>(`/projects/${projectId}/sections/${id}`, { method: 'DELETE' });
  }

  // Subtasks
  async getSubtasks(projectId: string, taskId: string): Promise<Subtask[]> {
    return this.request<Subtask[]>(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  }

  async getSubtask(projectId: string, taskId: string, id: string): Promise<Subtask> {
    return this.request<Subtask>(`/projects/${projectId}/tasks/${taskId}/subtasks/${id}`);
  }

  async createSubtask(
    projectId: string,
    taskId: string,
    data: CreateSubtaskInput
  ): Promise<Subtask> {
    return this.request<Subtask>(`/projects/${projectId}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubtask(
    projectId: string,
    taskId: string,
    id: string,
    data: UpdateSubtaskInput
  ): Promise<Subtask> {
    return this.request<Subtask>(`/projects/${projectId}/tasks/${taskId}/subtasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleSubtask(
    projectId: string,
    taskId: string,
    id: string,
    completed: boolean
  ): Promise<Subtask> {
    return this.request<Subtask>(`/projects/${projectId}/tasks/${taskId}/subtasks/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  async reorderSubtask(
    projectId: string,
    taskId: string,
    id: string,
    data: ReorderSubtaskInput
  ): Promise<void> {
    return this.request<void>(`/projects/${projectId}/tasks/${taskId}/subtasks/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubtask(projectId: string, taskId: string, id: string): Promise<void> {
    return this.request<void>(`/projects/${projectId}/tasks/${taskId}/subtasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
