import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { CommentPaginationQueryDto } from '../comments/dto/comment-pagination-query.dto';

@ApiTags('Likes')
@ApiBearerAuth()
@UseGuards(JwtOrApiKeyGuard)
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('likes/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Req() req: Request, @Body() createLikeDto: CreateLikeDto) {
    return this.likesService.toggleLike(req, createLikeDto);
  }

  @Get('comments/:commentId/likers')
  async getCommentLikers(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Query() query: CommentPaginationQueryDto,
  ) {
    return this.likesService.getCommentLikers(commentId, query);
  }
}
