import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksViewsController } from './tasks.views.controller';

@Module({
  controllers: [TasksController, TasksViewsController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
