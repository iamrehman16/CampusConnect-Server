import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto } from './dto/admin-post.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() dto: CreatePostDto, @Req() req) {
    return this.postService.create(dto, req.user.id);
  }

  @Public()
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
    return this.postService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.postService.softDelete(id, req.user.id);
  }

  @Post(':id/upvote')
  toggleUpvote(@Param('id') id: string, @Req() req) {
    return this.postService.toggleUpvote(id, req.user.id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    return this.postService.addComment(postId, dto, req.user.id);
  }

  @Public()
  @Get(':id/comments')
  findComments(@Param('id') id: string) {
    return this.postService.findCommentsByPost(id);
  }
}
