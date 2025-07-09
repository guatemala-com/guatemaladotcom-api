import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GenerateClientCredentialsUseCase } from '../generate-client-credentials.use-case';

describe('GenerateClientCredentialsUseCase', () => {
  let useCase: GenerateClientCredentialsUseCase;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateClientCredentialsUseCase,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<GenerateClientCredentialsUseCase>(
      GenerateClientCredentialsUseCase,
    );
    configService = mockConfigService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should generate client credentials in development mode when OAUTH_CLIENTS is not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = useCase.execute();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toHaveProperty('client_id');
      expect(result).toHaveProperty('client_secret');
      expect(result.client_id).toMatch(/^gt_client_[a-z0-9]+$/);
      expect(result.client_secret).toBe('development');
    });

    it('should generate client credentials in production mode when OAUTH_CLIENTS is configured', () => {
      // Arrange
      configService.get.mockReturnValue('client1,client2,client3');

      // Act
      const result = useCase.execute();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toHaveProperty('client_id');
      expect(result).toHaveProperty('client_secret');
      expect(result.client_id).toMatch(/^gt_client_[a-z0-9]+$/);
      expect(result.client_secret).toMatch(/^gt_secret_[a-z0-9]+$/);
    });

    it('should generate unique client_id on each execution', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result1 = useCase.execute();
      const result2 = useCase.execute();

      // Assert
      expect(result1.client_id).not.toBe(result2.client_id);
      expect(result1.client_id).toMatch(/^gt_client_[a-z0-9]+$/);
      expect(result2.client_id).toMatch(/^gt_client_[a-z0-9]+$/);
    });

    it('should generate unique client_secret on each execution in production mode', () => {
      // Arrange
      configService.get.mockReturnValue('client1,client2');

      // Act
      const result1 = useCase.execute();
      const result2 = useCase.execute();

      // Assert
      expect(result1.client_secret).not.toBe(result2.client_secret);
      expect(result1.client_secret).toMatch(/^gt_secret_[a-z0-9]+$/);
      expect(result2.client_secret).toMatch(/^gt_secret_[a-z0-9]+$/);
    });

    it('should always return "development" as client_secret when OAUTH_CLIENTS is falsy', () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act
      const result = useCase.execute();

      // Assert
      expect(result.client_secret).toBe('development');
    });

    it('should always return "development" as client_secret when OAUTH_CLIENTS is null', () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = useCase.execute();

      // Assert
      expect(result.client_secret).toBe('development');
    });

    it('should always return "development" as client_secret when OAUTH_CLIENTS is empty string', () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act
      const result = useCase.execute();

      // Assert
      expect(result.client_secret).toBe('development');
    });

    it('should generate client_id with correct format and length', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = useCase.execute();

      // Assert
      expect(result.client_id).toMatch(/^gt_client_[a-z0-9]+$/);
      expect(result.client_id.length).toBeGreaterThan(10); // "gt_client_" (10) + random chars
    });

    it('should generate client_secret with correct format and length in production mode', () => {
      // Arrange
      configService.get.mockReturnValue('some-client');

      // Act
      const result = useCase.execute();

      // Assert
      expect(result.client_secret).toMatch(/^gt_secret_[a-z0-9]+$/);
      expect(result.client_secret.length).toBeGreaterThan(10); // "gt_secret_" (10) + random chars
    });

    it('should call ConfigService.get with correct parameter', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      useCase.execute();

      // Assert
      expect(configService.get).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
    });

    it('should return correct response structure', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = useCase.execute();

      // Assert
      expect(result).toEqual({
        client_id: expect.stringMatching(/^gt_client_[a-z0-9]+$/) as string,
        client_secret: 'development',
      });
    });
  });
});
