import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Req,
  UploadedFile,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PostResponseDto } from './dto/post-response.dto';
import { MulterFile } from 'src/common/types/file.types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiDoc({
    summary: 'Create Post',
    description: 'Creates a new post. Requires proper permission.',
    response: CreatePostDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.postsService.create(req, createPostDto, file);
  }

  @ApiDoc({
    summary: 'Get Feed Posts',
    description:
      "Get all public posts and user's private posts with cursor pagination",
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get()
  findAll(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.findAll(req, cursor, Number(limit));
  }

  @ApiDoc({
    summary: 'Get Post by ID',
    description: 'Get a single post by ID with privacy check',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postsService.findOne(id, req);
  }

  @ApiDoc({
    summary: 'Get Post Likers',
    description: 'Get a paginated list of users who liked the post',
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get(':id/likers')
  async getPostLikers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.postsService.getPostLikers(id, Number(page), Number(limit));
  }

  @ApiDoc({
    summary: 'Update Post',
    description: 'Update an existing post',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.postsService.update(id, req, updatePostDto, file);
  }

  @ApiDoc({
    summary: 'Delete Post',
    description: 'Delete a post with authorization and relation cleanup',
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postsService.remove(id, req);
  }

  @ApiDoc({
    summary: 'Get User Posts',
    description: 'Get all posts by a specific user',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.postsService.findByUser(
      userId,
      req,
      Number(page),
      Number(limit),
    );
  }
}
