import { userService } from "../../../application/boundary/index.ts";

export async function healthRoutes(app: any) {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "GFOS Core",
      timestamp: new Date().toISOString()
    };
  });
}
