import { Test, TestingModule } from '@nestjs/testing';
import { Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import {
  CertificateValidationMiddleware,
  RequestWithCertificate,
} from '../certificate-validation.middleware';

describe('CertificateValidationMiddleware', () => {
  let middleware: CertificateValidationMiddleware;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CertificateValidationMiddleware],
    }).compile();

    middleware = module.get<CertificateValidationMiddleware>(
      CertificateValidationMiddleware,
    );

    mockNext = jest.fn();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('use', () => {
    it('should call next function when processing request with certificate', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
          C: 'US',
          ST: 'CA',
          L: 'San Francisco',
          O: 'Test Corp',
          OU: 'IT',
        },
        serialNumber: '123456789',
        fingerprint:
          'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
        raw: Buffer.from('mock-certificate-data'),
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeDefined();
      expect(mockRequest.clientCertificate).toBe(mockCertificate);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Client certificate detected:'),
      );
    });

    it('should call next function when no certificate is present', () => {
      // Arrange
      const mockRequest = {
        connection: undefined,
        socket: undefined,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeUndefined();
      expect(mockRequest.clientCertificate).toBeUndefined();
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully and call next', () => {
      // Arrange
      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockImplementation(() => {
          throw new Error('Certificate error');
        }),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Error extracting peer certificate:',
        'Certificate error',
      );
    });

    it('should handle certificate with fingerprint fallback', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
          C: 'US',
          ST: 'CA',
          L: 'San Francisco',
          O: 'Test Corp',
          OU: 'IT',
        },
        serialNumber: '123456789',
        fingerprint:
          'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
        raw: undefined, // Force fallback to fingerprint
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBe(
        'AABBCCDDEEFF00112233445566778899AABBCCDD',
      );
      expect(mockRequest.clientCertificate).toBe(mockCertificate);
    });

    it('should handle certificate with subject/serial fallback', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
          C: 'US',
          ST: 'CA',
          L: 'San Francisco',
          O: 'Test Corp',
          OU: 'IT',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined, // Force fallback to subject/serial
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeDefined();
      expect(mockRequest.certificateFingerprint).toMatch(/^[A-F0-9]{64}$/);
      expect(mockRequest.clientCertificate).toBe(mockCertificate);
    });

    it('should handle empty certificate object', () => {
      // Arrange
      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue({}),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeUndefined();
      expect(mockRequest.clientCertificate).toBeUndefined();
    });

    it('should handle non-TLS connection', () => {
      // Arrange
      const mockConnection = {};

      const mockRequest = {
        connection: mockConnection,
        socket: mockConnection,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeUndefined();
      expect(mockRequest.clientCertificate).toBeUndefined();
    });

    it('should handle certificate extraction errors', () => {
      // Arrange
      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockImplementation(() => {
          throw new Error('Peer certificate error');
        }),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeUndefined();
      expect(mockRequest.clientCertificate).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        'Error extracting peer certificate:',
        'Peer certificate error',
      );
    });

    it('should handle non-Error exceptions', () => {
      // Arrange
      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'string error';
        }),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Error extracting peer certificate:',
        'Unknown error',
      );
    });

    it('should handle certificate validation error in main try-catch', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined,
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Mock the calculateFingerprint method to throw an error
      jest
        .spyOn(middleware as any, 'calculateFingerprint')
        .mockImplementation(() => {
          throw new Error('Fingerprint calculation failed');
        });

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Certificate validation error:',
        'Fingerprint calculation failed',
      );
    });

    it('should handle certificate validation error with unknown error type', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined,
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Mock the calculateFingerprint method to throw a non-Error
      jest
        .spyOn(middleware as any, 'calculateFingerprint')
        .mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'string error';
        });

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Certificate validation error:',
        'Unknown error',
      );
    });

    it('should handle fingerprint calculation error and throw', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined,
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Mock the calculateFingerprint method to throw an error that should be caught by the main try-catch
      jest
        .spyOn(middleware as any, 'calculateFingerprint')
        .mockImplementation(() => {
          console.warn(
            'Error calculating certificate fingerprint:',
            'Hash creation failed',
          );
          throw new Error('Unable to calculate certificate fingerprint');
        });

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Certificate validation error:',
        'Unable to calculate certificate fingerprint',
      );
    });
  });

  describe('calculateFingerprint internal errors', () => {
    it('should handle crypto hash creation error within calculateFingerprint', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined,
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Mock crypto.createHash to throw an error directly
      const createHashSpy = jest
        .spyOn(crypto, 'createHash')
        .mockImplementation(() => {
          throw new Error('Hash creation failed');
        });

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Error calculating certificate fingerprint:',
        'Hash creation failed',
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Certificate validation error:',
        'Unable to calculate certificate fingerprint',
      );

      // Restore original function
      createHashSpy.mockRestore();
    });

    it('should handle non-Error exception in calculateFingerprint', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'test-client.example.com',
        },
        serialNumber: '123456789',
        raw: undefined,
        fingerprint: undefined,
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Mock crypto.createHash to throw a non-Error
      const createHashSpy = jest
        .spyOn(crypto, 'createHash')
        .mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'string error';
        });

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith(
        'Error calculating certificate fingerprint:',
        'Unknown error',
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Certificate validation error:',
        'Unable to calculate certificate fingerprint',
      );

      // Restore original function
      createHashSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should process complete request lifecycle with certificate', () => {
      // Arrange
      const mockCertificate = {
        subject: {
          CN: 'integration-test.example.com',
          C: 'US',
          ST: 'NY',
          L: 'New York',
          O: 'Integration Corp',
          OU: 'Testing',
        },
        serialNumber: 'ABC123DEF456',
        fingerprint:
          '11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44',
        raw: Buffer.from('integration-test-certificate'),
      };

      const mockTLSSocket = {
        getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
      };

      const mockRequest = {
        connection: mockTLSSocket,
        socket: mockTLSSocket,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeDefined();
      expect(mockRequest.clientCertificate).toBe(mockCertificate);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Client certificate detected:'),
      );
    });

    it('should process request lifecycle without certificate', () => {
      // Arrange
      const mockRequest = {
        connection: undefined,
        socket: undefined,
      } as unknown as RequestWithCertificate;

      const mockResponse = {} as Response;

      // Act
      middleware.use(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.certificateFingerprint).toBeUndefined();
      expect(mockRequest.clientCertificate).toBeUndefined();
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
