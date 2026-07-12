import { Like } from 'src/modules/likes/entities/like.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    name: 'parent_comment_id',
    type: 'uuid',
    nullable: true,
  })
  parentCommentId: string | null;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({
    name: 'post_id',
    type: 'uuid',
  })
  postId: string;

  @Column({
    name: 'likes_count',
    type: 'int',
    default: 0,
  })
  likesCount: number;

  @Column({
    name: 'replies_count',
    type: 'int',
    default: 0,
  })
  repliesCount: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone', // 👈 'with time zone' (timestamptz) ব্যবহার করুন
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
