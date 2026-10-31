import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // User Settings methods
  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          theme: 'system',
          notificationsEnabled: true,
          emailNotifications: true,
          timezone: 'UTC',
        },
      });
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    data: {
      theme?: 'light' | 'dark' | 'system';
      notificationsEnabled?: boolean;
      emailNotifications?: boolean;
      timezone?: string;
    }
  ) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        theme: data.theme ?? 'system',
        notificationsEnabled: data.notificationsEnabled ?? true,
        emailNotifications: data.emailNotifications ?? true,
        timezone: data.timezone ?? 'UTC',
      },
    });
  }
}
