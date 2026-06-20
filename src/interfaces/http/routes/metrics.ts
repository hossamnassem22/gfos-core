import { Metrics } from "../../../infrastructure/observability/Metrics.ts";

export function metricsRoute(app: any) {
  app.get("/metrics", () => {
    return {
      status: "ok",
      data: Metrics.snapshot(),
    };
  });
}
