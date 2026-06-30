import { Test, TestingModule } from '@nestjs/testing';
import { MovementsService } from './movements.service';

describe('MovementsService', () => {
  let service: MovementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MovementsService,
          useValue: {
            findAll: jest.fn(),
            findByProduct: jest.fn(),
            create: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<MovementsService>(MovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
