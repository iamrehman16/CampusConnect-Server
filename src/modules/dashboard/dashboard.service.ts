import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResourceService } from '../resource/resource.service';
import { PostService } from '../post/post.service';
import { ResourceAnalyticsDto, UserGrowthDto } from './dto/resource-analytics.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly resourceService: ResourceService,
    private readonly postService: PostService,
  ) {}

  async getOverviewStats() {
    const [userStats, resourceStats, postStats] = await Promise.all([
      this.userService.getStats(),
      this.resourceService.getStats(),
      this.postService.getPostStats(),
    ]);

    return {
      users: userStats,
      resources: resourceStats,
      posts: postStats,
      timestamp: new Date(),
    };
  }

  async getResourceAnalytics():Promise<ResourceAnalyticsDto>{
    return this.resourceService.getAnalytics();
  }

  async getUserGrowth():Promise<UserGrowthDto>{
    return this.userService.getGrowth();
  }

}
