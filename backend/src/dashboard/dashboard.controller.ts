import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('pipelines')
  @UseGuards(JwtAuthGuard)
  getPipelines() {
    return this.dashboardService.getPipelines()
  }

  @Get('containers')
  @UseGuards(JwtAuthGuard)
  getContainers() {
    return this.dashboardService.getContainers()
  }
  
  @Get('dockerLogs')
  @UseGuards(JwtAuthGuard)
  getDockerLogs(){
    return this.dashboardService.getDockerLogs()
  }
}
