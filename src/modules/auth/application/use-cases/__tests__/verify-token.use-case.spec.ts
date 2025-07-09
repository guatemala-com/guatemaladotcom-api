import { Test, TestingModule } from '@nestjs/testing';
import {
  VerifyTokenUseCase,
  VerifyTokenRequest,
} from '../verify-token.use-case';
import { TokenRepositoryImpl } from '../../../infrastructure/repositories/token.repository';
import { mockToken } from '../../../__mocks__/entities.mocks';
import { mockTokenRepository } from '../../../__mocks__/repositories.mocks';

describe('VerifyTokenUseCase', () => {
  let useCase: VerifyTokenUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTokenRepository.validateToken.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyTokenUseCase,
        {
          provide: TokenRepositoryImpl,
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    useCase = module.get<VerifyTokenUseCase>(VerifyTokenUseCase);
  });

  describe('execute', () => {
    const validRequest: VerifyTokenRequest = {
      token: 'valid-token',
    };

    it('should verify token successfully and return payload', async () => {
      // Arrange
      mockTokenRepository.validateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockTokenRepository.validateToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(result.valid).toBe(true);
      expect(result.payload).toEqual(mockToken.getVerificationInfo());
      expect(result.error).toBeUndefined();
    });

    it('should return valid: false and error when token is invalid', async () => {
      // Arrange
      mockTokenRepository.validateToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockTokenRepository.validateToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(result.valid).toBe(false);
      expect(result.payload).toBeUndefined();
      expect(result.error).toBe('Invalid token');
    });

    it('should return correct response structure for valid token', async () => {
      // Arrange
      mockTokenRepository.validateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('payload');
      expect(result.payload).toHaveProperty('client_id');
      expect(result.payload).toHaveProperty('issuer');
      expect(result.payload).toHaveProperty('audience');
      expect(result.payload).toHaveProperty('issued_at');
      expect(result.payload).toHaveProperty('expires_at');
    });

    it('should return correct response structure for invalid token', async () => {
      // Arrange
      mockTokenRepository.validateToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toHaveProperty('valid', false);
      expect(result).toHaveProperty('error', 'Invalid token');
      expect(result).not.toHaveProperty('payload');
    });
  });
});
