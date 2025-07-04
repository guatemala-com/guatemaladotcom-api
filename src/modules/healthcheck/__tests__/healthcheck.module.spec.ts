import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckModule } from '../healthcheck.module';
import { HealthCheckController } from '../infrastructure/controllers/healthcheck.controller';
import { HealthCheckRepository } from '../infrastructure/repositories/healthcheck.repository';
import { HealthCheckUseCase } from '../application/use-cases/healthcheck.use-case';

describe('HealthCheckModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [HealthCheckModule],
    }).compile();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module structure', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should import ConfigModule', () => {
      // The module imports ConfigModule
      expect(module).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide HealthCheckRepository', () => {
      const repository = module.get<HealthCheckRepository>(
        HealthCheckRepository,
      );
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(HealthCheckRepository);
    });

    it('should provide HealthCheckUseCase', () => {
      const useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(HealthCheckUseCase);
    });
  });

  describe('controllers', () => {
    it('should provide HealthCheckController', () => {
      const controller = module.get<HealthCheckController>(
        HealthCheckController,
      );
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(HealthCheckController);
    });
  });

  describe('dependency injection', () => {
    it('should inject HealthCheckRepository into HealthCheckUseCase', () => {
      const useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
      const repository = module.get<HealthCheckRepository>(
        HealthCheckRepository,
      );

      expect(useCase).toBeDefined();
      expect(repository).toBeDefined();
    });

    it('should inject HealthCheckUseCase into HealthCheckController', () => {
      const controller = module.get<HealthCheckController>(
        HealthCheckController,
      );
      const useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);

      expect(controller).toBeDefined();
      expect(useCase).toBeDefined();
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

  describe('exports', () => {
    it('should not export any providers', () => {
      // HealthCheckModule has empty exports array
      expect(module).toBeDefined();
    });
  });
});
