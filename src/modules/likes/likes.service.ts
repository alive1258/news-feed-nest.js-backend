import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post as PostEntity } from '../posts/entities/post.entity';
import { Comment as CommentEntity } from '../comments/entities/comment.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { CommentPaginationQueryDto } from '../comments/dto/comment-pagination-query.dto';
import { Request } from 'express';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

interface DatabaseError extends Error {
  code?: string;
}

interface ILikeableEntity {
  id: string;
  likesCount: number;
}

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async toggleLike(req: Request, createLikeDto: CreateLikeDto) {
    const userId = req?.user?.sub;
    const { postId, commentId } = createLikeDto;

    if ((!postId && !commentId) || (postId && commentId)) {
      throw new BadRequestException('Provide either postId or commentId.');
    }

    const isPost = !!postId;
    const targetId = postId ?? commentId!;
    const entityType = isPost ? PostEntity : CommentEntity;
    const likeField = isPost ? 'postId' : 'commentId';
    const entityName = isPost ? 'Post' : 'Comment';

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const target = await queryRunner.manager.findOne(entityType, {
        where: { id: targetId } as any,
      });

      if (!target) {
        throw new NotFoundException(`${entityName} not found`);
      }

      const existingLike = await queryRunner.manager.findOne(Like, {
        where: {
          userId,
          [likeField]: targetId,
        },
      });

      if (existingLike) {
        await queryRunner.manager.remove(Like, existingLike);

        await queryRunner.manager.decrement(
          entityType,
          { id: targetId },
          'likesCount',
          1,
        );

        await queryRunner.commitTransaction();

        return {
          liked: false,
          action: 'unliked',
          message: `${entityName} unliked successfully`,
        };
      }

      const newLike = queryRunner.manager.create(Like, {
        userId,
        [likeField]: targetId,
      });

      await queryRunner.manager.save(Like, newLike);

      await queryRunner.manager.increment(
        entityType,
        { id: targetId },
        'likesCount',
        1,
      );

      await queryRunner.commitTransaction();

      return {
        liked: true,
        action: 'liked',
        message: `${entityName} liked successfully`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Toggle like failed for User: ${userId} on ${entityName}: ${targetId}`,
        err instanceof Error ? err.stack : undefined,
      );

      if (err && typeof err === 'object' && 'code' in err) {
        const dbError = err as DatabaseError;

        if (dbError.code === '23505') {
          throw new ConflictException(
            `You have already liked this ${entityName.toLowerCase()}.`,
          );
        }
      }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPostLikers(postId: string, query: CommentPaginationQueryDto) {
    return this.getLikers('postId', postId, query, this.postRepository);
  }

  async getCommentLikers(commentId: string, query: CommentPaginationQueryDto) {
    return this.getLikers(
      'commentId',
      commentId,
      query,
      this.commentRepository,
    );
  }

  private async getLikers(
    field: 'postId' | 'commentId',
    targetId: string,
    query: CommentPaginationQueryDto,
    targetRepository: Repository<any>, // TypeORM-এর জেনেরিক মিসম্যাচ এড়াতে Repository<any> ব্যবহার করা হয়েছে
  ) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const target = await targetRepository.findOne({
      where: { id: targetId } as any,
    });

    if (!target) {
      throw new NotFoundException(
        field === 'postId' ? 'Post not found' : 'Comment not found',
      );
    }

    // target-কে ILikeableEntity হিসেবে কাস্ট করেlikesCount বের করা হয়েছে
    const targetEntity = target as ILikeableEntity;
    const likesCount = targetEntity.likesCount ?? 0;

    const likers = await this.likeRepository.find({
      where: { [field]: targetId } as any, // dynamic key টাইপিং সেফগার্ড
      relations: {
        user: true,
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      likers: likers.map((like) => ({
        id: like.user?.id,
        firstName: like.user?.first_name,
        lastName: like.user?.last_name,
      })),
      hasMore: skip + likers.length < likesCount,
      totalLikes: likesCount,
    };
  }
}
