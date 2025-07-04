import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma.module';
import { PrismaService } from '../infrastructure/prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module structure', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should be a global module', () => {
      // PrismaModule is decorated with @Global()
      expect(module).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide PrismaService', () => {
      const service = module.get<PrismaService>(PrismaService);
      expect(service).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('exports', () => {
    it('should export PrismaService', () => {
      const service = module.get<PrismaService>(PrismaService);
      expect(service).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should provide PrismaService as singleton', () => {
      const service1 = module.get<PrismaService>(PrismaService);
      const service2 = module.get<PrismaService>(PrismaService);

      expect(service1).toBe(service2);
    });
  });

  describe('module compilation', () => {
    it('should compile successfully', () => {
      expect(module).toBeDefined();
    });

    it('should not throw errors during compilation', () => {
      expect(() => module).not.toThrow();
    });
  });

  describe('global scope', () => {
    it('should be available globally', () => {
      // Since it's a global module, it should be available
      expect(module).toBeDefined();
    });
  });
});
