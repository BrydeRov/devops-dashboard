jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    listContainers: jest.fn().mockResolvedValue([]),
    getContainer: jest.fn().mockReturnValue({
      logs: jest.fn().mockResolvedValue(Buffer.from('')),
    }),
  }));
});

jest.mock('systeminformation', () => ({
  currentLoad: jest.fn().mockResolvedValue({ currentLoad: 10 }),
  mem: jest.fn().mockResolvedValue({ active: 50, total: 100 }),
  fsSize: jest.fn().mockResolvedValue([{ use: 30 }]),
}));

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      actions: {
        listWorkflowRunsForRepo: jest.fn().mockResolvedValue({
          data: {
            workflow_runs: [],
          },
        }),
      },
    })),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PipelinesGateway } from './pipelines.gateway';
import { DockerLogsGateway } from './dockerLogs.gateway';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PipelinesGateway,
          useValue: {
            emitPipelinesUpdate: jest.fn(),
          },
        },
        {
          provide: DockerLogsGateway,
          useValue: {
            emitDockerLogsUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
