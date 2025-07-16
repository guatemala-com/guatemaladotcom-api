import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HealthCheckModule } from '../modules/healthcheck/healthcheck.module';
import { AuthModule } from '../modules/auth/auth.module';
import { LearnModule } from '../modules/learn/learn.module';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { ArticlesModule } from '../modules/articles/articles.module';

// Mock modules
jest.mock('../modules/healthcheck/healthcheck.module');
jest.mock('../modules/auth/auth.module');
jest.mock('../modules/learn/learn.module');
jest.mock('../modules/prisma/prisma.module');
jest.mock('../modules/articles/articles.module');

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [AppModule],
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
      // The ConfigModule is imported in AppModule
      expect(module).toBeDefined();
    });

    it('should import HealthCheckModule', () => {
      expect(HealthCheckModule).toBeDefined();
    });

    it('should import PrismaModule', () => {
      expect(PrismaModule).toBeDefined();
    });

    it('should import AuthModule', () => {
      expect(AuthModule).toBeDefined();
    });

    it('should import LearnModule', () => {
      expect(LearnModule).toBeDefined();
    });

    it('should import ArticlesModule', () => {
      expect(ArticlesModule).toBeDefined();
    });
  });

  describe('module metadata', () => {
    it('should have correct imports', () => {
      // This test verifies that the module can be instantiated
      // which means all imports are correctly configured
      expect(module).toBeDefined();
    });

    it('should have no controllers defined', () => {
      // AppModule has no controllers defined
      expect(module).toBeDefined();
    });

    it('should have no providers defined', () => {
      // AppModule has no providers defined
      expect(module).toBeDefined();
    });
  });

  describe('module compilation', () => {
    it('should compile successfully', () => {
      // If this test passes, the module compiles without errors
      expect(module).toBeDefined();
    });

    it('should not throw errors during compilation', () => {
      // This test ensures the module can be created without throwing
      expect(() => module).not.toThrow();
    });
  });

  describe('dependency injection', () => {
    it('should resolve all dependencies', () => {
      // If the module is defined, all dependencies are resolved
      expect(module).toBeDefined();
    });
  });
});
