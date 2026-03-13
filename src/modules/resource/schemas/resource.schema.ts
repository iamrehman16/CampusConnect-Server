import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ResourceType } from "../enums/resource-types.enum";
import { ApprovalStatus } from "../enums/approval-status.enum";
import { FileType } from "../enums/file-type.enum";
import { IsMongoId } from "class-validator";



@Schema({ timestamps: true })
export class Resource {

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ maxlength: 2000 })
  description: string;

  // Academic classification
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  course: string;

  @Prop({ required: true, min: 1, max: 8 })
  semester: number;

  @Prop({ required: true, enum: ResourceType })
  resourceType: ResourceType;

  // File metadata
  @Prop({ required: true, enum: FileType })
  fileType: FileType;

  @Prop({ required: true, max: 20 * 1024 * 1024 })
  fileSize: number;

  @Prop({ required: true })
  filePath: string;

  @Prop()
  cloudinaryPublicId: string;

  // Ownership
  @IsMongoId()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  // Moderation
  @Prop({ default: ApprovalStatus.PENDING, enum: ApprovalStatus })
  approvalStatus: ApprovalStatus;

  // Community engagement
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  upvotes: Types.ObjectId[];

  @Prop({ default: 0 })
  upvoteCount: number;

  @Prop({ default: 0 })
  downloads: number;

  // Search
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Soft delete
  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: Date.now })
  uploadDate: Date;
}


export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.index({ subject: 1, course: 1 });
ResourceSchema.index({ uploadedBy: 1 });
ResourceSchema.index({ approvalStatus: 1 });
ResourceSchema.index({ tags: 1 });