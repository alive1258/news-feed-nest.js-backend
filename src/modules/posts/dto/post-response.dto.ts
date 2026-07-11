import { ApiProperty } from '@nestjs/swagger';
import { PostPrivacy } from '../entities/post.entity';
import { User } from 'src/modules/users/entities/user.entity';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ enum: PostPrivacy })
  privacy: PostPrivacy;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  user?: Partial<User>;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  commentCount: number;

  @ApiProperty()
  isLikedByCurrentUser: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
