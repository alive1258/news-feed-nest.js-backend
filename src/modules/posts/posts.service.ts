import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostPrivacy } from './entities/post.entity';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';
import { MulterFile } from 'src/common/types/file.types';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly fileUploadsService: FileUploadsService,
  ) {}

  private formatComment(comment: any, postId: string) {
    const authorData =
      typeof comment.author === 'string'
        ? JSON.parse(comment.author)
        : comment.author;

    return {
      id: comment.id,
      postId: postId,
      author: {
        id: authorData?.id || comment.user_id,
        name: authorData
          ? `${authorData.firstName} ${authorData.lastName}`.trim()
          : 'User',
      },
      content: comment.content,
      timestamp: this.formatTimeAgo(comment.created_at || comment.createdAt),
      likes: comment.likesCount || 0,
      isLiked: comment.isLiked || false,
      repliesCount: comment.repliesCount || 0,
    };
  }

  private formatTimeAgo(date: any): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  async create(
    req: Request,
    createPostDto: CreatePostDto,
    file?: MulterFile,
  ): Promise<Post> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    let imageUrl = createPostDto.image;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const privacy = createPostDto.privacy || PostPrivacy.PUBLIC;

    const newPost = this.postRepository.create({
      ...createPostDto,
      privacy,
      image: imageUrl,
      userId: String(userId),
    });

    return this.postRepository.save(newPost);
  }

  async findAll(
    req: Request,
    cursor?: string,
    limit: number = 10,
  ): Promise<any> {
    const currentUserId = req?.user?.sub;
    const takeLimit = limit || 10;
    const fetchLimit = takeLimit + 1;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(l.id)', 'count')
          .from('likes', 'l')
          .where('l.post_id = post.id')
          .andWhere('l.user_id = :currentUserId', { currentUserId });
      }, 'isLikedCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(l.id)', 'count')
          .from('likes', 'l')
          .where('l.post_id = post.id');
      }, 'likesCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(c.id)', 'count')
          .from('comments', 'c')
          .where('c.post_id = post.id');
      }, 'commentsCount')
      .where(
        '(post.privacy = :publicPrivacy OR post.userId = :currentUserId)',
        {
          publicPrivacy: PostPrivacy.PUBLIC,
          currentUserId,
        },
      );

    if (cursor) {
      const cursorPost = await this.postRepository.findOne({
        where: { id: cursor },
        select: ['createdAt'],
      });

      if (cursorPost) {
        queryBuilder.andWhere(
          '(post.createdAt < :createdAt OR (post.createdAt = :createdAt AND post.id < :cursorId))',
          { createdAt: cursorPost.createdAt, cursorId: cursor },
        );
      }
    }

    queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .take(fetchLimit);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const hasMore = entities.length > takeLimit;
    const postsToReturn = hasMore ? entities.slice(0, takeLimit) : entities;
    const nextCursor = hasMore
      ? postsToReturn[postsToReturn.length - 1].id
      : null;

    if (postsToReturn.length === 0) {
      return { posts: [], hasMore: false, nextCursor: null };
    }

    const postIds = postsToReturn.map((post) => post.id);

    const recentComments = await this.postRepository.manager.query(
      `
      SELECT c.*, json_build_object('id', u.id, 'firstName', u.first_name, 'lastName', u.last_name) AS author
      FROM posts p
      JOIN LATERAL (
        SELECT c.id, c.content, c.created_at, c.post_id, c.user_id
        FROM comments c
        WHERE c.post_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 2
      ) c ON true
      JOIN users u ON u.id = c.user_id
      WHERE p.id = ANY($1)
      ORDER BY c.created_at DESC;
    `,
      [postIds],
    );

    const recentLikes = await this.postRepository.manager.query(
      `
      SELECT l.*, json_build_object('id', u.id, 'firstName', u.first_name, 'lastName', u.last_name) AS user
      FROM posts p
      JOIN LATERAL (
        SELECT l.id, l.post_id, l.created_at, l.user_id
        FROM likes l
        WHERE l.post_id = p.id
        ORDER BY l.created_at DESC
        LIMIT 5
      ) l ON true
      JOIN users u ON u.id = l.user_id
      WHERE p.id = ANY($1)
      ORDER BY l.created_at DESC;
    `,
      [postIds],
    );

    const formattedPosts = postsToReturn.map((post, index) => {
      const rawData = raw[index];
      const isLiked = parseInt(rawData?.isLikedCount || '0', 10) > 0;
      const likesCount = parseInt(rawData?.likesCount || '0', 10);
      const commentCount = parseInt(rawData?.commentsCount || '0', 10);

      const postComments = recentComments
        .filter((c: any) => c.post_id === post.id)
        .map((c: any) => this.formatComment(c, post.id));

      const postLikes = recentLikes
        .filter((l: any) => l.post_id === post.id)
        .map((l: any) => ({
          postId: post.id,
          createdAt: l.created_at,
          user: typeof l.user === 'string' ? JSON.parse(l.user) : l.user,
        }));

      return {
        id: post.id,
        content: post.content,
        image: post.image,
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: post.user?.id || post.userId,
          firstName: post.user?.first_name || '',
          lastName: post.user?.last_name || '',
        },
        isLiked,
        likesCount,
        commentCount,
        comments: postComments,
        likedBy: postLikes,
      };
    });

    return {
      posts: formattedPosts,
      hasMore,
      nextCursor,
    };
  }

  async findOne(id: string, req: Request): Promise<any> {
    const userId = req?.user?.sub;

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (
      post.privacy === PostPrivacy.PRIVATE &&
      (!userId || post.userId !== userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this private post',
      );
    }

    return {
      id: post.id,
      content: post.content,
      image: post.image,
      privacy: post.privacy,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.user?.id || post.userId,
        firstName: post.user?.first_name || '',
        lastName: post.user?.last_name || '',
        name: `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim(),
      },
    };
  }

  async getPostLikers(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ likers: any[]; totalLikes: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException({ error: 'Post not found' });
    }

    const [likes, totalLikes] = await this.postRepository.manager
      .getRepository('Like')
      .findAndCount({
        where: { postId: postId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip: skip,
        take: limit,
      });

    const hasMore = skip + likes.length < totalLikes;

    const formattedLikers = likes.map((like: any) => ({
      id: like.user?.id,
      firstName: like.user?.first_name || '',
      lastName: like.user?.last_name || '',
      name: `${like.user?.first_name || ''} ${like.user?.last_name || ''}`.trim(),
    }));

    return {
      likers: formattedLikers,
      totalLikes,
      hasMore,
    };
  }

  async update(
    id: string,
    req: Request,
    updatePostDto: UpdatePostDto,
    file?: MulterFile,
  ): Promise<any> {
    const currentUserId = req?.user?.sub;
    if (!currentUserId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const existingPost = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (existingPost.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    let imageUrl = existingPost.image;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    Object.assign(existingPost, {
      content:
        updatePostDto.content !== undefined
          ? updatePostDto.content.trim()
          : existingPost.content,
      privacy:
        updatePostDto.privacy !== undefined
          ? updatePostDto.privacy
          : existingPost.privacy,
      image: imageUrl,
    });

    const updatedPost = await this.postRepository.save(existingPost);

    return {
      id: updatedPost.id,
      content: updatedPost.content,
      image: updatedPost.image,
      privacy: updatedPost.privacy,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      author: {
        id: updatedPost.user?.id || updatedPost.userId,
        firstName: updatedPost.user?.first_name || '',
        lastName: updatedPost.user?.last_name || '',
        name: `${updatedPost.user?.first_name || ''} ${updatedPost.user?.last_name || ''}`.trim(),
      },
    };
  }

  async remove(id: string, req: Request): Promise<{ message: string }> {
    const currentUserId = req?.user?.sub;
    if (!currentUserId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const existingPost = await this.postRepository.findOne({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException({ error: 'Post not found' });
    }

    if (existingPost.userId !== currentUserId) {
      throw new ForbiddenException({
        error: 'You can only delete your own posts',
      });
    }

    await this.postRepository.manager
      .getRepository('Comment')
      .delete({ postId: id });
    await this.postRepository.manager
      .getRepository('Like')
      .delete({ postId: id });

    await this.postRepository.remove(existingPost);

    return { message: 'Post deleted successfully' };
  }

  async findByUser(
    userId: string,
    req: Request,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Post[]; meta: any }> {
    const currentUserId = req?.user?.sub;
    const skip = (page - 1) * limit;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.userId = :userId', { userId });

    if (userId !== currentUserId) {
      query.andWhere('post.privacy = :publicPrivacy', {
        publicPrivacy: PostPrivacy.PUBLIC,
      });
    }

    const [posts, total] = await query
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildCommentTree(
    comments: Comment[],
    parentId: string | null = null,
  ): any[] {
    return comments
      .filter((comment) => comment.parentCommentId === parentId)
      .map((comment) => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        createdAt: comment.createdAt,
        user: comment.user
          ? {
              id: comment.user.id,
              first_name: comment.user.first_name,
              last_name: comment.user.last_name,
            }
          : null,
        likesCount: comment.likes?.length || 0,
        commentReplies: this.buildCommentTree(comments, comment.id),
      }));
  }
}
