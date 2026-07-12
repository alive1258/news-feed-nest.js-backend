import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class CommentResponseItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  postId: string;

  @ApiPropertyOptional()
  parentCommentId: string | null;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty()
  content: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  isLiked: boolean;

  @ApiProperty()
  repliesCount: number;
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseItemDto] })
  comments: CommentResponseItemDto[];

  @ApiProperty()
  hasMore: boolean;

  @ApiProperty()
  totalCount: number;
}
