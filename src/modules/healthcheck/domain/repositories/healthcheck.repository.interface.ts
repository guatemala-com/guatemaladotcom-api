import { HealthCheck } from '../entities/healthcheck.entity';

export interface HealthCheckRepository {
  getHealthStatus(): Promise<HealthCheck>;
}
