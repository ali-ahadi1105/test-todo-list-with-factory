import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name: string; color?: string }) {
    const existingLabel = await this.prisma.label.findFirst({
      where: { name: data.name, userId },
    });

    if (existingLabel) {
      throw new ConflictException('Label with this name already exists');
    }

    return this.prisma.label.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.label.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const label = await this.prisma.label.findFirst({
      where: { id, userId },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async update(id: string, userId: string, data: { name?: string; color?: string }) {
    await this.findById(id, userId);

    if (data.name) {
      const existingLabel = await this.prisma.label.findFirst({
        where: { name: data.name, userId, NOT: { id } },
      });

      if (existingLabel) {
        throw new ConflictException('Label with this name already exists');
      }
    }

    return this.prisma.label.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.label.delete({ where: { id } });
  }
}
