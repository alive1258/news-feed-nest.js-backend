import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostPrivacy } from '../entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Content of the post',
    example: 'This is a sample post content.',
  })
  @IsString()
  @MaxLength(5000)
  content: string;
  @ApiProperty({
    description: 'URL of the image associated with the post',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Privacy setting for the post',
    example: PostPrivacy.PUBLIC,
  })
  @IsEnum(PostPrivacy)
  @IsOptional()
  privacy?: PostPrivacy;
}
