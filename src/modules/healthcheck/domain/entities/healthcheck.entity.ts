export class HealthCheck {
  constructor(
    public readonly status: string,
    public readonly timestamp: string,
    public readonly uptime: number,
    public readonly environment: string,
    public readonly version: string,
  ) {}

  static create(
    status: string,
    timestamp: string,
    uptime: number,
    environment: string,
    version: string,
  ): HealthCheck {
    return new HealthCheck(status, timestamp, uptime, environment, version);
  }

  isHealthy(): boolean {
    return this.status === 'ok';
  }
}
