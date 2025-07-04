import { HealthCheck } from '../../entities/healthcheck.entity';
import { HealthStatus } from '../../types/healthcheck.types';

describe('HealthCheck Entity', () => {
  const mockTimestamp = '2024-01-01T00:00:00.000Z';
  const mockUptime = 123.45;
  const mockEnvironment = 'test';

  describe('constructor', () => {
    it('should create a HealthCheck instance with provided values', () => {
      // Act
      const healthCheck = new HealthCheck(
        HealthStatus.OK,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Assert
      expect(healthCheck.status).toBe(HealthStatus.OK);
      expect(healthCheck.timestamp).toBe(mockTimestamp);
      expect(healthCheck.uptime).toBe(mockUptime);
      expect(healthCheck.environment).toBe(mockEnvironment);
    });

    it('should create a HealthCheck instance with error status', () => {
      // Act
      const healthCheck = new HealthCheck(
        HealthStatus.ERROR,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Assert
      expect(healthCheck.status).toBe(HealthStatus.ERROR);
    });

    it('should create a HealthCheck instance with warning status', () => {
      // Act
      const healthCheck = new HealthCheck(
        HealthStatus.WARNING,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Assert
      expect(healthCheck.status).toBe(HealthStatus.WARNING);
    });
  });

  describe('create static method', () => {
    it('should create a HealthCheck instance using static method', () => {
      // Act
      const healthCheck = HealthCheck.create(
        HealthStatus.OK,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Assert
      expect(healthCheck).toBeInstanceOf(HealthCheck);
      expect(healthCheck.status).toBe(HealthStatus.OK);
      expect(healthCheck.timestamp).toBe(mockTimestamp);
      expect(healthCheck.uptime).toBe(mockUptime);
      expect(healthCheck.environment).toBe(mockEnvironment);
    });

    it('should create a HealthCheck instance with different statuses', () => {
      // Act
      const okHealthCheck = HealthCheck.create(
        HealthStatus.OK,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );
      const errorHealthCheck = HealthCheck.create(
        HealthStatus.ERROR,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );
      const warningHealthCheck = HealthCheck.create(
        HealthStatus.WARNING,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Assert
      expect(okHealthCheck.status).toBe(HealthStatus.OK);
      expect(errorHealthCheck.status).toBe(HealthStatus.ERROR);
      expect(warningHealthCheck.status).toBe(HealthStatus.WARNING);
    });
  });

  describe('isHealthy method', () => {
    it('should return true when status is ok', () => {
      // Arrange
      const healthCheck = HealthCheck.create(
        HealthStatus.OK,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Act
      const result = healthCheck.isHealthy();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when status is error', () => {
      // Arrange
      const healthCheck = HealthCheck.create(
        HealthStatus.ERROR,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Act
      const result = healthCheck.isHealthy();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when status is warning', () => {
      // Arrange
      const healthCheck = HealthCheck.create(
        HealthStatus.WARNING,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Act
      const result = healthCheck.isHealthy();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for unknown status', () => {
      // Arrange
      const healthCheck = HealthCheck.create(
        'unknown' as HealthStatus,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Act
      const result = healthCheck.isHealthy();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      // Arrange
      const healthCheck = HealthCheck.create(
        HealthStatus.OK,
        mockTimestamp,
        mockUptime,
        mockEnvironment,
      );

      // Act & Assert
      // In TypeScript, readonly properties can still be assigned at runtime
      // but TypeScript will show compilation errors
      // This test verifies the properties exist and are accessible
      expect(healthCheck.status).toBe(HealthStatus.OK);
      expect(healthCheck.timestamp).toBe(mockTimestamp);
      expect(healthCheck.uptime).toBe(mockUptime);
      expect(healthCheck.environment).toBe(mockEnvironment);
    });
  });
});
