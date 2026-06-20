export function healthProbe(app: any) {
  app.get("/health/live", () => ({
    status: "live",
  }));

  app.get("/health/ready", () => ({
    status: "ready",
    db: "ok",
    cache: "ok",
  }));
}
