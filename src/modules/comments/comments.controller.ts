import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { CommentsService } from './comments.service';
import { CommentPaginationQueryDto } from './dto/comment-pagination-query.dto';
import {
  PaginatedCommentsResponseDto,
  CommentResponseItemDto,
} from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
@UseGuards(JwtOrApiKeyGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiDoc({
    summary: 'Create Comment',
    description: 'Creates a new comment or nested reply on a post',
    response: CommentResponseItemDto,
    status: HttpStatus.CREATED,
  })
  @Post('comments')
  async create(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(req, createCommentDto);
  }

  @ApiDoc({
    summary: 'Get Initial Post Comments',
    description: 'Get root-level paginated comments for a specific post',
    response: PaginatedCommentsResponseDto,
    status: HttpStatus.OK,
  })
  @Get('posts/:postId/comments')
  async findByPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: CommentPaginationQueryDto,
    @Req() req: Request,
  ) {
    return this.commentsService.getCommentsByPostId(postId, req, query);
  }

  @ApiDoc({
    summary: 'Get All Comments for Modal',
    description: 'Get all comments flat list for modal rendering',
    status: HttpStatus.OK,
  })
  @Get('posts/:postId/all-comments')
  async findAllFlat(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.getAllComments(postId);
  }

  @ApiDoc({
    summary: 'Get Comment Replies',
    description: 'Get paginated replies for a specific parent comment',
    response: PaginatedCommentsResponseDto,
    status: HttpStatus.OK,
  })
  @Get('comments/:commentId/replies')
  async getReplies(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Query() query: CommentPaginationQueryDto,
    @Req() req: Request,
  ) {
    return this.commentsService.getReplies(commentId, req, query);
  }
}
