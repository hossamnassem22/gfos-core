export interface HealthStatus {
  status: "UP" | "DOWN";
  timestamp: string;
  checks: Record<string, "OK" | "FAIL">;
}

export class HealthCheckManager {
  private checks: Record<string, () => boolean> = {};

  registerCheck(name: string, checkFn: () => boolean) {
    this.checks[name] = checkFn;
  }

  getStatus(): HealthStatus {
    const results: Record<string, "OK" | "FAIL"> = {};
    let isHealthy = true;

    for (const [name, check] of Object.entries(this.checks)) {
      const pass = check();
      results[name] = pass ? "OK" : "FAIL";
      if (!pass) isHealthy = false;
    }

    return {
      status: isHealthy ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      checks: results
    };
  }
}
