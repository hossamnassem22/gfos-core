import { APIGuard } from "../gateway/APIGuard.ts";
import { ObservabilityMiddleware } from "../gateway/ObservabilityMiddleware.ts";
import { ApiResponse } from "../gateway/ApiResponse.ts";

export function createServer(app: any) {
  app.use(async (req: any, next: any) => {
    const ctx = APIGuard.preHandle(req);

    return ObservabilityMiddleware.wrap(req, async () => {
      req.context = ctx;
      return next();
    });
  });

  app.get("/health", () => {
    return ApiResponse.success({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/", () => {
    return ApiResponse.success({
      service: "GFOS CORE",
      status: "running",
    });
  });
}
