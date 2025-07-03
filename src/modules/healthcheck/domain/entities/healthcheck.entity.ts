export class HealthCheck {
  constructor(
    public readonly status: string,
    public readonly timestamp: string,
    public readonly uptime: number,
    public readonly environment: string,
  ) {}

  static create(
    status: string,
    timestamp: string,
    uptime: number,
    environment: string,
  ): HealthCheck {
    return new HealthCheck(status, timestamp, uptime, environment);
  }

  isHealthy(): boolean {
    return this.status === 'ok';
  }
}
