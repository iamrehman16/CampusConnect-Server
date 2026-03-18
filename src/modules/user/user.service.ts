import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminUpdateUserDto } from './dto/update-admin-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Roles } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(dto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      ...dto,
      name: dto.name || dto.email,
      password: hashedPassword,
      role: Roles.STUDENT,
      accountStatus: UserStatus.ACTIVE,
      contributionScore: 0,
    });

    try {
      return await newUser.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async createUserByAdmin(dto: AdminCreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      ...dto,
      name: dto.name || dto.email,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async findOneWithHashedRefreshToken(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+hashedRefreshToken')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with id ${email} not found`);
    }
    return user;
  }

  async updateUserByAdmin(id: string, dto: AdminUpdateUserDto) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async updateRole(id: string, role: Roles) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return updatedUser;
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  async getStats() {
    const [total, contributors] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: Roles.CONTRIBUTOR }),
    ]);
    return { total, contributors };
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { hashedRefreshToken: hashedRefreshToken },
      { new: true },
    );
  }
}
