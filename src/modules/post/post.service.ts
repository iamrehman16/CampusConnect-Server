import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { AdminUpdatePostDto, CreateCommentDto } from './dto/admin-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  // POST METHODS
  async create(dto: CreatePostDto, userId: string): Promise<PostDocument> {
    return await this.postModel.create({
      ...dto,
      author: new Types.ObjectId(userId),
    });
  }

  async findAll() {
    return this.postModel
      .find({ isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email')
      .exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, dto: UpdatePostDto, userId: string) {
    const post = await this.findOne(id);
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    return this.postModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async softDelete(id: string, userId: string) {
    const post = await this.findOne(id);
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    return this.postModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  // UPVOTE LOGIC
  async toggleUpvote(id: string, userId: string) {
    const post = await this.findOne(id);
    const userObjectId = new Types.ObjectId(userId);
    
    const hasUpvoted = post.upvotes.some(id => id.equals(userObjectId));
    
    if (hasUpvoted) {
      return this.postModel.findByIdAndUpdate(
        id,
        { $pull: { upvotes: userObjectId } },
        { new: true }
      );
    } else {
      return this.postModel.findByIdAndUpdate(
        id,
        { $addToSet: { upvotes: userObjectId } },
        { new: true }
      );
    }
  }

  // COMMENT METHODS
  async addComment(postId: string, dto: CreateCommentDto, userId: string) {
    await this.findOne(postId); // Check if post exists
    
    const comment = await this.commentModel.create({
      content: dto.content,
      postId: new Types.ObjectId(postId),
      author: new Types.ObjectId(userId),
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    
    return comment;
  }

  async findCommentsByPost(postId: string) {
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId), isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: 1 })
      .exec();
  }

  // ADMIN METHODS
  async adminUpdate(id: string, dto: AdminUpdatePostDto) {
    const post = await this.postModel.findByIdAndUpdate(id, dto, { new: true });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getStats() {
    const [total, recent] = await Promise.all([
      this.postModel.countDocuments({ isDeleted: false }),
      this.postModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isDeleted: false 
      }),
    ]);
    return { total, recent };
  }
}
