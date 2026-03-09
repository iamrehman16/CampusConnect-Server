import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserRole } from "../enums/user-role.enum";
import { UserStatus } from "../enums/user-status.enum";

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret:any) {
      delete ret.password;
      return ret;
    },
  },
})
export class User {

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: '' })
  name?: string;

  @Prop({ default: null, select:false })
  hashedRefreshToken?: string;

  @Prop({ default: UserRole.Student, type:String, enum:UserRole })
  role: UserRole;

  @Prop()
  academicInfo: string;

  @Prop()
  expertise: string;

  @Prop({ default: 0 })
  contributionScore: number;

  @Prop({ default: UserStatus.Active, enum: UserStatus, type:String })
  accountStatus: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);