import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    description: 'UUID of the user who liked the post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  commentId?: string;

  @ApiProperty({
    description: 'UUID of the post that is liked',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  postId?: string;
}
