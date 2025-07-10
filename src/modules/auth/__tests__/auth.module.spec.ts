import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import { CertificateValidationMiddleware } from '../infrastructure/middleware/certificate-validation.middleware';

describe('AuthModule', () => {
  let module: TestingModule;
  let authModule: AuthModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    authModule = module.get<AuthModule>(AuthModule);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('configure', () => {
    it('should configure CertificateValidationMiddleware for oauth/token route', () => {
      const mockConsumer = {
        apply: jest.fn().mockReturnThis(),
        forRoutes: jest.fn().mockReturnThis(),
      };

      authModule.configure(mockConsumer as unknown as MiddlewareConsumer);

      expect(mockConsumer.apply).toHaveBeenCalledWith(
        CertificateValidationMiddleware,
      );
      expect(mockConsumer.forRoutes).toHaveBeenCalledWith('oauth/token');
    });
  });
});
