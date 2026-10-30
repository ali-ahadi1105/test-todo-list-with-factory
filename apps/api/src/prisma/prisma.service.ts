import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    // Delete in order to respect foreign key constraints
    await this.taskLabel.deleteMany();
    await this.subtask.deleteMany();
    await this.task.deleteMany();
    await this.section.deleteMany();
    await this.project.deleteMany();
    await this.label.deleteMany();
    await this.userSettings.deleteMany();
    await this.user.deleteMany();
  }
}
