import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserModule } from '../user/user.module';
import { ResourceModule } from '../resource/resource.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [UserModule, ResourceModule, PostModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
