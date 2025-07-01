import { HealthCheck } from '../entities/healthcheck.entity';

export interface IHealthCheckRepository {
  getHealthStatus(): Promise<HealthCheck>;
}
