import {
  HealthStatus,
  HealthCheckData,
  DatabaseHealth,
  ServiceHealth,
} from '../../../domain/types/healthcheck.types';

describe('HealthCheck Types', () => {
  describe('HealthStatus enum', () => {
    it('should have correct enum values', () => {
      expect(HealthStatus.OK).toBe('ok');
      expect(HealthStatus.ERROR).toBe('error');
      expect(HealthStatus.WARNING).toBe('warning');
    });

    it('should have exactly three status values', () => {
      const statusValues = Object.values(HealthStatus);
      expect(statusValues).toHaveLength(3);
      expect(statusValues).toContain('ok');
      expect(statusValues).toContain('error');
      expect(statusValues).toContain('warning');
    });
  });

  describe('HealthCheckData interface', () => {
    it('should allow creating objects with correct structure', () => {
      const healthData: HealthCheckData = {
        status: HealthStatus.OK,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        environment: 'test',
      };

      expect(healthData.status).toBe(HealthStatus.OK);
      expect(healthData.timestamp).toBe('2024-01-01T00:00:00.000Z');
      expect(healthData.uptime).toBe(123.45);
      expect(healthData.environment).toBe('test');
    });

    it('should work with different status values', () => {
      const errorData: HealthCheckData = {
        status: HealthStatus.ERROR,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 0,
        environment: 'production',
      };

      const warningData: HealthCheckData = {
        status: HealthStatus.WARNING,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 999.99,
        environment: 'staging',
      };

      expect(errorData.status).toBe(HealthStatus.ERROR);
      expect(warningData.status).toBe(HealthStatus.WARNING);
    });
  });

  describe('DatabaseHealth interface', () => {
    it('should allow creating objects with correct structure', () => {
      const dbHealth: DatabaseHealth = {
        status: HealthStatus.OK,
        responseTime: 50,
        message: 'Database connection successful',
      };

      expect(dbHealth.status).toBe(HealthStatus.OK);
      expect(dbHealth.responseTime).toBe(50);
      expect(dbHealth.message).toBe('Database connection successful');
    });

    it('should work without optional message property', () => {
      const dbHealth: DatabaseHealth = {
        status: HealthStatus.ERROR,
        responseTime: 5000,
      };

      expect(dbHealth.status).toBe(HealthStatus.ERROR);
      expect(dbHealth.responseTime).toBe(5000);
      expect(dbHealth.message).toBeUndefined();
    });

    it('should work with different status values', () => {
      const okDbHealth: DatabaseHealth = {
        status: HealthStatus.OK,
        responseTime: 10,
      };

      const errorDbHealth: DatabaseHealth = {
        status: HealthStatus.ERROR,
        responseTime: 10000,
        message: 'Connection timeout',
      };

      const warningDbHealth: DatabaseHealth = {
        status: HealthStatus.WARNING,
        responseTime: 1000,
        message: 'Slow response time',
      };

      expect(okDbHealth.status).toBe(HealthStatus.OK);
      expect(errorDbHealth.status).toBe(HealthStatus.ERROR);
      expect(warningDbHealth.status).toBe(HealthStatus.WARNING);
    });
  });

  describe('ServiceHealth interface', () => {
    it('should allow creating objects with correct structure', () => {
      const serviceHealth: ServiceHealth = {
        name: 'auth-service',
        status: HealthStatus.OK,
        responseTime: 25,
        message: 'Service is healthy',
      };

      expect(serviceHealth.name).toBe('auth-service');
      expect(serviceHealth.status).toBe(HealthStatus.OK);
      expect(serviceHealth.responseTime).toBe(25);
      expect(serviceHealth.message).toBe('Service is healthy');
    });

    it('should work without optional message property', () => {
      const serviceHealth: ServiceHealth = {
        name: 'payment-service',
        status: HealthStatus.WARNING,
        responseTime: 500,
      };

      expect(serviceHealth.name).toBe('payment-service');
      expect(serviceHealth.status).toBe(HealthStatus.WARNING);
      expect(serviceHealth.responseTime).toBe(500);
      expect(serviceHealth.message).toBeUndefined();
    });

    it('should work with different service names and statuses', () => {
      const services: ServiceHealth[] = [
        {
          name: 'user-service',
          status: HealthStatus.OK,
          responseTime: 15,
        },
        {
          name: 'notification-service',
          status: HealthStatus.ERROR,
          responseTime: 5000,
          message: 'Service unavailable',
        },
        {
          name: 'analytics-service',
          status: HealthStatus.WARNING,
          responseTime: 2000,
          message: 'High latency detected',
        },
      ];

      expect(services[0].name).toBe('user-service');
      expect(services[0].status).toBe(HealthStatus.OK);
      expect(services[1].name).toBe('notification-service');
      expect(services[1].status).toBe(HealthStatus.ERROR);
      expect(services[2].name).toBe('analytics-service');
      expect(services[2].status).toBe(HealthStatus.WARNING);
    });
  });

  describe('Type compatibility', () => {
    it('should ensure HealthStatus values are compatible across interfaces', () => {
      const healthData: HealthCheckData = {
        status: HealthStatus.OK,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 100,
        environment: 'test',
      };

      const dbHealth: DatabaseHealth = {
        status: healthData.status, // Should be compatible
        responseTime: 50,
      };

      const serviceHealth: ServiceHealth = {
        name: 'test-service',
        status: healthData.status, // Should be compatible
        responseTime: 25,
      };

      expect(dbHealth.status).toBe(healthData.status);
      expect(serviceHealth.status).toBe(healthData.status);
    });
  });
});
