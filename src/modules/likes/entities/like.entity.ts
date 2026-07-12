import { Comment } from 'src/modules/comments/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('likes')
@Index('IDX_UNIQUE_USER_POST_LIKE', ['userId', 'postId'], {
  unique: true,
  where: '"post_id" IS NOT NULL',
})
@Index('IDX_UNIQUE_USER_COMMENT_LIKE', ['userId', 'commentId'], {
  unique: true,
  where: '"comment_id" IS NOT NULL',
})
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post | null;

  @Index()
  @Column({
    name: 'post_id',
    type: 'uuid',
    nullable: true,
  })
  postId: string | null;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment | null;

  @Index()
  @Column({
    name: 'comment_id',
    type: 'uuid',
    nullable: true,
  })
  commentId: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
