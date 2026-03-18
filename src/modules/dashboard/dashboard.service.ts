import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly resourceService: ResourceService,
  ) {}

  async getOverviewStats() {
    const [userStats, resourceStats] = await Promise.all([
      this.userService.getStats(),
      this.resourceService.getStats(),
    ]);

    return {
      users: userStats,
      resources: resourceStats,
      timestamp: new Date(),
    };
  }
}
