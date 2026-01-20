import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApplicationPriority, ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty() @IsString() @IsNotEmpty() workspaceId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() pipelineId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() stageId!: string;

  @ApiProperty({ example: 'ACME Corp' }) @IsString() @IsNotEmpty() @MaxLength(120)
  company!: string;

  @ApiProperty({ example: 'Software Engineer Intern' }) @IsString() @IsNotEmpty() @MaxLength(120)
  role!: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) location?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() compMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() compMax?: number;

  @ApiPropertyOptional({ enum: ApplicationPriority }) @IsOptional()
  priority?: ApplicationPriority;

  @ApiPropertyOptional({ enum: ApplicationStatus }) @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Position within the stage (0-based or 1-based; you choose).', default: 0 })
  @IsOptional() @IsInt() @Min(0)
  position?: number;
}
