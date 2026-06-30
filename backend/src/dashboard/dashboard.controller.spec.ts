jest.mock('src/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getMetrics: jest.fn(),
            getPipelines: jest.fn(),
            getContainers: jest.fn(),
            getDockerLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should return metrics', async () => {
    const mock = { cpu: 10, memory: 50, uptime: '1h', disk: 20 };
    jest.spyOn(service, 'getMetrics').mockResolvedValue(mock);

    expect(await controller.getMetrics()).toEqual(mock);
  });

  it('should return pipelines', async () => {
    const mock = [{ id: 1 }];
    jest.spyOn(service, 'getPipelines').mockResolvedValue(mock);

    expect(await controller.getPipelines()).toEqual(mock);
  });

  it('should return containers', async () => {
    const mock = [{ id: 'abc' }];
    jest.spyOn(service, 'getContainers').mockResolvedValue(mock);

    expect(await controller.getContainers()).toEqual(mock);
  });

  it('should return docker logs', async () => {
    const mock = { app: [] };
    jest.spyOn(service, 'getDockerLogs').mockResolvedValue(mock);

    expect(await controller.getDockerLogs()).toEqual(mock);
  });
});