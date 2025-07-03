import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should implement OnModuleInit interface', () => {
    expect(service).toHaveProperty('onModuleInit');
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should implement OnModuleDestroy interface', () => {
    expect(service).toHaveProperty('onModuleDestroy');
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have logger instance', () => {
    expect(service['logger']).toBeInstanceOf(Logger);
    expect(service['logger']['context']).toBe('PrismaService');
  });
});
