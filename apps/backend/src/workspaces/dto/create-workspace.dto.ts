import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Personal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
