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
import { SectionsService } from './sections.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import { Request } from 'express';

const createSectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

const updateSectionSchema = createSectionSchema.partial().extend({
  position: z.number().optional(),
});

const reorderSectionSchema = z.object({
  position: z.number(),
});

@ApiTags('sections')
@Controller('projects/:projectId/sections')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(createSectionSchema)) data: z.infer<typeof createSectionSchema>
  ) {
    const user = req.user as { id: string };
    return this.sectionsService.create(projectId, user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sections in a project' })
  @ApiResponse({ status: 200, description: 'List of sections' })
  async findAll(@Req() req: Request, @Param('projectId') projectId: string) {
    const user = req.user as { id: string };
    return this.sectionsService.findAll(projectId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiResponse({ status: 200, description: 'Section details' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findById(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const user = req.user as { id: string };
    return this.sectionsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async update(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSectionSchema)) data: z.infer<typeof updateSectionSchema>
  ) {
    const user = req.user as { id: string };
    return this.sectionsService.update(id, user.id, data);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder section' })
  @ApiResponse({ status: 200, description: 'Section reordered' })
  async reorder(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reorderSectionSchema)) data: z.infer<typeof reorderSectionSchema>
  ) {
    const user = req.user as { id: string };
    return this.sectionsService.reorder(id, user.id, data.position);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete section' })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const user = req.user as { id: string };
    return this.sectionsService.delete(id, user.id);
  }
}
