import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResourceService } from '../resource/resource.service';
import { PostService } from '../post/post.service';

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
      this.postService.getStats(),
    ]);

    return {
      users: userStats,
      resources: resourceStats,
      posts: postStats,
      timestamp: new Date(),
    };
  }
}
