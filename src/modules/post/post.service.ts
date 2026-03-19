import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectConnection() private readonly connection: Connection, // For Transactions
  ) {}

  // 1. OPTIMIZED FIND: Use .lean() for 5x-10x faster read performance
  async findAll() {
    return this.postModel
      .find({ isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean() // Returns plain JS objects, saves memory
      .exec();
  }

  // 2. SECURE UPDATE: Filter by author in the query itself (No double DB hit)
  async update(id: string, dto: UpdatePostDto, userId: string) {
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { _id: id, author: new Types.ObjectId(userId), isDeleted: false },
        { $set: dto },
        { new: true }
      )
      .lean();

    if (!updatedPost) {
      // If null, it's either missing OR the user isn't the author
      throw new ForbiddenException('Post not found or unauthorized');
    }
    return updatedPost;
  }

  // 3. ATOMIC TOGGLE: No "if/else" logic in JavaScript
  async toggleUpvote(id: string, userId: string) {
    const uid = new Types.ObjectId(userId);
    
    // Attempt to pull first
    let post = await this.postModel.findOneAndUpdate(
      { _id: id, upvotes: uid },
      { $pull: { upvotes: uid } },
      { new: true }
    ).lean();

    // If result is null, user hasn't upvoted, so add it
    if (!post) {
      post = await this.postModel.findOneAndUpdate(
        { _id: id },
        { $addToSet: { upvotes: uid } },
        { new: true }
      ).lean();
    }

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // 4. TRANSACTIONAL COMMENTING: ACID compliance
  async addComment(postId: string, dto: CreateCommentDto, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Create comment within transaction
      const [comment] = await this.commentModel.create(
        [{
          content: dto.content,
          postId: new Types.ObjectId(postId),
          author: new Types.ObjectId(userId),
        }],
        { session }
      );

      // Increment count ONLY if the post exists and isn't deleted
      const post = await this.postModel.findOneAndUpdate(
        { _id: postId, isDeleted: false },
        { $inc: { commentCount: 1 } },
        { session, new: true }
      );

      if (!post) throw new NotFoundException('Post not found');

      await session.commitTransaction();
      return comment;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Comment failed');
    } finally {
      session.endSession();
    }
  }

  // 5. AGGREGATION FOR STATS: Better than multiple countDocuments
  async getStats() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = await this.postModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          recent: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    return {
      total: stats[0].total[0]?.count || 0,
      recent: stats[0].recent[0]?.count || 0
    };
  }
}