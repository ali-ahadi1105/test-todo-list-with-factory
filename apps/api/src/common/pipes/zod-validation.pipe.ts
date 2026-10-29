import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: (error as { issues: unknown }).issues,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
