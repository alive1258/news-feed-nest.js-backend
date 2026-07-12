import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { CommentPaginationQueryDto } from './dto/comment-pagination-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  private formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);

    const diffMs = now.getTime() - past.getTime();

    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${diffWeeks}w`;
    if (diffDays < 365) return `${diffMonths}mo`;
    return `${diffYears}y`;
  }

  async createComment(req: any, createCommentDto: any) {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const { content, parentCommentId, parentId } = createCommentDto;
    const targetParentId = parentCommentId || parentId;

    let postId = createCommentDto.postId;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ১. parentComment ফেচ করার লজিক ট্রানজেকশনের ভেতরে আনা হলো (Isolation Safety)
      if (targetParentId) {
        const parentComment = await queryRunner.manager.findOne(Comment, {
          where: { id: targetParentId },
        });
        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
        postId = parentComment.postId;
      }

      if (!postId) {
        throw new NotFoundException('Target postId could not be resolved.');
      }

      // ২. কমেন্ট ক্রিয়েট ও সেভ করা (Transaction Manager দিয়ে)
      const newComment = queryRunner.manager.create(Comment, {
        content: content.trim(),
        postId,
        parentCommentId: targetParentId || null,
        userId: String(userId),
      });

      const savedComment = await queryRunner.manager.save(Comment, newComment);

      // ৩. সঠিক কাউন্টার আপডেট লজিক
      if (targetParentId) {
        await queryRunner.manager.increment(
          Comment,
          { id: targetParentId },
          'repliesCount',
          1,
        );
      } else {
        await queryRunner.manager.increment(
          Post,
          { id: postId },
          'commentsCount',
          1,
        );
      }

      // ৪. রিলেশনসহ কমেন্ট ফেচ করা — কমিট করার ঠিক আগে (Data Integrity Guaranteed)
      const result = await queryRunner.manager.findOne(Comment, {
        where: { id: savedComment.id },
        relations: ['user'],
      });

      if (!result) {
        throw new NotFoundException(`Comment not found`);
      }

      // ৫. সবকিছু ঠিক থাকলে ট্রানজেকশন কমিট করা হবে
      await queryRunner.commitTransaction();

      // ৬. Exact Response Payload স্ট্রাকচার রিটার্ন
      return {
        id: result.id,
        postId: result.postId,
        parentCommentId: result.parentCommentId,
        author: {
          id: result.user.id,
          name: `${result.user.first_name || ''} ${result.user.last_name || ''}`.trim(),
        },
        content: result.content,
        timestamp: this.formatTimeAgo(result.createdAt),
        likes: 0,
        isLiked: false,
        repliesCount: 0,
      };
    } catch (err) {
      // যেকোনো এরর হলে ডাটাবেজ আগের অবস্থায় রোলব্যাক করবে
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // কানেকশন পুল রিলিজ করা
      await queryRunner.release();
    }
  }

  async getCommentsByPostId(
    postId: string,
    req: Request,
    query: CommentPaginationQueryDto,
  ) {
    const userId = req?.user?.sub;
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      // ১. leftJoin বদলে leftJoinAndSelect ব্যবহার করা হলো যাতে comment.likes লোড হয়
      .leftJoinAndSelect('comment.likes', 'like', 'like.userId = :userId', {
        userId: userId ? String(userId) : null,
      })
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentCommentId IS NULL') // শুধুমাত্র রুট-লেভেল কমেন্ট ফিল্টার
      .orderBy('comment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [comments, totalCount] = await qb.getManyAndCount();
    const hasMore = skip + comments.length < totalCount;

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId, // ২. DTO সিঙ্ক রাখার জন্য অ্যাড করা হলো
      author: {
        id: comment.user.id,
        name: `${comment.user.first_name || ''} ${comment.user.last_name || ''}`.trim(),
      },
      content: comment.content,
      timestamp: this.formatTimeAgo(comment.createdAt),
      likes: comment.likesCount,
      // ৩. এখন comment.likes সফলভাবে অ্যারে হিসেবে চেক হবে
      isLiked: userId ? comment.likes && comment.likes.length > 0 : false,
      repliesCount: comment.repliesCount,
    }));

    return {
      comments: formattedComments,
      hasMore,
      totalCount,
    };
  }
  async getReplies(
    commentId: string,
    req: Request,
    query: CommentPaginationQueryDto,
  ) {
    const userId = req?.user?.sub;
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.likes', 'like', 'like.userId = :userId', {
        userId: userId ? String(userId) : null,
      })
      .where('comment.parentCommentId = :commentId', { commentId })
      .orderBy('comment.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    const [replies, totalCount] = await qb.getManyAndCount();
    const hasMore = skip + replies.length < totalCount;

    const formattedReplies = replies.map((reply) => ({
      id: reply.id,
      postId: reply.postId,

      parentCommentId: reply.parentCommentId,
      author: {
        id: reply.user.id,
        name: `${reply.user.first_name || ''} ${reply.user.last_name || ''}`.trim(),
      },
      content: reply.content,
      timestamp: this.formatTimeAgo(reply.createdAt),
      likes: reply.likesCount,
      isLiked: userId ? reply.likes && reply.likes.length > 0 : false,
      repliesCount: reply.repliesCount,
    }));

    return {
      comments: formattedReplies,
      hasMore,
      totalCount,
    };
  }

  async getAllComments(postId: string) {
    const comments = await this.commentRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,

      parentCommentId: comment.parentCommentId,
      author: {
        id: comment.user.id,
        name: `${comment.user.first_name || ''} ${comment.user.last_name || ''}`.trim(),
      },
      content: comment.content,
      likes: comment.likesCount,
      repliesCount: comment.repliesCount,

      parent: comment.parentCommentId ? { postId: comment.postId } : null,
    }));
  }
}
