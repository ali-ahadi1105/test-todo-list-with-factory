import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { Request } from 'express';

@ApiTags('tasks-views')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TasksViewsController {
  constructor(private tasksService: TasksService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get tasks due today' })
  @ApiResponse({ status: 200, description: 'List of tasks due today' })
  @ApiQuery({ name: 'includeCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  async findToday(
    @Req() req: Request,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('projectId') projectId?: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findToday(user.id, {
      includeCompleted: includeCompleted === 'true',
      projectId,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks' })
  @ApiResponse({ status: 200, description: 'List of upcoming tasks' })
  @ApiQuery({ name: 'includeCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findUpcoming(
    @Req() req: Request,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findUpcoming(user.id, {
      includeCompleted: includeCompleted === 'true',
      projectId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed tasks' })
  @ApiResponse({ status: 200, description: 'List of completed tasks' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findCompleted(
    @Req() req: Request,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findCompleted(user.id, {
      projectId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiResponse({ status: 200, description: 'List of overdue tasks' })
  @ApiQuery({ name: 'includeCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  async findOverdue(
    @Req() req: Request,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('projectId') projectId?: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findOverdue(user.id, {
      includeCompleted: includeCompleted === 'true',
      projectId,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks matching search criteria' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: Number })
  @ApiQuery({ name: 'labelId', required: false, type: String })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiQuery({ name: 'assigneeId', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String, enum: ['dueDate', 'priority', 'createdAt', 'title', 'position'] })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Req() req: Request,
    @Query('q') search?: string,
    @Query('completed') completed?: string,
    @Query('projectId') projectId?: string,
    @Query('priority') priority?: string,
    @Query('labelId') labelId?: string,
    @Query('overdue') overdue?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('sortField') sortField?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'position',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const user = req.user as { id: string };
    return this.tasksService.findByUserId(user.id, {
      completed: completed !== undefined ? completed === 'true' : undefined,
      projectId,
      search,
      filter: {
        priority: priority ? parseInt(priority, 10) : undefined,
        labelId,
        overdue: overdue === 'true',
        assigneeId,
      },
      sort: sortField ? { field: sortField, order: sortOrder || 'asc' } : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}