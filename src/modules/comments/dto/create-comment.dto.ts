import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'c2cf0d93-1db8-4d67-9d91-bc59dbf5d3b4',
  })
  @IsUUID()
  postId: string;

  @ApiProperty({
    example: 'This is my comment.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    example: '6f4c8425-7b3e-4d62-80d5-a8a4df7c0d93',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
