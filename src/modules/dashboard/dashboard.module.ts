import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserModule } from '../user/user.module';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [UserModule, ResourceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
