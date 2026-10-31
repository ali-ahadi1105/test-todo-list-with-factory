import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Prisma } from '@prisma/client';

// Import Prisma types from the generated client
type TaskWhereInput = Prisma.TaskWhereInput;
type TaskOrderByWithRelationInput = Prisma.TaskOrderByWithRelationInput;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's timezone from settings
   */
  private async getUserTimezone(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    return settings?.timezone || 'UTC';
  }

  /**
   * Get the start and end of a day in user's timezone, converted to UTC for database queries
   */
  private async getDayBoundsInUTC(userId: string, date: Date): Promise<{ start: Date; end: Date }> {
    const timezone = await this.getUserTimezone(userId);

    // Create start of day in user's timezone (midnight) - use formatInTimeZone to get the ISO string
    const startOfDayInTzStr = formatInTimeZone(
      startOfDay(date),
      timezone,
      "yyyy-MM-dd'T'HH:mm:ssXXX"
    );
    // Create end of day in user's timezone (23:59:59.999)
    const endOfDayInTzStr = formatInTimeZone(endOfDay(date), timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");

    // Convert to UTC for database storage
    return {
      start: parseISO(startOfDayInTzStr),
      end: parseISO(endOfDayInTzStr),
    };
  }

  // User-level task queries
  async findByUserId(
    userId: string,
    options?: {
      completed?: boolean;
      projectId?: string;
      search?: string;
      filter?: {
        priority?: number;
        labelId?: string;
        overdue?: boolean;
        dueDate?: Date | { gte?: Date; lt?: Date; lte?: Date; gt?: Date };
        assigneeId?: string;
      };
      sort?: {
        field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'position' | 'completedAt';
        order: 'asc' | 'desc';
      };
      groupBy?: 'dueDate' | 'priority' | 'project' | 'section';
      limit?: number;
      offset?: number;
    }
  ) {
    const where: TaskWhereInput = {
      project: { ownerId: userId },
    };

    if (options?.completed !== undefined) {
      where.completed = options.completed;
    }

    if (options?.projectId) {
      where.projectId = options.projectId;
    }

    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options?.filter) {
      if (options.filter.priority) {
        where.priority = options.filter.priority;
      }
      if (options.filter.labelId) {
        where.labels = { some: { labelId: options.filter.labelId } };
      }
      if (options.filter.overdue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        where.dueDate = { lt: today };
        where.completed = false;
      }
      if (options.filter.dueDate) {
        where.dueDate = options.filter.dueDate;
      }
      if (options.filter.assigneeId) {
        where.assigneeId = options.filter.assigneeId;
      }
    }

    // Build orderBy
    let orderBy: TaskOrderByWithRelationInput[] = [{ position: 'asc' }];
    if (options?.sort) {
      switch (options.sort.field) {
        case 'dueDate':
          orderBy = [{ dueDate: options.sort.order }, { position: 'asc' }];
          break;
        case 'priority':
          orderBy = [{ priority: options.sort.order }, { position: 'asc' }];
          break;
        case 'createdAt':
          orderBy = [{ createdAt: options.sort.order }, { position: 'asc' }];
          break;
        case 'title':
          orderBy = [{ title: options.sort.order }, { position: 'asc' }];
          break;
        case 'position':
          orderBy = [{ position: options.sort.order }];
          break;
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          labels: { include: { label: true } },
          subtasks: true,
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          section: { select: { id: true, name: true } },
          project: { select: { id: true, name: true, color: true } },
        },
        orderBy,
        take: options?.limit,
        skip: options?.offset,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findToday(userId: string, options?: { includeCompleted?: boolean; projectId?: string }) {
    const today = new Date();
    const { start, end } = await this.getDayBoundsInUTC(userId, today);

    return this.findByUserId(userId, {
      completed: options?.includeCompleted ? undefined : false,
      projectId: options?.projectId,
      filter: { dueDate: { gte: start, lt: end } },
      sort: { field: 'dueDate', order: 'asc' },
    });
  }

  async findUpcoming(
    userId: string,
    options?: { includeCompleted?: boolean; projectId?: string; limit?: number }
  ) {
    const today = new Date();
    const { start } = await this.getDayBoundsInUTC(userId, today);

    return this.findByUserId(userId, {
      completed: options?.includeCompleted ? undefined : false,
      projectId: options?.projectId,
      filter: { dueDate: { gte: start } },
      sort: { field: 'dueDate', order: 'asc' },
      limit: options?.limit,
    });
  }

  async findCompleted(
    userId: string,
    options?: { projectId?: string; limit?: number; offset?: number }
  ) {
    return this.findByUserId(userId, {
      completed: true,
      projectId: options?.projectId,
      sort: { field: 'completedAt', order: 'desc' },
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  async findOverdue(userId: string, options?: { includeCompleted?: boolean; projectId?: string }) {
    const today = new Date();
    const { start } = await this.getDayBoundsInUTC(userId, today);

    return this.findByUserId(userId, {
      completed: false,
      projectId: options?.projectId,
      filter: { dueDate: { lt: start } },
      sort: { field: 'dueDate', order: 'asc' },
    });
  }

  async create(
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      sectionId?: string;
      dueDate?: Date;
      assigneeId?: string;
      priority?: number;
    }
  ) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get max position for ordering
    const maxPosition = await this.prisma.task.aggregate({
      where: { projectId, sectionId: data.sectionId || null },
      _max: { position: true },
    });

    return this.prisma.task.create({
      data: {
        ...data,
        projectId,
        position: (maxPosition._max.position || -1) + 1,
        priority: data.priority ?? 4,
      },
      include: {
        labels: { include: { label: true } },
        subtasks: true,
      },
    });
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        labels: { include: { label: true } },
        subtasks: true,
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: [{ sectionId: 'asc' }, { position: 'asc' }],
    });
  }

  async findById(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: { ownerId: userId },
      },
      include: {
        labels: { include: { label: true } },
        subtasks: true,
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      completed?: boolean;
      position?: number;
      sectionId?: string | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
      priority?: number;
    }
  ) {
    await this.findById(id, userId);

    const updateData: Partial<{
      title: string;
      description: string | null;
      completed: boolean;
      position: number;
      sectionId: string | null;
      dueDate: Date | null;
      assigneeId: string | null;
      priority: number;
      completedAt: Date | null;
    }> = { ...data };

    // Handle completion timestamp
    if (data.completed !== undefined) {
      updateData.completedAt = data.completed ? new Date() : null;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        labels: { include: { label: true } },
        subtasks: true,
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        section: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }

  async reorder(taskId: string, userId: string, newPosition: number, newSectionId?: string) {
    await this.findById(taskId, userId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        position: newPosition,
        sectionId: newSectionId,
      },
    });
  }

  async addLabel(taskId: string, userId: string, labelId: string) {
    await this.findById(taskId, userId);
    return this.prisma.taskLabel.create({
      data: { taskId, labelId },
      include: { label: true },
    });
  }

  async removeLabel(taskId: string, userId: string, labelId: string) {
    await this.findById(taskId, userId);
    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  // Subtask methods
  async createSubtask(taskId: string, userId: string, data: { title: string }) {
    await this.findById(taskId, userId);

    // Get max position for ordering
    const maxPosition = await this.prisma.subtask.aggregate({
      where: { taskId },
      _max: { position: true },
    });

    return this.prisma.subtask.create({
      data: {
        ...data,
        taskId,
        position: (maxPosition._max.position || -1) + 1,
      },
    });
  }

  async findSubtasks(taskId: string, userId: string) {
    await this.findById(taskId, userId);
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { position: 'asc' },
    });
  }

  async findSubtaskById(id: string, userId: string) {
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: { project: { ownerId: userId } },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    return subtask;
  }

  async updateSubtask(
    id: string,
    userId: string,
    data: { title?: string; completed?: boolean; position?: number }
  ) {
    await this.findSubtaskById(id, userId);
    return this.prisma.subtask.update({
      where: { id },
      data,
    });
  }

  async toggleSubtask(id: string, userId: string, completed: boolean) {
    await this.findSubtaskById(id, userId);
    return this.prisma.subtask.update({
      where: { id },
      data: { completed },
    });
  }

  async reorderSubtask(id: string, userId: string, newPosition: number) {
    await this.findSubtaskById(id, userId);
    return this.prisma.subtask.update({
      where: { id },
      data: { position: newPosition },
    });
  }

  async deleteSubtask(id: string, userId: string) {
    await this.findSubtaskById(id, userId);
    return this.prisma.subtask.delete({ where: { id } });
  }
}
