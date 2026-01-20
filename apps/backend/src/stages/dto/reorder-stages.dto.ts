import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';

class ReorderStageItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stageId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  position!: number;
}

export class ReorderStagesDto {
  @ApiProperty({ type: [ReorderStageItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderStageItemDto)
  items!: ReorderStageItemDto[];
}
