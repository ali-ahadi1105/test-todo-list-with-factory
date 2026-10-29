import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import { Request } from 'express';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  sectionId: z.string().optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : undefined)),
  assigneeId: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean().optional(),
  position: z.number().optional(),
  sectionId: z.string().nullable().optional(),
});

const reorderTaskSchema = z.object({
  position: z.number(),
  sectionId: z.string().optional(),
});

const addLabelSchema = z.object({
  labelId: z.string(),
});

@ApiTags('tasks')
@Controller('projects/:projectId/tasks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(createTaskSchema)) data: z.infer<typeof createTaskSchema>
  ) {
    const user = req.user as { id: string };
    return this.tasksService.create(projectId, user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks in a project' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async findAll(@Req() req: Request, @Param('projectId') projectId: string) {
    const user = req.user as { id: string };
    return this.tasksService.findAll(projectId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findById(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) data: z.infer<typeof updateTaskSchema>
  ) {
    const user = req.user as { id: string };
    return this.tasksService.update(id, user.id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.delete(id, user.id);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder task' })
  @ApiResponse({ status: 200, description: 'Task reordered' })
  async reorder(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reorderTaskSchema)) data: z.infer<typeof reorderTaskSchema>
  ) {
    const user = req.user as { id: string };
    return this.tasksService.reorder(id, user.id, data.position, data.sectionId);
  }

  @Post(':id/labels')
  @ApiOperation({ summary: 'Add label to task' })
  @ApiResponse({ status: 201, description: 'Label added' })
  @HttpCode(HttpStatus.CREATED)
  async addLabel(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addLabelSchema)) data: z.infer<typeof addLabelSchema>
  ) {
    const user = req.user as { id: string };
    return this.tasksService.addLabel(id, user.id, data.labelId);
  }

  @Delete(':id/labels/:labelId')
  @ApiOperation({ summary: 'Remove label from task' })
  @ApiResponse({ status: 200, description: 'Label removed' })
  @HttpCode(HttpStatus.OK)
  async removeLabel(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('labelId') labelId: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.removeLabel(id, user.id, labelId);
  }
}
