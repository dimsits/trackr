import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListApplicationsQuery {
  @ApiPropertyOptional() @IsOptional() @IsString() pipelineId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stageId?: string;
  @ApiPropertyOptional({ description: 'Search in company/role' })
  @IsOptional() @IsString() q?: string;
}
