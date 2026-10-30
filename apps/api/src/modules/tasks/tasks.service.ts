import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

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
}
