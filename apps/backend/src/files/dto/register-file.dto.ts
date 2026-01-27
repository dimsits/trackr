import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class RegisterFileDto {
  @ApiProperty({ example: 'resume.pdf' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'workspaces/<ws>/applications/<app>/uuid-resume.pdf' })
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mime!: string;

  @ApiProperty({ example: 123456 })
  @IsInt()
  @Min(1)
  @Max(25 * 1024 * 1024)
  size!: number;
}
