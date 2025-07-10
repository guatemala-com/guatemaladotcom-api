import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import {
  ValidateClientUseCase,
  ValidateClientRequest,
} from '../validate-client.use-case';
import { ClientRepositoryImpl } from '../../../infrastructure/repositories/client.repository';
import {
  mockClient,
  mockClientWithLimitedScopes,
} from '../../../__mocks__/entities.mocks';
import { mockClientRepository } from '../../../__mocks__/repositories.mocks';

describe('ValidateClientUseCase', () => {
  let useCase: ValidateClientUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockClientRepository.findByClientId.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateClientUseCase,
        {
          provide: ClientRepositoryImpl,
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    useCase = module.get<ValidateClientUseCase>(ValidateClientUseCase);
  });

  describe('execute', () => {
    const validRequest: ValidateClientRequest = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    };

    it('should validate client successfully with correct credentials', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(result).toEqual({ client: mockClient, isValid: true });
    });

    it('should throw UnauthorizedException when client is not found', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Client not found'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
    });

    it('should throw UnauthorizedException when client credentials are invalid', async () => {
      // Arrange
      // Create a client with a different secret
      const invalidSecretClient = mockClientWithLimitedScopes;
      jest
        .spyOn(invalidSecretClient, 'validateCredentials')
        .mockReturnValue(false);
      mockClientRepository.findByClientId.mockResolvedValue(
        invalidSecretClient,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Invalid client credentials'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
    });

    it('should throw UnauthorizedException when certificate validation fails', async () => {
      // Arrange
      const requestWithCertificate: ValidateClientRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        certificateFingerprint: 'invalid-fingerprint',
      };

      const clientWithInvalidCertificate = mockClient;
      jest
        .spyOn(clientWithInvalidCertificate, 'validateCertificate')
        .mockReturnValue(false);
      mockClientRepository.findByClientId.mockResolvedValue(
        clientWithInvalidCertificate,
      );

      // Act & Assert
      await expect(useCase.execute(requestWithCertificate)).rejects.toThrow(
        new UnauthorizedException('Invalid client certificate'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
    });

    it('should return correct response structure', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      // Reset any previous mocks on the client
      jest.spyOn(mockClient, 'validateCertificate').mockReturnValue(true);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('isValid');
      expect(result.isValid).toBe(true);
      expect(result.client).toBe(mockClient);
    });
  });
});
