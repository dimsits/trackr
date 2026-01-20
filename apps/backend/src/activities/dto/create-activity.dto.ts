import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: 'Reached out to recruiter on LinkedIn' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}
