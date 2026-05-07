import { Controller, Get } from "@nestjs/common";
import { Roles } from "../user/enums/user-role.enum";
import { DashboardService } from "./dashboard.service";
import { Role } from "../auth/decorators/role.decorator";



@Controller('dashboard')
@Role(Roles.CONTRIBUTOR,Roles.STUDENT)
export class DashboardController{
    constructor(private readonly dashboardService: DashboardService){}

    @Get('stats')
    getPublicStats(){
        return this.dashboardService.getPublicStats();
    }
}