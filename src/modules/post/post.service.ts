import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AdminUpdatePostDto } from './dto/admin-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(dto: CreatePostDto, userId: string): Promise<PostDocument> {
    const post = new this.postModel({
      ...dto,
      author: new Types.ObjectId(userId),
    });
    return post.save();
  }

  async findAll() {
    return this.postModel
      .find({ isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email')
      .lean()
      .exec();

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, dto: UpdatePostDto, userId: string) {
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { _id: id, author: new Types.ObjectId(userId), isDeleted: false },
        { $set: dto },
        { new: true },
      )
      .lean()
      .exec();

    if (!updatedPost) {
      throw new ForbiddenException('Post not found or unauthorized');
    }
    return updatedPost;
  }

  async softDelete(id: string, userId: string) {
    const result = await this.postModel
      .findOneAndUpdate(
        { _id: id, author: new Types.ObjectId(userId), isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true },
      )
      .lean()
      .exec();

    if (!result) {
      throw new ForbiddenException('Post not found or unauthorized');
    }
    return { success: true };
  }

  async toggleUpvote(id: string, userId: string) {
    const uid = new Types.ObjectId(userId);
    const postId = new Types.ObjectId(id);

    // Try to remove user from upvotes first
    let post = await this.postModel
      .findOneAndUpdate(
        { _id: postId, upvotes: uid, isDeleted: false },
        { $pull: { upvotes: uid } },
        { new: true },
      )
      .lean()
      .exec();

    // If not found in upvotes, add user
    if (!post) {
      post = await this.postModel
        .findOneAndUpdate(
          { _id: postId, isDeleted: false },
          { $addToSet: { upvotes: uid } },
          { new: true },
        )
        .lean()
        .exec();
    }

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async addComment(postId: string, dto: CreateCommentDto, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const [comment] = await this.commentModel.create(
        [
          {
            content: dto.content,
            postId: new Types.ObjectId(postId),
            author: new Types.ObjectId(userId),
          },
        ],
        { session },
      );

      const post = await this.postModel
        .findOneAndUpdate(
          { _id: postId, isDeleted: false },
          { $inc: { commentCount: 1 } },
          { session, new: true },
        )
        .lean()
        .exec();

      if (!post) throw new NotFoundException('Post not found');

      await session.commitTransaction();
      return comment;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Comment failed');
    } finally {
      session.endSession();
    }
  }

  async findCommentsByPost(postId: string) {
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId), isDeleted: false })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async adminUpdate(id: string, dto: AdminUpdatePostDto) {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean()
      .exec();

    if (!updatedPost) throw new NotFoundException('Post not found');
    return updatedPost;
  }

  async getStats() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await this.postModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          recent: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    return {
      total: stats[0].total[0]?.count || 0,
      recent: stats[0].recent[0]?.count || 0,
    };
  }
}
