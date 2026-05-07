import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserModule } from '../user/user.module';
import { ResourceModule } from '../resource/resource.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [UserModule, ResourceModule, PostModule],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
