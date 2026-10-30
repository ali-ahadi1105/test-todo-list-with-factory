import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, userId: string, data: { name: string }) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get max position for ordering
    const maxPosition = await this.prisma.section.aggregate({
      where: { projectId },
      _max: { position: true },
    });

    return this.prisma.section.create({
      data: {
        ...data,
        projectId,
        position: (maxPosition._max.position || -1) + 1,
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

    return this.prisma.section.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const section = await this.prisma.section.findFirst({
      where: {
        id,
        project: { ownerId: userId },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async update(id: string, userId: string, data: { name?: string; position?: number }) {
    await this.findById(id, userId);
    return this.prisma.section.update({
      where: { id },
      data,
    });
  }

  async reorder(id: string, userId: string, newPosition: number) {
    await this.findById(id, userId);
    return this.prisma.section.update({
      where: { id },
      data: { position: newPosition },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.section.delete({ where: { id } });
  }
}
