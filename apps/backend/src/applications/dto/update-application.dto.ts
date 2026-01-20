import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApplicationPriority, ApplicationStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) role?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) location?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() compMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() compMax?: number;

  @ApiPropertyOptional({ enum: ApplicationPriority }) @IsOptional()
  priority?: ApplicationPriority;

  @ApiPropertyOptional({ enum: ApplicationStatus }) @IsOptional()
  status?: ApplicationStatus;

  // movement fields (drag/drop)
  @ApiPropertyOptional() @IsOptional() @IsString() stageId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  position?: number;
}
