import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateUploadUrlDto {
  @ApiProperty({ description: 'Application ID the file belongs to' })
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @ApiProperty({ example: 'resume.pdf' })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty({ example: 123456 })
  @IsInt()
  @Min(1)
  @Max(25 * 1024 * 1024) // 25MB cap (adjust if you want)
  size!: number;
}
