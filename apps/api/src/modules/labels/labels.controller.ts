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
import { LabelsService } from './labels.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import { Request } from 'express';

const createLabelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

const updateLabelSchema = createLabelSchema.partial();

@ApiTags('labels')
@Controller('labels')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new label' })
  @ApiResponse({ status: 201, description: 'Label created' })
  @ApiResponse({ status: 409, description: 'Label already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(createLabelSchema)) data: z.infer<typeof createLabelSchema>
  ) {
    const user = req.user as { id: string };
    return this.labelsService.create(user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all labels' })
  @ApiResponse({ status: 200, description: 'List of labels' })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.labelsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get label by ID' })
  @ApiResponse({ status: 200, description: 'Label details' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async findById(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.labelsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update label' })
  @ApiResponse({ status: 200, description: 'Label updated' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  @ApiResponse({ status: 409, description: 'Label already exists' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLabelSchema)) data: z.infer<typeof updateLabelSchema>
  ) {
    const user = req.user as { id: string };
    return this.labelsService.update(id, user.id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete label' })
  @ApiResponse({ status: 200, description: 'Label deleted' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  @HttpCode(HttpStatus.OK)
  async delete(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.labelsService.delete(id, user.id);
  }
}
