import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PipelinesGateway } from './pipelines.gateway';
import { DockerLogsGateway } from './dockerLogs.gateway';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PipelinesGateway, DockerLogsGateway],
  exports: [DashboardService],
})
export class DashboardModule {}
